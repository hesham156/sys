import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  deleteDoc,
  orderBy,
  getDocs,
  where
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { Task, TaskStatus, HistoryEntry, UserRole, User } from '../types';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'history'>) => Promise<string>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus, comment?: string) => Promise<void>;
  addTaskComment: (taskId: string, text: string) => Promise<void>;
  loading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { sendTaskStatusNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);

  // Fetch all users for notifications
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData: Record<string, User> = {};
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as Omit<User, 'uid'>;
        usersData[doc.id] = {
          uid: doc.id,
          ...userData
        } as User;
      });
      
      setUsers(usersData);
    };
    
    fetchUsers();
  }, []);

  // Listen for tasks updates
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    let q;
    
    // Different queries based on user role
    if (currentUser.role === 'manager') {
      // Managers see all tasks
      q = query(tasksRef, orderBy('createdAt', 'desc'));
    } else if (currentUser.role === 'sales') {
      // Sales team sees tasks they created or tasks returned to sales
      q = query(
        tasksRef, 
        where('status', 'in', ['new', 'rejected']),
        orderBy('createdAt', 'desc')
      );
    } else if (currentUser.role === 'designer') {
      // Designers see tasks in design phase
      q = query(
        tasksRef, 
        where('status', 'in', ['design']),
        orderBy('createdAt', 'desc')
      );
    } else if (currentUser.role === 'production') {
      // Production team sees approved tasks
      q = query(
        tasksRef, 
        where('status', 'in', ['approved', 'production', 'completed']),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q!, (querySnapshot) => {
      const tasksList: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksList.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          clientName: data.clientName,
          priority: data.priority,
          status: data.status,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
          dueDate: data.dueDate?.toMillis() || 0,
          assignedTo: data.assignedTo,
          attachments: data.attachments || [],
          comments: data.comments || [],
          history: data.history || []
        });
      });
      
      setTasks(tasksList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'history'>): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      action: 'Task created',
      performedBy: currentUser.uid,
      timestamp: Date.now()
    };

    const newTask = {
      ...taskData,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [historyEntry]
    };

    const docRef = await addDoc(collection(db, 'tasks'), newTask);

    // Send notifications to designers when a new task is created
    Object.values(users).forEach(user => {
      if (user.role === 'designer') {
        sendTaskStatusNotification(
          { ...newTask, id: docRef.id } as Task,
          'new',
          'new',
          user.uid
        );
      }
    });

    return docRef.id;
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'sales' && currentUser.role !== 'manager') {
      throw new Error('Insufficient permissions');
    }

    await deleteDoc(doc(db, 'tasks', id));
  };

  const updateTaskStatus = async (id: string, newStatus: TaskStatus, comment?: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'tasks', id);
    const taskDoc = tasks.find(t => t.id === id);
    
    if (!taskDoc) throw new Error('Task not found');
    
    const previousStatus = taskDoc.status;
    
    // Check permissions for status change
    if (!canChangeStatus(currentUser.role, previousStatus, newStatus)) {
      throw new Error('Insufficient permissions to change status');
    }

    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      action: `Status changed from ${previousStatus} to ${newStatus}`,
      fromStatus: previousStatus,
      toStatus: newStatus,
      performedBy: currentUser.uid,
      timestamp: Date.now(),
      comment
    };

    const history = [...(taskDoc.history || []), historyEntry];

    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      history
    });

    // Send notifications based on new status
    let recipientRole: UserRole;
    
    switch (newStatus) {
      case 'design':
        recipientRole = 'designer';
        break;
      case 'review':
        recipientRole = 'manager';
        break;
      case 'approved':
      case 'production':
        recipientRole = 'production';
        break;
      case 'rejected':
        recipientRole = 'sales';
        break;
      default:
        recipientRole = 'manager';
    }

    // Send notifications to relevant users
    Object.values(users).forEach(user => {
      if (user.role === recipientRole) {
        sendTaskStatusNotification(
          taskDoc,
          previousStatus,
          newStatus,
          user.uid
        );
      }
    });
  };

  const addTaskComment = async (taskId: string, text: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = tasks.find(t => t.id === taskId);
    
    if (!taskDoc) throw new Error('Task not found');
    
    const comment = {
      id: uuidv4(),
      text,
      createdBy: currentUser.uid,
      createdAt: Date.now()
    };

    const comments = [...(taskDoc.comments || []), comment];
    
    const historyEntry: HistoryEntry = {
      id: uuidv4(),
      action: 'Comment added',
      performedBy: currentUser.uid,
      timestamp: Date.now(),
      comment: text
    };

    const history = [...(taskDoc.history || []), historyEntry];

    await updateDoc(taskRef, {
      comments,
      history,
      updatedAt: serverTimestamp()
    });
  };

  // Helper function to check if a user can change a task's status
  const canChangeStatus = (role: UserRole, currentStatus: TaskStatus, newStatus: TaskStatus): boolean => {
    if (role === 'manager') {
      // Manager can change any status
      return true;
    } else if (role === 'sales') {
      // Sales can create new tasks and move them to design
      return (
        (currentStatus === 'new' && newStatus === 'design') ||
        (currentStatus === 'rejected' && newStatus === 'design')
      );
    } else if (role === 'designer') {
      // Designers can move to review or reject back to sales
      return (
        (currentStatus === 'design' && (newStatus === 'review' || newStatus === 'rejected'))
      );
    } else if (role === 'production') {
      // Production can mark tasks as completed
      return (
        (currentStatus === 'approved' && newStatus === 'production') ||
        (currentStatus === 'production' && newStatus === 'completed')
      );
    }
    
    return false;
  };

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addTaskComment,
    loading
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};