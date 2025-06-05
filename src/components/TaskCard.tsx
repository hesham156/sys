import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Task, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'production':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-teal-100 text-teal-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.dueDate < Date.now() && task.status !== 'completed';

  const getNextActionText = (role: UserRole, status: string): string => {
    if (role === 'sales') {
      if (status === 'new' || status === 'rejected') {
        return 'Send to Design';
      }
    } else if (role === 'designer') {
      if (status === 'design') {
        return 'Send for Review';
      }
    } else if (role === 'manager') {
      if (status === 'review') {
        return 'Approve or Reject';
      }
    } else if (role === 'production') {
      if (status === 'approved') {
        return 'Start Production';
      } else if (status === 'production') {
        return 'Mark as Completed';
      }
    }
    return 'View Details';
  };

  const nextActionText = currentUser ? getNextActionText(currentUser.role, task.status) : 'View Details';

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">Client: {task.clientName}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 text-sm">
          <p className="text-gray-600 line-clamp-2">{task.description}</p>
        </div>
      </div>
      
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>
            {task.dueDate 
              ? format(new Date(task.dueDate), 'MMM d, yyyy')
              : 'No due date'}
          </span>
          
          {isOverdue && (
            <div className="flex items-center ml-3 text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>Overdue</span>
            </div>
          )}
        </div>
        
        <button 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tasks/${task.id}`);
          }}
        >
          {nextActionText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;