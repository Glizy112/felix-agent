import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, CheckCircle, Clock, Calendar, Target } from 'lucide-react';

function DashboardPage() {
  const [todayStats, setTodayStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [todayRes, weeklyRes, summaryRes] = await Promise.all([
        analyticsAPI.getTodayStats(),
        analyticsAPI.getWeeklyStats(),
        analyticsAPI.getSummary(),
      ]);
      setTodayStats(todayRes.data);
      setWeeklyStats(weeklyRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="text-green-500" size={20} />;
    if (trend === 'declining') return <TrendingDown className="text-red-500" size={20} />;
    return <Minus className="text-gray-400" size={20} />;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Productivity Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your efficiency and growth</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary?.completed_tasks || 0}</p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasks Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{summary?.pending_tasks || 0}</p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Calendar Events</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{summary?.total_events || 0}</p>
            </div>
            <Calendar size={32} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{summary?.completion_rate || 0}%</p>
            </div>
            <Target size={32} className="text-primary-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Weekly Tasks Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Task Completion</h2>
          {weeklyStats && weeklyStats.daily_breakdown && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyStats.daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks_completed" fill="#0ea5e9" name="Completed" />
                <Bar dataKey="tasks_created" fill="#8b5cf6" name="Created" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Efficiency Trend</h2>
            {weeklyStats && (
              <div className="flex items-center gap-2">
                {getTrendIcon(weeklyStats.trend)}
                <span className="text-sm font-medium text-gray-600 capitalize">{weeklyStats.trend}</span>
              </div>
            )}
          </div>
          {weeklyStats && weeklyStats.daily_breakdown && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyStats.daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="efficiency_score" stroke="#0ea5e9" strokeWidth={2} name="Efficiency %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Today's Stats */}
      {todayStats && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{todayStats.tasks_completed}</p>
              <p className="text-sm text-gray-500 mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{todayStats.tasks_pending}</p>
              <p className="text-sm text-gray-500 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{todayStats.tasks_created}</p>
              <p className="text-sm text-gray-500 mt-1">Created</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <p className="text-2xl font-bold text-primary-600">{todayStats.efficiency_score}%</p>
              <p className="text-sm text-gray-500 mt-1">Efficiency</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks by Source */}
      {summary && summary.tasks_by_source && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Source</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Manual Tasks</span>
                <span className="text-sm font-medium text-gray-800">{summary.tasks_by_source.manual}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${summary.total_tasks > 0 ? (summary.tasks_by_source.manual / summary.total_tasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Agent-Suggested Tasks</span>
                <span className="text-sm font-medium text-gray-800">{summary.tasks_by_source.agent}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-500 h-3 rounded-full"
                  style={{ width: `${summary.total_tasks > 0 ? (summary.tasks_by_source.agent / summary.total_tasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;