import React, { useState, useMemo } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/TaskCard';
import { Task, TaskStatus } from '../types';
import { Search, Filter, X } from 'lucide-react';

const Tasks: React.FC = () => {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'dueDate'>('newest');

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        task => 
          task.title.toLowerCase().includes(lowerSearchTerm) ||
          task.description.toLowerCase().includes(lowerSearchTerm) ||
          task.clientName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'dueDate') {
      filtered.sort((a, b) => a.dueDate - b.dueDate);
    }
    
    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortBy]);

  const renderTasksByStatus = () => {
    const groupedTasks: Record<TaskStatus, Task[]> = {
      new: [],
      design: [],
      review: [],
      approved: [],
      production: [],
      completed: [],
      rejected: []
    };
    
    filteredTasks.forEach(task => {
      groupedTasks[task.status].push(task);
    });
    
    // Determine which statuses to show based on user role
    const visibleStatuses: TaskStatus[] = [];
    
    if (currentUser?.role === 'sales') {
      visibleStatuses.push('new', 'rejected');
    } else if (currentUser?.role === 'designer') {
      visibleStatuses.push('design');
    } else if (currentUser?.role === 'manager') {
      visibleStatuses.push('new', 'design', 'review', 'approved', 'production', 'completed', 'rejected');
    } else if (currentUser?.role === 'production') {
      visibleStatuses.push('approved', 'production', 'completed');
    }
    
    return (
      <div className="space-y-8">
        {visibleStatuses.map(status => (
          <div key={status}>
            <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
              {status === 'new' ? 'New Tasks' : `${status} Tasks`}
            </h3>
            {groupedTasks[status].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedTasks[status].map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                No {status} tasks found
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">
          Manage and track all printing tasks
        </p>
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
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="design">Design</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="production">Production</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'dueDate')}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="dueDate">Due Date</option>
              </select>
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
        <>
          {statusFilter !== 'all' ? (
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 mb-2">No tasks found matching your filters</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            renderTasksByStatus()
          )}
        </>
      )}
    </div>
  );
};

export default Tasks;