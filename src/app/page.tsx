'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

export default function CodeAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 120; // 4 lines (assuming line-height ~30px)
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      id: generateId()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || data.error || 'No response from server',
        timestamp: new Date(),
        id: generateId()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error connecting to the server',
          timestamp: new Date(),
          id: generateId()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) {
        saveEdit();
      } else {
        sendMessage();
      }
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);
  const startEdit = (message: ChatMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const saveEdit = () => {
    if (!editingMessageId) return;
    setMessages(prev => prev.map(msg => msg.id === editingMessageId ? { ...msg, content: editContent } : msg));
    setEditingMessageId(null);
    setEditContent('');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">Your local Assistant+</h1>
          </div>
          <div className="text-gray-400 text-md">
            Model: Ollama2.3:3b
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`relative max-w-[85%] rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-blue-600/90 text-white' : 'bg-gray-800/80'}`}>
                {editingMessageId === message.id ? (
                  <>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-gray-100"
                      rows={5}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button onClick={cancelEdit} className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-500">Cancel</button>
                      <button onClick={saveEdit} className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500">Save</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="prose prose-invert max-w-none overflow-hidden">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs opacity-70">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
                        <button onClick={() => copyToClipboard(message.content)} className="text-xs p-1 hover:bg-gray-700/50 rounded" title="Copy">📋</button>
                        {message.role === 'user' && (
                          <button onClick={() => startEdit(message)} className="text-xs p-1 hover:bg-gray-700/50 rounded" title="Edit">✏️</button>
                        )}
                        <button onClick={() => deleteMessage(message.id)} className="text-xs p-1 hover:bg-gray-700/50 rounded" title="Delete">🗑️</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 rounded-lg px-4 py-3 max-w-[85%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-400"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about programming..."
              className="w-full bg-gray-700 rounded-lg px-4 py-3 pr-12 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none overflow-y-auto"
              rows={1}
              style={{ minHeight: '56px' }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 bottom-3 p-1 rounded-md ${isLoading || !input.trim() ? 'text-gray-500' : 'text-blue-400 hover:bg-blue-500/20'}`}
            >
              ➤
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Warning: this model AI_NAYAK may generate incorrect information.
          </p>
        </div>
      </div>
    </div>
  );
}