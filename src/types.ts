export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  departments: Department[];
  createdAt: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface FlowLog {
  id: string;
  departmentId: string;
  departmentName: string;
  note: string;
  enteredAt: number;
  completedAt: number | null;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  currentDepartmentId: string | null;
  flowLogs: FlowLog[];
  dueDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待开始',
  in_progress: '进行中',
  review: '审核中',
  done: '已完成',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
};

export const STATUS_FLOW: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

export const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#9ca3af',
  medium: '#f59e0b',
  high: '#ef4444',
};
