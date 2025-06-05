import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/TaskCard';
import { Task } from '../types';
import { Search, Filter, X, PlusCircle, AlertTriangle } from 'lucide-react';

const SalesView: React.FC = () => {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'rejected'>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    newTasks: 0,
    rejectedTasks: 0,
    overdueTasks: 0
  });

  useEffect(() => {
    if (tasks.length) {
      // Filter tasks for sales role
      let salesTasks = tasks.filter(task => 
        task.status === 'new' || task.status === 'rejected'
      );
      
      // Apply status filter
      if (statusFilter !== 'all') {
        salesTasks = salesTasks.filter(task => task.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        salesTasks = salesTasks.filter(
          task => 
            task.title.toLowerCase().includes(lowerSearchTerm) ||
            task.description.toLowerCase().includes(lowerSearchTerm) ||
            task.clientName.toLowerCase().includes(lowerSearchTerm)
        );
      }
      
      // Sort by priority and due date
      salesTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate - b.dueDate;
      });
      
      setFilteredTasks(salesTasks);
      
      // Update stats
      const now = Date.now();
      setStats({
        newTasks: tasks.filter(t => t.status === 'new').length,
        rejectedTasks: tasks.filter(t => t.status === 'rejected').length,
        overdueTasks: tasks.filter(t => 
          (t.status === 'new' || t.status === 'rejected') && 
          t.dueDate < now
        ).length
      });
    }
  }, [tasks, searchTerm, statusFilter]);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600">
            Manage client tasks and submissions
          </p>
        </div>
        <Link 
          to="/new-task" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Task
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div 
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
            statusFilter === 'new' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'new' ? 'all' : 'new')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <PlusCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">New Tasks</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.newTasks}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
            statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Rejected Tasks</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.rejectedTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Overdue Tasks</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks by title, description or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'new' | 'rejected')}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="new">New Tasks</option>
              <option value="rejected">Rejected Tasks</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-2">No tasks found</p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;