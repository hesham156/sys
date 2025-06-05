import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOff, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleNotificationClick = async (id: string, taskId?: string) => {
    await markAsRead(id);
    onClose();
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <div className="p-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <h3 className="text-sm font-medium text-blue-800">Notifications</h3>
        <button
          onClick={() => markAllAsRead()}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Check className="h-3 w-3 mr-1" />
          Mark all as read
        </button>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 flex flex-col items-center">
            <BellOff className="h-8 w-8 mb-2 text-gray-400" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li 
                key={notification.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  notification.read ? 'bg-white' : 'bg-blue-50'
                }`}
                onClick={() => handleNotificationClick(notification.id, notification.taskId)}
              >
                <div className="flex items-start">
                  {!notification.read && (
                    <span className="flex-shrink-0 h-2 w-2 mt-1 mr-2 bg-blue-500 rounded-full" />
                  )}
                  <div className={`flex-1 ${notification.read ? 'ml-4' : ''}`}>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;