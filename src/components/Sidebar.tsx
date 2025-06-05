import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PieChart, 
  Settings, 
  Users,
  PlusSquare,
  Tag,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  allowedRoles: UserRole[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { currentUser } = useAuth();

  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      allowedRoles: ['sales', 'designer', 'manager', 'production'],
    },
    {
      to: '/tasks',
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Tasks',
      allowedRoles: ['sales', 'designer', 'manager', 'production'],
    },
    {
      to: '/new-task',
      icon: <PlusSquare className="h-5 w-5" />,
      label: 'New Task',
      allowedRoles: ['sales', 'manager'],
    },
    {
      to: '/reports',
      icon: <PieChart className="h-5 w-5" />,
      label: 'Reports',
      allowedRoles: ['manager'],
    },
    {
      to: '/users',
      icon: <Users className="h-5 w-5" />,
      label: 'Users',
      allowedRoles: ['manager'],
    },
    {
      to: '/categories',
      icon: <Tag className="h-5 w-5" />,
      label: 'Categories',
      allowedRoles: ['manager'],
    },
    {
      to: '/workflow',
      icon: <List className="h-5 w-5" />,
      label: 'Workflow',
      allowedRoles: ['manager'],
    },
    {
      to: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      allowedRoles: ['manager'],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => currentUser && item.allowedRoles.includes(currentUser.role)
  );

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-gray-900 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4">
        <div className="mt-8">
          <nav className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;