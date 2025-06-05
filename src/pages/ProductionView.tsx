import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/TaskCard';
import { Task, TaskStatus } from '../types';
import { Search, Filter, X, CheckCircle, Clock, Printer } from 'lucide-react';

const ProductionView: React.FC = () => {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    approved: 0,
    inProduction: 0,
    completed: 0
  });

  useEffect(() => {
    if (tasks.length) {
      // Filter tasks for production role
      let productionTasks = tasks.filter(task => 
        ['approved', 'production', 'completed'].includes(task.status)
      );
      
      // Apply status filter
      if (statusFilter !== 'all') {
        productionTasks = productionTasks.filter(task => task.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        productionTasks = productionTasks.filter(
          task => 
            task.title.toLowerCase().includes(lowerSearchTerm) ||
            task.description.toLowerCase().includes(lowerSearchTerm) ||
            task.clientName.toLowerCase().includes(lowerSearchTerm)
        );
      }
      
      // Sort by priority and due date
      productionTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate - b.dueDate;
      });
      
      setFilteredTasks(productionTasks);
      
      // Update stats
      setStats({
        approved: tasks.filter(t => t.status === 'approved').length,
        inProduction: tasks.filter(t => t.status === 'production').length,
        completed: tasks.filter(t => t.status === 'completed').length
      });
    }
  }, [tasks, searchTerm, statusFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Production Tasks</h1>
        <p className="text-gray-600">
          Manage and track tasks in the production phase
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div 
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
            statusFilter === 'approved' ? 'ring-2 ring-orange-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Awaiting Production</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.approved}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
            statusFilter === 'production' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'production' ? 'all' : 'production')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Printer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">In Production</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.inProduction}</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${
            statusFilter === 'completed' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Completed</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.completed}</p>
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
              placeholder="Search production tasks..."
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Production Tasks</option>
              <option value="approved">Awaiting Production</option>
              <option value="production">In Production</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading production tasks...</p>
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
                <p className="text-gray-500 mb-2">No production tasks found</p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="text-orange-600 hover:text-orange-800 font-medium"
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

export default ProductionView;