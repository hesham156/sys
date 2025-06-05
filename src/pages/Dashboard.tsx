import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  FileBarChart, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import TaskCard from '../components/TaskCard';

ChartJS.register(...registerables);

const Dashboard: React.FC = () => {
  const { tasks } = useTasks();
  const { currentUser } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  useEffect(() => {
    if (tasks.length) {
      // Get recent tasks
      const sorted = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
      setRecentTasks(sorted.slice(0, 5));
      
      // Calculate stats
      const now = Date.now();
      const totalTasks = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      const inProgress = tasks.filter(task => task.status !== 'completed').length;
      const overdue = tasks.filter(task => task.dueDate < now && task.status !== 'completed').length;
      
      setStats({
        totalTasks,
        inProgress,
        completed,
        overdue,
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

  const getPriorityData = () => {
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    
    tasks.forEach(task => {
      priorityCounts[task.priority]++;
    });
    
    return {
      labels: ['Low', 'Medium', 'High'],
      datasets: [
        {
          label: 'Tasks by Priority',
          data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
          backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyTasksData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = Array(6).fill(0).map((_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();
    
    const taskCounts = Array(6).fill(0);
    const completedCounts = Array(6).fill(0);
    
    tasks.forEach(task => {
      const taskDate = new Date(task.createdAt);
      const taskMonth = taskDate.getMonth();
      const monthsAgo = (currentMonth - taskMonth + 12) % 12;
      
      if (monthsAgo < 6) {
        const index = 5 - monthsAgo;
        taskCounts[index]++;
        
        if (task.status === 'completed') {
          completedCounts[index]++;
        }
      }
    });
    
    return {
      labels: last6Months,
      datasets: [
        {
          label: 'New Tasks',
          data: taskCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Completed Tasks',
          data: completedCounts,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Customized dashboard based on user role
  const renderRoleSpecificDashboard = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
      case 'sales':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">New and Rejected Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'new' || t.status === 'rejected').slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.filter(t => t.status === 'new' || t.status === 'rejected').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No new or rejected tasks</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Client Distribution</h3>
                <div className="h-64">
                  <Pie 
                    data={getPriorityData()} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'designer':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Design Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'design').slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.filter(t => t.status === 'design').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No design tasks</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Task Priority</h3>
                <div className="h-64">
                  <Pie 
                    data={getPriorityData()} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'production':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Production Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'approved' || t.status === 'production').slice(0, 5).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.filter(t => t.status === 'approved' || t.status === 'production').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No production tasks</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium mb-4">Monthly Completed Tasks</h3>
                <div className="h-64">
                  <Bar 
                    data={getMonthlyTasksData()} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'manager':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
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
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <FileBarChart className="h-6 w-6 text-green-600" />
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
                  <h3 className="text-lg font-medium">Task Trends</h3>
                  <div className="flex items-center text-sm text-blue-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <Link to="/reports">View Trends</Link>
                  </div>
                </div>
                <div className="h-72">
                  <Line 
                    data={getMonthlyTasksData()} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top'
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Tasks</h3>
                  <Link to="/tasks" className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {recentTasks.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tasks found</p>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser?.displayName || 'User'}!
        </p>
      </div>
      
      {renderRoleSpecificDashboard()}
    </div>
  );
};

export default Dashboard;