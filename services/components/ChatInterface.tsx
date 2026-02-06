import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Layers } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatMessage as ChatMessageType, ProcessingStatus } from '../../types';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  status: ProcessingStatus;
  onSendMessage: (text: string) => void;
  fileCount: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  status, 
  onSendMessage,
  fileCount
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    // Only scroll if there are messages to avoid page jumping on load
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Focus input after a model message arrives
    if (messages.length > 0 && messages[messages.length - 1].role === 'model') {
       inputRef.current?.focus();
    }
  }, [messages, status]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || status === ProcessingStatus.PROCESSING) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only submit on Ctrl+Enter or Cmd+Enter to allow new lines with just Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4">
        
        {/* Empty State Placeholder - Only visible if no messages */}
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <Layers className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">NoteSnap Assistant</h3>
              <p className="max-w-xs text-sm text-gray-500 mb-6">
                Upload pages to extract notes, or start chatting below. I can help organize, summarize, and format your study materials.
              </p>
           </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {status === ProcessingStatus.PROCESSING && (
          <div className="flex w-full justify-start mb-6 animate-pulse">
            <div className="flex max-w-[90%] gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                <Sparkles size={16} className="text-indigo-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm text-gray-500 text-sm flex items-center gap-2">
                 <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 z-10">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none rounded-xl border-gray-300 bg-gray-50 pl-4 pr-12 py-3 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
            rows={1}
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || status === ProcessingStatus.PROCESSING}
            className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title="Send Message (Ctrl + Enter)"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="text-center mt-2 flex items-center justify-center gap-4">
            <span className="text-xs text-gray-400 hidden sm:inline">Ctrl + Enter to send</span>
            <span className="text-xs text-gray-400 sm:hidden">Tap icon to send</span>
        </div>
      </div>
    </div>
  );
};