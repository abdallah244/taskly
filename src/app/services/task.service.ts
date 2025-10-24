import { Injectable } from '@angular/core';
import { Task, ChecklistItem, SubTask, Attachment, Recurrence, Reminder } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];

  constructor() {
    this.loadTasks();
  }

  // Debounced Search
  private searchTimeout: any;
  debouncedSearch(query: string, callback: (results: Task[]) => void, delay: number = 300) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const results = this.tasks.filter(task =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase())
      );
      callback(results);
    }, delay);
  }

  // Lazy Loading for Images
  lazyLoadImages() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset['src'] || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Task Templates
  getTemplates(): Task[] {
    return [
      {
        id: 'template-daily',
        title: 'Daily Planning',
        description: 'Plan your day with this template',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'medium',
        completed: false,
        createdAt: new Date(),
        category: 'general',
        template: true,
        checklist: [
          { id: '1', text: 'Review yesterday\'s accomplishments', completed: false },
          { id: '2', text: 'Set today\'s top 3 priorities', completed: false },
          { id: '3', text: 'Schedule breaks and meals', completed: false }
        ]
      },
      {
        id: 'template-meeting',
        title: 'Meeting Preparation',
        description: 'Prepare for your important meetings',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'high',
        completed: false,
        createdAt: new Date(),
        category: 'work',
        template: true,
        checklist: [
          { id: '1', text: 'Review agenda', completed: false },
          { id: '2', text: 'Prepare materials', completed: false },
          { id: '3', text: 'Set goals for meeting', completed: false }
        ]
      }
    ];
  }

  // Recurring Tasks
  generateRecurringTasks(): Task[] {
    const recurringTasks: Task[] = [];
    this.tasks.forEach(task => {
      if (task.recurrence && task.completed) {
        const nextDate = this.calculateNextRecurrence(task);
        if (nextDate) {
          const newTask: Task = {
            ...task,
            id: this.generateId(),
            completed: false,
            dueDate: nextDate,
            createdAt: new Date()
          };
          recurringTasks.push(newTask);
        }
      }
    });
    return recurringTasks;
  }

  private calculateNextRecurrence(task: Task): string | null {
    if (!task.recurrence) return null;

    const lastDate = new Date(task.dueDate);
    const nextDate = new Date(lastDate);

    switch (task.recurrence.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + task.recurrence.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * task.recurrence.interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + task.recurrence.interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + task.recurrence.interval);
        break;
    }

    return nextDate.toISOString().split('T')[0];
  }

  // Reminders
  scheduleReminders() {
    this.tasks.forEach(task => {
      if (task.reminders && !task.completed) {
        task.reminders.forEach(reminder => {
          if (!reminder.triggered) {
            this.scheduleNotification(task, reminder);
          }
        });
      }
    });
  }

  private scheduleNotification(task: Task, reminder: Reminder) {
    // في تطبيق حقيقي هنستخدم Notification API
    console.log(`Scheduled reminder for task: ${task.title}`);
  }

  // Helper Methods
  private loadTasks() {
    const saved = localStorage.getItem('taskly-tasks');
    this.tasks = saved ? JSON.parse(saved) : [];
  }

  saveTasks() {
    localStorage.setItem('taskly-tasks', JSON.stringify(this.tasks));
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  updateTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.saveTasks();
  }
}
