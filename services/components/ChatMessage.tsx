import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText, BookOpen, User, Bot } from 'lucide-react';
import { Button } from './Button';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const [docCopied, setDocCopied] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const isModel = message.role === 'model';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyToDocs = async () => {
    if (!contentRef.current) return;
    try {
      const htmlContent = contentRef.current.innerHTML;
      const textContent = contentRef.current.innerText;
      
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([textContent], { type: 'text/plain' });
      
      const data = [new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText,
      })];
      
      await navigator.clipboard.write(data);
      setDocCopied(true);
      setTimeout(() => setDocCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      navigator.clipboard.writeText(message.content);
      setDocCopied(true);
      setTimeout(() => setDocCopied(false), 2000);
    }
  };

  return (
    <div className={`flex w-full ${isModel ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[95%] sm:max-w-[90%] gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isModel ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-700 text-white'}`}>
          {isModel ? <Bot size={18} /> : <User size={16} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex-1 rounded-2xl overflow-hidden shadow-sm border
          ${isModel ? 'bg-white border-gray-200' : 'bg-indigo-600 text-white border-indigo-600'}`}>
          
          {/* Header (Only for Model) */}
          {isModel && (
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">NoteSnap AI</span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyToDocs}
                  className="h-7 px-2 text-indigo-600 hover:bg-indigo-50 text-xs"
                  title="Copy for Google Docs"
                >
                  {docCopied ? <Check size={14} className="mr-1" /> : <FileText size={14} className="mr-1" />}
                  Copy for Docs
                </Button>
                <div className="w-px h-4 bg-gray-300 my-auto"></div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="h-7 px-2 text-gray-500 hover:text-gray-700 text-xs"
                  title="Copy Text"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`px-5 py-4 ${isModel ? 'prose prose-indigo max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 text-gray-900' : 'text-white'}`}>
            {isModel ? (
               <div ref={contentRef} dir="auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
               </div>
            ) : (
              <div className="whitespace-pre-wrap font-medium">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};