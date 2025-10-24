import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  tasksByPriority: { [key: string]: number };
  tasksByCategory: { [key: string]: number };
  weeklyProgress: { date: string; completed: number; created: number }[];
  productivityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  generateAnalytics(tasks: Task[]): Analytics {
    const completedTasks = tasks.filter(t => t.completed);
    const totalTime = completedTasks.reduce((total, task) => {
      return total + (task.estimatedTime || 0);
    }, 0);

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const tasksByCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const weeklyProgress = this.generateWeeklyProgress(tasks);

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      averageCompletionTime: completedTasks.length > 0 ? totalTime / completedTasks.length : 0,
      tasksByPriority,
      tasksByCategory,
      weeklyProgress,
      productivityScore: this.calculateProductivityScore(tasks)
    };
  }

  private generateWeeklyProgress(tasks: Task[]): { date: string; completed: number; created: number }[] {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const completed = tasks.filter(t =>
        t.completed && t.dueDate === dateStr
      ).length;

      const created = tasks.filter(t =>
        t.createdAt.toISOString().split('T')[0] === dateStr
      ).length;

      result.push({ date: dateStr, completed, created });
    }

    return result;
  }

  private calculateProductivityScore(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.completed);
    const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
    const totalHighPriority = tasks.filter(t => t.priority === 'high').length;

    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    const highPriorityRate = totalHighPriority > 0 ? (highPriorityCompleted / totalHighPriority) * 100 : 0;

    return (completionRate * 0.6) + (highPriorityRate * 0.4);
  }

  getAchievements(tasks: Task[]): string[] {
    const achievements = [];
    const completedCount = tasks.filter(t => t.completed).length;
    const analytics = this.generateAnalytics(tasks);

    if (completedCount >= 10) achievements.push('Task Master');
    if (completedCount >= 50) achievements.push('Productivity Guru');
    if (analytics.completionRate >= 80) achievements.push('Consistency Champion');
    if (analytics.productivityScore >= 90) achievements.push('Efficiency Expert');

    return achievements;
  }
}
