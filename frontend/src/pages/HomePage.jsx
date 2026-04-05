import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Calendar, Bot, LayoutDashboard, ArrowRight } from 'lucide-react';

function HomePage() {
  const features = [
    {
      icon: CheckSquare,
      title: 'Smart Task Manager',
      description: 'Intelligent task queue with auto-priority scoring based on deadlines and your work patterns.',
      link: '/tasks',
      color: 'bg-blue-500',
    },
    {
      icon: Calendar,
      title: 'Calendar Integration',
      description: 'Seamlessly connects with Google Calendar via MCP to sync your events and schedule.',
      link: '/calendar',
      color: 'bg-green-500',
    },
    {
      icon: Bot,
      title: 'Workflow Agent',
      description: 'AI-powered agent that suggests tasks, analyzes your schedule, and helps you stay productive.',
      link: '/agent',
      color: 'bg-purple-500',
    },
    {
      icon: LayoutDashboard,
      title: 'Productivity Dashboard',
      description: 'Visual analytics showing your daily, weekly, and monthly productivity trends.',
      link: '/dashboard',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Felix</h1>
        <p className="text-xl text-primary-100 mb-6">
          Your personal productivity agent that intelligently manages tasks, schedules, and workflows.
        </p>
        <div className="flex gap-4">
          <Link
            to="/agent"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
          >
            <Bot size={20} />
            Talk to Felix
          </Link>
          <Link
            to="/tasks"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-400 transition-colors flex items-center gap-2"
          >
            <CheckSquare size={20} />
            Manage Tasks
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Core Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`${feature.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:text-primary-700"
                  >
                    Explore <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">How Felix Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Connect Your Tools</h3>
            <p className="text-sm text-gray-600">Link Google Calendar, Tasks, and other tools via MCP integration.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Let Felix Learn</h3>
            <p className="text-sm text-gray-600">The agent learns your work patterns and intelligently prioritizes tasks.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Stay Productive</h3>
            <p className="text-sm text-gray-600">Get smart suggestions, track progress, and optimize your workflow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;