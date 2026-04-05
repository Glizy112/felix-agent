import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../api';
import { Plus, Trash2, Check, X, Edit2, AlertCircle, Clock, Flag } from 'lucide-react';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 5,
    due_date: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksAPI.update(editingTask.id, formData);
      } else {
        await tasksAPI.create(formData);
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date || '',
      status: task.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await tasksAPI.complete(id);
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 5, due_date: '', status: 'pending' });
    setEditingTask(null);
    setShowForm(false);
  };

  const getPriorityColor = (score) => {
    if (score >= 8) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <Check size={16} className="text-green-500" />;
    if (status === 'in_progress') return <Clock size={16} className="text-blue-500" />;
    return <AlertCircle size={16} className="text-gray-400" />;
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart Task Manager</h1>
          <p className="text-gray-500 mt-1">Manage and prioritize your tasks intelligently</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Flag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No tasks yet</h3>
            <p className="text-gray-500 mt-1">Create your first task to get started</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow ${
                task.status === 'completed' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleComplete(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {task.status === 'completed' && <Check size={14} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority_score)}`}>
                      Priority: {task.priority_score}
                    </span>
                    {task.source === 'agent' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        Agent
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Due: {task.due_date}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksPage;