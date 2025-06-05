import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (
        isSidebarOpen &&
        !target.closest('[data-sidebar]') &&
        !target.closest('[data-sidebar-toggle]')
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on window size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div data-sidebar>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div data-sidebar-toggle>
          <Header 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen} 
          />
        </div>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-10 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;