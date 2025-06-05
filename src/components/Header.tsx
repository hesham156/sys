import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Printer, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../contexts/NotificationContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getRoleColor = () => {
    switch(currentUser?.role) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'designer': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-green-100 text-green-800';
      case 'production': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6\" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6\" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <Link to="/dashboard" className="flex items-center ml-4 md:ml-0">
              <Printer className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PrintTaskFlow</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <div className="relative">
                  <button
                    type="button"
                    className="relative rounded-full p-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && <NotificationDropdown onClose={() => setShowNotifications(false)} />}
                </div>
                
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:block ml-2 text-gray-700">{currentUser.displayName}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{currentUser.displayName}</p>
                          <p className="text-xs text-gray-500">{currentUser.email}</p>
                          <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded ${getRoleColor()}`}>
                            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                          </span>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <button
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;