import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from './services/components/FileUploader';
import { ChatInterface } from './services/components/ChatInterface';
import { Button } from './services/components/Button';
import { Header } from './services/components/Header';
import { initializeChatSession, sendImageAnalysisRequest, sendChatMessage } from './services/geminiService';
import { AppState, ProcessingStatus, ChatMessage } from './types';
import { Sparkles, Languages, AlertCircle } from 'lucide-react';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    uploadedFiles: [],
    status: ProcessingStatus.IDLE,
    messages: [],
    error: null,
    options: {
      includeBanglaExplanation: false,
    },
  });

  const chatSessionRef = useRef<Chat | null>(null);

  // Helper to ensure we have a session
  const getOrCreateSession = () => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = initializeChatSession();
    }
    return chatSessionRef.current;
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      state.uploadedFiles.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, []); 

  const handleFilesSelected = (files: File[]) => {
    const newUploadedFiles = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setState(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newUploadedFiles],
      error: null,
    }));
  };

  const handleRemoveFile = (id: string) => {
    setState(prev => {
      const fileToRemove = prev.uploadedFiles.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return {
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(f => f.id !== id),
      };
    });
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
       chatSessionRef.current = null;
       setState(prev => ({ ...prev, messages: [], error: null, status: ProcessingStatus.IDLE }));
    }
  };

  const handleProcess = async () => {
    if (state.uploadedFiles.length === 0) return;

    const session = getOrCreateSession();

    // Add a user message to indicate processing started
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Analyzing ${state.uploadedFiles.length} uploaded page${state.uploadedFiles.length !== 1 ? 's' : ''}...`,
      timestamp: Date.now(),
    };

    setState(prev => ({ 
      ...prev, 
      status: ProcessingStatus.PROCESSING, 
      error: null,
      messages: [...prev.messages, userMessage]
    }));

    try {
      // Convert all files to base64 in parallel
      const imagePromises = state.uploadedFiles.map(async (uploadedFile) => {
        return new Promise<{ base64: string; mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({
              base64,
              mimeType: uploadedFile.file.type
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile.file);
        });
      });

      const images = await Promise.all(imagePromises);

      const responseText = await sendImageAnalysisRequest(
        session,
        images, 
        state.options.includeBanglaExplanation
      );

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        status: ProcessingStatus.SUCCESS,
        messages: [...prev.messages, modelMessage],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: ProcessingStatus.ERROR,
        error: error.message || "An unexpected error occurred.",
      }));
    }
  };

  const handleSendMessage = async (text: string) => {
    const session = getOrCreateSession();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      status: ProcessingStatus.PROCESSING,
    }));

    try {
      const responseText = await sendChatMessage(session, text);
      
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, modelMessage],
        status: ProcessingStatus.SUCCESS,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: ProcessingStatus.ERROR,
        error: error.message || "Failed to get response.",
      }));
    }
  };

  const toggleBangla = () => {
    setState(prev => ({
      ...prev,
      options: {
        ...prev.options,
        includeBanglaExplanation: !prev.options.includeBanglaExplanation
      }
    }));
  };

  return (
    // Changed: Use min-h-screen instead of fixed inset-0 on mobile to allow scrolling
    <div className="flex flex-col min-h-screen bg-gray-50 lg:h-screen lg:overflow-hidden">
      
      <Header hasMessages={state.messages.length > 0} onClearChat={handleClearChat} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 lg:overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column: Input & Options */}
          {/* On mobile: auto height. On desktop: full height with scroll */}
          <div className="lg:col-span-4 lg:h-full lg:overflow-y-auto pr-0 lg:pr-2 order-1">
            <div className="space-y-6">
              {/* Upload Section */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Document Pages</h2>
                  <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {state.uploadedFiles.length} file{state.uploadedFiles.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <FileUploader 
                  onFilesSelected={handleFilesSelected} 
                  uploadedFiles={state.uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                />
                
                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${state.options.includeBanglaExplanation ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                      {state.options.includeBanglaExplanation && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={state.options.includeBanglaExplanation}
                      onChange={toggleBangla}
                    />
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Languages size={16} className="text-indigo-600" />
                      <span>Include Bangla Explanation</span>
                    </div>
                  </label>
                </div>

                <div className="mt-6">
                  <Button 
                    className="w-full justify-center text-lg py-3" 
                    disabled={state.uploadedFiles.length === 0 || state.status === ProcessingStatus.PROCESSING}
                    onClick={handleProcess}
                    isLoading={state.status === ProcessingStatus.PROCESSING}
                  >
                    Process {state.uploadedFiles.length > 0 ? `${state.uploadedFiles.length} Pages` : ''}
                  </Button>
                </div>
              </section>

              {/* Tips */}
              <section className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                <h3 className="text-indigo-900 font-semibold mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  How to use
                </h3>
                <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside">
                  <li>Upload images on the left.</li>
                  <li>Click <strong>Process</strong> to extract notes.</li>
                  <li>Use the chat on the right to refine, summarize, or format the results.</li>
                  <li>You can chat anytime, even while uploading!</li>
                </ul>
              </section>

              {state.status === ProcessingStatus.ERROR && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Error</h3>
                    <p className="text-sm mt-1">{state.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Chat Interface */}
          {/* On mobile: Height is 500px, creating scrollable page. On desktop: full height */}
          <div className="lg:col-span-8 h-[500px] lg:h-full order-2">
            <ChatInterface 
              messages={state.messages} 
              status={state.status}
              onSendMessage={handleSendMessage}
              fileCount={state.uploadedFiles.length}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default App;