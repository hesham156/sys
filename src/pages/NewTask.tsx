import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { format } from 'date-fns';

const NewTask: React.FC = () => {
  const navigate = useNavigate();
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !clientName) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const taskData = {
        title,
        description,
        clientName,
        priority,
        status: 'new' as const,
        dueDate: dueDate ? new Date(dueDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000, // Default to 1 week from now
      };
      
      const taskId = await addTask(taskData);
      navigate(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Create New Task</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add a new printing task to the system
        </p>
      </div>
      
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Provide detailed information about the printing task"
              required
            />
          </div>
          
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name *
            </label>
            <input
              type="text"
              id="client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarDays className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="due-date"
                value={dueDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave blank for default due date (1 week from today)
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTask;