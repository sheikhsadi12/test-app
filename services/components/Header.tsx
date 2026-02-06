import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  hasMessages: boolean;
  onClearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasMessages, onClearChat }) => {
  return (
    <header className="bg-white border-b border-gray-200 shrink-0 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">NoteSnap AI</h1>
        </div>
        <div className="flex items-center gap-4">
          {hasMessages && (
            <button 
              onClick={onClearChat}
              className="text-gray-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={14} /> Clear Chat
            </button>
          )}
        </div>
      </div>
    </header>
  );
};