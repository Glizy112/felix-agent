import React, { useState, useEffect, useRef } from 'react';
import { agentAPI, tasksAPI } from '../api';
import { Bot, Send, Sparkles, Plus, Loader2 } from 'lucide-react';

function AgentPage() {
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: "Hi! I'm Felix, your personal productivity agent. I can help you manage tasks, check your calendar, and suggest actions based on your schedule. Try asking me about your calendar or tasks!",
      suggestions: [
        { action: 'view_tasks', label: 'View my tasks' },
        { action: 'view_calendar', label: "What's on my calendar?" },
        { action: 'view_dashboard', label: 'Show productivity' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    const message = messageText || input;
    if (!message.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await agentAPI.chat(message);
      const agentMessage = {
        role: 'agent',
        content: response.data.response,
        suggestions: response.data.suggestions || [],
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error chatting with agent:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: "Sorry, I encountered an error. Please try again.", suggestions: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = async (suggestion) => {
    if (suggestion.action === 'create_task' && suggestion.title) {
      try {
        await tasksAPI.create({
          title: suggestion.title,
          description: suggestion.description || '',
          priority: suggestion.priority || 5,
          due_date: suggestion.due_date || null,
          source: 'agent',
        });
        setMessages((prev) => [
          ...prev,
          { role: 'agent', content: `Task "${suggestion.title}" has been created!`, suggestions: [] },
        ]);
      } catch (error) {
        console.error('Error creating task:', error);
      }
    } else if (suggestion.action === 'view_tasks') {
      sendMessage('Show my pending tasks');
    } else if (suggestion.action === 'view_calendar') {
      sendMessage("What's on my calendar?");
    } else if (suggestion.action === 'view_dashboard') {
      sendMessage('Show my productivity summary');
    } else if (suggestion.action === 'sync_calendar') {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', content: "Syncing your calendar...", suggestions: [] },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Felix Agent</h1>
        <p className="text-gray-500 mt-1">Your AI-powered productivity assistant</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : ''}`}>
                {msg.role === 'agent' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={16} className="text-primary-600" />
                    <span className="text-xs font-medium text-gray-500">Felix</span>
                  </div>
                )}
                <div
                  className={`rounded-xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(suggestion)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors"
                      >
                        <Plus size={14} />
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Felix is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Felix anything about your tasks or schedule..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </div>
          
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => sendMessage("What's on my calendar today?")}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Sparkles size={12} className="inline mr-1" />
              What's on my calendar?
            </button>
            <button
              onClick={() => sendMessage('Show my pending tasks')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Sparkles size={12} className="inline mr-1" />
              Show pending tasks
            </button>
            <button
              onClick={() => sendMessage('How is my productivity?')}
              className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Sparkles size={12} className="inline mr-1" />
              Productivity check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentPage;