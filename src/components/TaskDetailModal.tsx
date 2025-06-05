import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Send, Clock, AlertTriangle, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { Task, TaskStatus, Comment } from '../types';
import LoadingScreen from './LoadingScreen';

const statusMap = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  design: { label: 'Design', color: 'bg-purple-100 text-purple-800' },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  production: { label: 'Production', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-teal-100 text-teal-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
};

const TaskDetailModal: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { tasks, updateTaskStatus, addTaskComment } = useTasks();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (tasks.length > 0 && taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask || null);
      setLoading(false);
    }
  }, [tasks, taskId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleStatusChange = (status: TaskStatus) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!task || !newStatus) return;
    
    try {
      await updateTaskStatus(task.id, newStatus, statusComment);
      setShowStatusModal(false);
      setStatusComment('');
      setNewStatus(null);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!task || !comment.trim()) return;
    
    try {
      await addTaskComment(task.id, comment);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getAvailableStatusTransitions = (): { status: TaskStatus; label: string }[] => {
    if (!task || !currentUser) return [];
    
    const currentStatus = task.status;
    
    if (currentUser.role === 'sales') {
      if (currentStatus === 'new' || currentStatus === 'rejected') {
        return [{ status: 'design', label: 'Send to Design' }];
      }
    } else if (currentUser.role === 'designer') {
      if (currentStatus === 'design') {
        return [
          { status: 'review', label: 'Send for Review' },
          { status: 'rejected', label: 'Return to Sales' }
        ];
      }
    } else if (currentUser.role === 'manager') {
      if (currentStatus === 'review') {
        return [
          { status: 'approved', label: 'Approve' },
          { status: 'rejected', label: 'Reject' },
          { status: 'design', label: 'Return to Design' }
        ];
      } else {
        // Managers can change status to anything
        return [
          { status: 'new', label: 'New' },
          { status: 'design', label: 'Design' },
          { status: 'review', label: 'Review' },
          { status: 'approved', label: 'Approved' },
          { status: 'production', label: 'Production' },
          { status: 'completed', label: 'Completed' },
          { status: 'rejected', label: 'Rejected' }
        ].filter(s => s.status !== currentStatus);
      }
    } else if (currentUser.role === 'production') {
      if (currentStatus === 'approved') {
        return [{ status: 'production', label: 'Start Production' }];
      } else if (currentStatus === 'production') {
        return [{ status: 'completed', label: 'Mark as Completed' }];
      }
    }
    
    return [];
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full">
          <h2 className="text-xl font-semibold mb-4">Task Not Found</h2>
          <p>The task you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = task.dueDate < Date.now() && task.status !== 'completed';
  const availableTransitions = getAvailableStatusTransitions();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 w-full max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[task.status].color}`}>
                  {statusMap[task.status].label}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-600">Client: {task.clientName}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>
              
              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({task.comments?.length || 0})
                </h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment: Comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-gray-900">
                            {/* In a real app, fetch user details */}
                            User
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No comments yet</p>
                  )}
                </div>
                
                <div className="mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-grow">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      className={`px-4 py-2 rounded-md flex items-center ${
                        comment.trim()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Task Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <span className={`font-medium ${
                      task.priority === 'high' ? 'text-red-600' : 
                      task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Due Date:</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="font-medium">
                        {task.dueDate 
                          ? format(new Date(task.dueDate), 'MMM d, yyyy')
                          : 'No due date'}
                      </span>
                    </div>
                  </div>
                  {isOverdue && (
                    <div className="flex items-center text-red-600 mt-1">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span>Overdue</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">
                      {format(new Date(task.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              {availableTransitions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Actions</h3>
                  <div className="space-y-2">
                    {availableTransitions.map((transition) => (
                      <button
                        key={transition.status}
                        onClick={() => handleStatusChange(transition.status)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
                      >
                        {transition.status === 'rejected' ? (
                          <ArrowLeft className="h-4 w-4 mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        {transition.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Task History */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {task.history && task.history.length > 0 ? (
                    task.history.map((entry) => (
                      <div key={entry.id} className="pb-2 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{entry.action}</span>
                          <span className="text-gray-500">
                            {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {entry.comment && (
                          <p className="text-xs text-gray-600 mt-1">{entry.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">No activity yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              Change Status to {statusMap[newStatus as TaskStatus].label}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add a comment (optional)
              </label>
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Explain why you're changing the status..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailModal;