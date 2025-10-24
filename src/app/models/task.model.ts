export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  category: string;

  // المميزات الجديدة
  estimatedTime?: number; // الوقت المقدر بالدقائق
  checklist?: ChecklistItem[];
  subtasks?: SubTask[];
  attachments?: Attachment[];
  recurrence?: Recurrence;
  reminders?: Reminder[];
  template?: boolean;
  parentTaskId?: string; // للـ Subtasks
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface Recurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  occurrences?: number;
}

export interface Reminder {
  id: string;
  type: 'notification' | 'email';
  time: string; // ISO string or relative time
  triggered: boolean;
}
