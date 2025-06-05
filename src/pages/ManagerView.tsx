import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  FileBarChart, 
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Settings
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { Task, TaskStatus } from '../types';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import TaskCard from '../components/TaskCard';

ChartJS.register(...registerables);

const ManagerView: React.FC = () => {
  const { tasks } = useTasks();
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    needsReview: 0
  });

  useEffect(() => {
    if (tasks.length) {
      const now = Date.now();
      const totalTasks = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const inProgress = tasks.filter(task => 
        ['new', 'design', 'approved', 'production'].includes(task.status)
      ).length;
      const overdue = tasks.filter(task => 
        task.dueDate < now && task.status !== 'completed'
      ).length;
      const needsReview = tasks.filter(task => task.status === 'review').length;
      
      setStats({
        totalTasks,
        inProgress,
        completed,
        overdue,
        needsReview
      });
    }
  }, [tasks]);

  const getStatusData = () => {
    const statusCounts = {
      new: 0,
      design: 0,
      review: 0,
      approved: 0,
      production: 0,
      completed: 0,
      rejected: 0,
    };
    
    tasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }
    });
    
    return {
      labels: [
        'New', 'Design', 'Review', 'Approved', 'Production', 'Completed', 'Rejected'
      ],
      datasets: [
        {
          label: 'Tasks by Status',
          data: [
            statusCounts.new,
            statusCounts.design,
            statusCounts.review,
            statusCounts.approved,
            statusCounts.production,
            statusCounts.completed,
            statusCounts.rejected,
          ],
          backgroundColor: [
            '#3B82F6', // blue
            '#A855F7', // purple
            '#FBBF24', // yellow
            '#10B981', // green
            '#F97316', // orange
            '#06B6D4', // teal
            '#EF4444', // red
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getDepartmentPerformanceData = () => {
    // Calculate average time spent in each department
    const departmentTimes = {
      sales: 0,
      design: 0,
      review: 0,
      production: 0
    };
    
    let salesCount = 0;
    let designCount = 0;
    let reviewCount = 0;
    let productionCount = 0;
    
    tasks.forEach(task => {
      if (!task.history || task.history.length < 2) return;
      
      const history = [...task.history].sort((a, b) => a.timestamp - b.timestamp);
      
      // Calculate time in each status
      let lastTimestamp = history[0].timestamp;
      let lastStatus: TaskStatus | undefined = undefined;
      
      history.forEach(entry => {
        if (entry.fromStatus && entry.toStatus) {
          const timeSpent = entry.timestamp - lastTimestamp;
          
          if (lastStatus === 'new' || lastStatus === 'rejected') {
            departmentTimes.sales += timeSpent;
            salesCount++;
          } else if (lastStatus === 'design') {
            departmentTimes.design += timeSpent;
            designCount++;
          } else if (lastStatus === 'review') {
            departmentTimes.review += timeSpent;
            reviewCount++;
          } else if (lastStatus === 'approved' || lastStatus === 'production') {
            departmentTimes.production += timeSpent;
            productionCount++;
          }
          
          lastTimestamp = entry.timestamp;
          lastStatus = entry.toStatus;
        }
      });
    });
    
    // Convert to average hours
    const avgSales = salesCount > 0 ? departmentTimes.sales / salesCount / (1000 * 60 * 60) : 0;
    const avgDesign = designCount > 0 ? departmentTimes.design / designCount / (1000 * 60 * 60) : 0;
    const avgReview = reviewCount > 0 ? departmentTimes.review / reviewCount / (1000 * 60 * 60) : 0;
    const avgProduction = productionCount > 0 ? departmentTimes.production / productionCount / (1000 * 60 * 60) : 0;
    
    return {
      labels: ['Sales', 'Design', 'Review', 'Production'],
      datasets: [
        {
          label: 'Average Time (hours)',
          data: [avgSales, avgDesign, avgReview, avgProduction],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(251, 191, 36, 0.7)',
            'rgba(249, 115, 22, 0.7)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(251, 191, 36)',
            'rgb(249, 115, 22)'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  const getTasksNeedingReview = () => {
    return tasks
      .filter(task => task.status === 'review')
      .sort((a, b) => a.dueDate - b.dueDate);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">
          Complete overview of all printing tasks and system performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Total Tasks</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">In Progress</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <FileBarChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Needs Review</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.needsReview}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Completed</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Overdue</h4>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Task Status Overview</h3>
            <div className="flex items-center text-sm text-blue-600">
              <PieChart className="h-4 w-4 mr-1" />
              <Link to="/reports">Full Report</Link>
            </div>
          </div>
          <div className="h-72">
            <Pie 
              data={getStatusData()} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Department Performance</h3>
            <div className="flex items-center text-sm text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <Link to="/reports">View Details</Link>
            </div>
          </div>
          <div className="h-72">
            <Bar 
              data={getDepartmentPerformanceData()} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.raw.toFixed(1)} hours`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Average Time (hours)'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Tasks Needing Review</h3>
            <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800">
              View All Tasks
            </Link>
          </div>
          <div className="space-y-4">
            {getTasksNeedingReview().slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {getTasksNeedingReview().length === 0 && (
              <p className="text-gray-500 text-center py-4">No tasks need review</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/new-task" 
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
            >
              Create New Task
            </Link>
            <Link 
              to="/users" 
              className="block w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
            >
              <div className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </div>
            </Link>
            <Link 
              to="/settings" 
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
            >
              <div className="flex items-center justify-center">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;