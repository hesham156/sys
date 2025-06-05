export type UserRole = 'sales' | 'designer' | 'manager' | 'production';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

export type TaskStatus = 'new' | 'design' | 'review' | 'approved' | 'production' | 'completed' | 'rejected';

export interface Task {
  id: string;
  title: string;
  description: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  dueDate: number;
  assignedTo?: string;
  attachments?: string[];
  comments?: Comment[];
  history?: HistoryEntry[];
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  action: string;
  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;
  performedBy: string;
  timestamp: number;
  comment?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  taskId?: string;
  createdAt: number;
  read: boolean;
  recipientId: string;
}

export interface DepartmentStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface Stats {
  sales: DepartmentStats;
  design: DepartmentStats;
  manager: DepartmentStats;
  production: DepartmentStats;
  totalTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
}