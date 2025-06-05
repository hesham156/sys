import React, { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/TaskCard';
import { Task } from '../types';
import { Search, Filter, X } from 'lucide-react';

const DesignView: React.FC = () => {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (tasks.length) {
      // Filter tasks for design role
      let designTasks = tasks.filter(task => task.status === 'design');
      
      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        designTasks = designTasks.filter(
          task => 
            task.title.toLowerCase().includes(lowerSearchTerm) ||
            task.description.toLowerCase().includes(lowerSearchTerm) ||
            task.clientName.toLowerCase().includes(lowerSearchTerm)
        );
      }
      
      // Sort by priority and due date
      designTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.dueDate - b.dueDate;
      });
      
      setFilteredTasks(designTasks);
    }
  }, [tasks, searchTerm]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Design Tasks</h1>
        <p className="text-gray-600">
          Manage and work on tasks assigned to the design team
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
              placeholder="Search design tasks..."
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
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading design tasks...</p>
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
                <p className="text-gray-500 mb-2">No design tasks found</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear search
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

export default DesignView;