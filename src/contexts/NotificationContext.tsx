import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { Notification, Task, TaskStatus } from '../types';
import notificationSound from '../assets/notification-sound.mp3';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (
    title: string, 
    message: string, 
    recipientId: string, 
    taskId?: string
  ) => Promise<void>;
  sendTaskStatusNotification: (
    task: Task, 
    previousStatus: TaskStatus, 
    newStatus: TaskStatus,
    recipientId: string
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(notificationSound);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList: Notification[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notificationsList.push({
          id: doc.id,
          title: data.title,
          message: data.message,
          taskId: data.taskId,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          read: data.read,
          recipientId: data.recipientId
        });
      });

      const oldUnreadCount = notifications.filter(n => !n.read).length;
      const newUnreadCount = notificationsList.filter(n => !n.read).length;

      setNotifications(notificationsList);

      // Play sound only if there are new unread notifications
      if (newUnreadCount > oldUnreadCount && audioRef.current) {
        audioRef.current.play().catch(e => console.error('Failed to play notification sound:', e));
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    const notificationRef = doc(db, 'notifications', id);
    await updateDoc(notificationRef, {
      read: true
    });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    const promises = unreadNotifications.map(notification => {
      const notificationRef = doc(db, 'notifications', notification.id);
      return updateDoc(notificationRef, { read: true });
    });
    
    await Promise.all(promises);
  };

  const sendNotification = async (
    title: string, 
    message: string, 
    recipientId: string, 
    taskId?: string
  ) => {
    await addDoc(collection(db, 'notifications'), {
      title,
      message,
      recipientId,
      taskId,
      createdAt: serverTimestamp(),
      read: false
    });
  };

  const sendTaskStatusNotification = async (
    task: Task, 
    previousStatus: TaskStatus, 
    newStatus: TaskStatus,
    recipientId: string
  ) => {
    const statusMessages: Record<TaskStatus, string> = {
      new: 'New task created',
      design: 'Task moved to Design',
      review: 'Task ready for review',
      approved: 'Task approved',
      production: 'Task moved to Production',
      completed: 'Task completed',
      rejected: 'Task rejected'
    };

    await sendNotification(
      `Task Status Updated: ${task.title}`,
      `Status changed from ${statusMessages[previousStatus]} to ${statusMessages[newStatus]}`,
      recipientId,
      task.id
    );
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    sendTaskStatusNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider