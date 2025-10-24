import { Component, ElementRef, AfterViewInit, ViewChild, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, ChecklistItem, SubTask, Attachment, Recurrence, Reminder } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { AttachmentService } from '../../services/attachment.service';
import { AnalyticsService, Analytics } from '../../services/analytics.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class MainComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('settingsModal') settingsModal!: ElementRef;
  @ViewChild('addTaskModal') addTaskModal!: ElementRef;
  @ViewChild('analyticsModal') analyticsModal!: ElementRef;
  @ViewChild('taskList') taskList!: ElementRef;

  // الخدمات
  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private taskService: TaskService,
    private attachmentService: AttachmentService,
    private analyticsService: AnalyticsService
  ) {}

  // بيانات المستخدم
  userData: any = {};

  // المهام
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  visibleTasks: Task[] = [];
  itemsPerPage: number = 10;

  // مهمة جديدة
  newTask: Partial<Task> = {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium',
    category: 'general',
    estimatedTime: 30,
    checklist: [],
    subtasks: [],
    recurrence: undefined,
    reminders: []
  };

  newChecklistItem: string = '';
  newSubtask: string = '';

  // فئات المهام
  categories = ['general', 'work', 'personal', 'shopping', 'health', 'finance', 'education'];

  // حالة التطبيق
  activeFilter: 'all' | 'active' | 'completed' = 'all';
  activeCategory: string = 'all';
  searchQuery: string = '';
  isSettingsOpen: boolean = false;
  isAddingTask: boolean = false;
  isAnalyticsOpen: boolean = false;
  selectedTask: Task | null = null;
  isEditing: boolean = false;

  // السحب والإفلات
  dragStartIndex: number = -1;
  isDragging: boolean = false;

  // الاهتزاز
  isShaking: boolean = false;

  // الإحصائيات
  analytics: Analytics | null = null;
  achievements: string[] = [];

  // إعدادات المستخدم
  userSettings = {
    theme: 'classic',
    notifications: true,
    autoSort: true,
    language: 'en',
    enableSwipe: true,
    enableShake: true
  };


  // الثيمات
  themes = {
    classic: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    dark: {
      primary: '#34495E',
      secondary: '#2C3E50',
      background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)'
    },
    green: {
      primary: '#27AE60',
      secondary: '#2ECC71',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
    },
    blue: {
      primary: '#3498DB',
      secondary: '#2980B9',
      background: 'linear-gradient(135deg, #ebf5fb 0%, #d6eaf8 100%)'
    },
    purple: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      background: 'linear-gradient(135deg, #f4ecf7 0%, #e8daef 100%)'
    }
  };

  // التكرار
 recurrenceTypes = [
  { label: 'Daily', value: 'daily', icon: 'fas fa-calendar-day' },
  { label: 'Weekly', value: 'weekly', icon: 'fas fa-calendar-week' },
  { label: 'Monthly', value: 'monthly', icon: 'fas fa-calendar-alt' },
  { label: 'Yearly', value: 'yearly', icon: 'fas fa-calendar' }
] as const;


  templates: Task[] = [];


  ngOnInit() {
    this.loadUserData();
    this.loadTasks();
    this.applyTheme();
    this.setupSwipeGestures();
    this.setupShakeDetection();
    this.templates = this.taskService.getTemplates();
  }

  ngAfterViewInit() {
    this.animateEntrance();
    this.taskService.lazyLoadImages();
  }

  ngOnDestroy() {
    // Cleanup
  }

  // 🔄 السحب والإفلات
  setupSwipeGestures() {
    if (!this.userSettings.enableSwipe) return;

    let startX: number;
    let currentX: number;

    const taskList = this.taskList?.nativeElement;
    if (!taskList) return;

    taskList.addEventListener('touchstart', (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    taskList.addEventListener('touchmove', (e: TouchEvent) => {
      if (!startX) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    taskList.addEventListener('touchend', (e: TouchEvent) => {
      if (!startX || !currentX) return;

      const diff = startX - currentX;
      if (Math.abs(diff) > 50) { // حد السحب
        const taskElement = (e.target as HTMLElement).closest('.task-card');
        if (taskElement) {
          const taskId = taskElement.getAttribute('data-task-id');
          const task = this.tasks.find(t => t.id === taskId);

          if (task) {
            if (diff > 0) {
              this.swipeDelete(task); // سحب لليسار للحذف
            } else {
              this.swipeComplete(task); // سحب لليمين للإكمال
            }
          }
        }
      }

      startX = 0;
      currentX = 0;
    }, { passive: true });
  }



  // 📱 اكتشاف الهز
  setupShakeDetection() {
    if (!this.userSettings.enableShake || !('DeviceMotionEvent' in window)) return;

    let lastAcceleration: { x: number; y: number; z: number } | null = null;

    window.addEventListener('devicemotion', (e) => {
      if (!e.accelerationIncludingGravity) return;

      const acceleration = {
        x: e.accelerationIncludingGravity.x || 0,
        y: e.accelerationIncludingGravity.y || 0,
        z: e.accelerationIncludingGravity.z || 0
      };

      if (!lastAcceleration) {
        lastAcceleration = acceleration;
        return;
      }


      const delta = Math.abs(acceleration.x - lastAcceleration.x) +
                   Math.abs(acceleration.y - lastAcceleration.y) +
                   Math.abs(acceleration.z - lastAcceleration.z);

      if (delta > 30) { // حد الهز
        this.handleShake();
      }

      lastAcceleration = acceleration;
    });
  }

  handleShake() {
    if (this.isShaking) return;

    this.isShaking = true;
    document.body.classList.add('shaking');

    setTimeout(() => {
      this.undoLastAction();
      document.body.classList.remove('shaking');
      this.isShaking = false;
    }, 1000);
  }

  undoLastAction() {
    // في تطبيق حقيقي هنعمل undo system
    console.log('Undo last action triggered by shake');
  }

  // 🎯 أحداث السحب
  swipeDelete(task: Task) {
    this.deleteTask(task.id);
  }

  swipeComplete(task: Task) {
    this.toggleTaskCompletion(task.id);
  }

  // 🔍 البحث مع Debounce
  onSearchChange() {
    this.taskService.debouncedSearch(this.searchQuery, (results) => {
      this.filteredTasks = results;
      this.updateVisibleTasks();
    });
  }

  // 📊 التحديث التلقائي
  updateVisibleTasks() {
    // Virtual Scrolling بسيط
    const startIndex = 0;
    this.visibleTasks = this.filteredTasks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onScroll() {
    // تحميل المزيد من المهام عند التمرير
    if (this.visibleTasks.length < this.filteredTasks.length) {
      const startIndex = this.visibleTasks.length;
      const newTasks = this.filteredTasks.slice(startIndex, startIndex + this.itemsPerPage);
      this.visibleTasks = [...this.visibleTasks, ...newTasks];
    }
  }

  // 🎨 الباقي من الدوال
  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.isSettingsOpen) this.closeSettings();
    if (this.isAddingTask) this.closeAddTask();
    if (this.isAnalyticsOpen) this.closeAnalytics();
  }

  animateEntrance() {
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((element, index) => {
      (element as HTMLElement).style.animationDelay = `${index * 0.1}s`;
    });
  }

  loadUserData() {
    const saved = localStorage.getItem('taskly-user-data');
    if (saved) {
      this.userData = JSON.parse(saved);
      this.userSettings.theme = this.userData.theme || 'classic';
    }
  }

  loadTasks() {
    this.tasks = this.taskService.getTasks();
    this.applyFilters();
  }

  applyTheme() {
    const theme = this.themes[this.userSettings.theme as keyof typeof this.themes];
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--background-gradient', theme.background);

    const mainContainer = this.elementRef.nativeElement.querySelector('.main-container');
    if (mainContainer) {
      mainContainer.style.background = theme.background;
    }
  }

  // ➕ إضافة المهام
  openAddTask() {
    this.isAddingTask = true;
    setTimeout(() => {
      if (this.addTaskModal?.nativeElement) {
        this.addTaskModal.nativeElement.style.opacity = '1';
        this.addTaskModal.nativeElement.style.transform = 'scale(1)';
      }
    }, 10);
  }

  closeAddTask() {
    if (this.addTaskModal?.nativeElement) {
      this.addTaskModal.nativeElement.style.opacity = '0';
      this.addTaskModal.nativeElement.style.transform = 'scale(0.9)';
    }
    setTimeout(() => {
      this.isAddingTask = false;
      this.resetNewTask();
    }, 300);
  }

  addTask() {
    if (!this.newTask.title?.trim()) return;

    const task: Task = {
      id: this.taskService.generateId(),
      title: this.newTask.title!,
      description: this.newTask.description || '',
      dueDate: this.newTask.dueDate || new Date().toISOString().split('T')[0],
      dueTime: this.newTask.dueTime,
      priority: this.newTask.priority || 'medium',
      completed: false,
      createdAt: new Date(),
      category: this.newTask.category || 'general',
      estimatedTime: this.newTask.estimatedTime,
      checklist: this.newTask.checklist || [],
      subtasks: this.newTask.subtasks || [],
      recurrence: this.newTask.recurrence,
      reminders: this.newTask.reminders || []
    };

    this.tasks.unshift(task);
    this.taskService.updateTasks(this.tasks);
    this.applyFilters();
    this.closeAddTask();
  }

  // 🎯 استخدام القالب
  useTemplate(template: Task) {
    this.newTask = {
      ...template,
      id: undefined,
      template: undefined,
      completed: false,
      createdAt: new Date()
    };
    this.openAddTask();
  }

  // 📋 إدارة Checklist
  addChecklistItem() {
    if (!this.newChecklistItem.trim()) return;

    if (!this.newTask.checklist) {
      this.newTask.checklist = [];
    }

    this.newTask.checklist.push({
      id: this.taskService.generateId(),
      text: this.newChecklistItem,
      completed: false
    });

    this.newChecklistItem = '';
  }

  removeChecklistItem(index: number) {
    if (this.newTask.checklist) {
      this.newTask.checklist.splice(index, 1);
    }
  }

  toggleChecklistItem(item: ChecklistItem) {
    item.completed = !item.completed;
  }

  // 🎯 إدارة Subtasks
  addSubtask() {
    if (!this.newSubtask.trim()) return;

    if (!this.newTask.subtasks) {
      this.newTask.subtasks = [];
    }

    this.newTask.subtasks.push({
      id: this.taskService.generateId(),
      title: this.newSubtask,
      completed: false
    });

    this.newSubtask = '';
  }

  removeSubtask(index: number) {
    if (this.newTask.subtasks) {
      this.newTask.subtasks.splice(index, 1);
    }
  }

  toggleSubtask(subtask: SubTask) {
    subtask.completed = !subtask.completed;
  }

  // 📎 إدارة المرفقات
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        const attachment = await this.attachmentService.uploadFile(file);
        if (!this.newTask.attachments) {
          this.newTask.attachments = [];
        }
        this.newTask.attachments.push(attachment);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }

  async takePhoto() {
    try {
      const attachment = await this.attachmentService.takePhoto();
      if (!this.newTask.attachments) {
        this.newTask.attachments = [];
      }
      this.newTask.attachments.push(attachment);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  removeAttachment(index: number) {
    if (this.newTask.attachments) {
      const attachment = this.newTask.attachments[index];
      this.attachmentService.deleteAttachment(attachment);
      this.newTask.attachments.splice(index, 1);
    }
  }

  // 🔄 التكرار
  setRecurrence(type: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    this.newTask.recurrence = {
      type,
      interval: 1
    };
  }

  removeRecurrence() {
    this.newTask.recurrence = undefined;
  }

  // ⏰ التذكيرات
  addReminder() {
    if (!this.newTask.reminders) {
      this.newTask.reminders = [];
    }

    this.newTask.reminders.push({
      id: this.taskService.generateId(),
      type: 'notification',
      time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // بعد 30 دقيقة
      triggered: false
    });
  }

  removeReminder(index: number) {
    if (this.newTask.reminders) {
      this.newTask.reminders.splice(index, 1);
    }
  }

  // 📊 التحليلات
  openAnalytics() {
    this.analytics = this.analyticsService.generateAnalytics(this.tasks);
    this.achievements = this.analyticsService.getAchievements(this.tasks);
    this.isAnalyticsOpen = true;

    setTimeout(() => {
      if (this.analyticsModal?.nativeElement) {
        this.analyticsModal.nativeElement.style.opacity = '1';
        this.analyticsModal.nativeElement.style.transform = 'scale(1)';
      }
    }, 10);
  }

  closeAnalytics() {
    if (this.analyticsModal?.nativeElement) {
      this.analyticsModal.nativeElement.style.opacity = '0';
      this.analyticsModal.nativeElement.style.transform = 'scale(0.9)';
    }
    setTimeout(() => {
      this.isAnalyticsOpen = false;
    }, 300);
  }

  // 🎯 باقي الدوال
  resetNewTask() {
    this.newTask = {
      title: '',
      description: '',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      category: 'general',
      estimatedTime: 30,
      checklist: [],
      subtasks: [],
      recurrence: undefined,
      reminders: []
    };
    this.newChecklistItem = '';
    this.newSubtask = '';
  }

  editTask(task: Task) {
    this.selectedTask = task;
    this.newTask = { ...task };
    this.isEditing = true;
    this.openAddTask();
  }

  updateTask() {
    if (!this.selectedTask || !this.newTask.title?.trim()) return;

    const index = this.tasks.findIndex(t => t.id === this.selectedTask!.id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...this.newTask
      } as Task;

      this.taskService.updateTasks(this.tasks);
      this.applyFilters();
      this.closeAddTask();
      this.isEditing = false;
      this.selectedTask = null;
    }
  }

  deleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.taskService.updateTasks(this.tasks);
      this.applyFilters();
    }
  }

  toggleTaskCompletion(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.taskService.updateTasks(this.tasks);
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = this.tasks;

    if (this.activeFilter === 'active') {
      filtered = filtered.filter(task => !task.completed);
    } else if (this.activeFilter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }

    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(task => task.category === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    if (this.userSettings.autoSort) {
      filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    this.filteredTasks = filtered;
    this.updateVisibleTasks();
  }

  getTasksCount() {
    return {
      total: this.tasks.length,
      active: this.tasks.filter(t => !t.completed).length,
      completed: this.tasks.filter(t => t.completed).length
    };
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#95A5A6';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'work': return 'fas fa-briefcase';
      case 'personal': return 'fas fa-home';
      case 'shopping': return 'fas fa-shopping-cart';
      case 'health': return 'fas fa-heart';
      case 'finance': return 'fas fa-money-bill-wave';
      case 'education': return 'fas fa-graduation-cap';
      default: return 'fas fa-tasks';
    }
  }

getMaxCompleted(): number {
  if (!this.analytics?.weeklyProgress?.length) return 0;
  return Math.max(...this.analytics.weeklyProgress.map(d => d.completed));
}

getCompletedHeight(dayCompleted: number): number {
  const max = this.getMaxCompleted();
  return max ? (dayCompleted / max) * 80 : 0; // 80% أقصى ارتفاع
}

getMaxCreated(): number {
  if (!this.analytics?.weeklyProgress?.length) return 0;
  return Math.max(...this.analytics.weeklyProgress.map(d => d.created));
}

getCreatedHeight(dayCreated: number): number {
  const max = this.getMaxCreated();
  return max ? (dayCreated / max) * 80 : 0; // 80% أقصى ارتفاع
}


  openSettings() {
    this.isSettingsOpen = true;
    setTimeout(() => {
      if (this.settingsModal?.nativeElement) {
        this.settingsModal.nativeElement.style.opacity = '1';
        this.settingsModal.nativeElement.style.transform = 'scale(1)';
      }
    }, 10);
  }

  closeSettings() {
    if (this.settingsModal?.nativeElement) {
      this.settingsModal.nativeElement.style.opacity = '0';
      this.settingsModal.nativeElement.style.transform = 'scale(0.9)';
    }
    setTimeout(() => {
      this.isSettingsOpen = false;
    }, 300);
  }

  saveSettings() {
    localStorage.setItem('taskly-settings', JSON.stringify(this.userSettings));
    this.applyTheme();
    this.setupSwipeGestures();
    this.closeSettings();
  }

  clearCompleted() {
    const completedCount = this.tasks.filter(task => task.completed).length;
    if (completedCount > 0 && confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
      this.tasks = this.tasks.filter(task => !task.completed);
      this.taskService.updateTasks(this.tasks);
      this.applyFilters();
    }
  }

  exportTasks() {
    const data = JSON.stringify(this.tasks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskly-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
downloadAttachment(attachment: any): void {
  // لو الملف عبارة عن رابط مباشر
  if (attachment.url) {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  } else {
    console.warn('Attachment has no URL:', attachment);
  }
}

addReminderToTask(task: any): void {
  // لو حابب نضيف Reminder افتراضي
  if (!task.reminders) {
    task.reminders = [];
  }
  const now = new Date();
  task.reminders.push({ time: now, message: 'Reminder for task: ' + task.title });
  console.log('Reminder added to task:', task);
}
addAttachmentToTask(task: any): void {
  if (!task.attachments) {
    task.attachments = [];
  }
  // مثال: إضافة attachment افتراضي
  const dummyAttachment = {
    name: 'New File.txt',
    type: 'txt',
    size: 1024 // بالبايت
  };
  task.attachments.push(dummyAttachment);
  console.log('Attachment added to task:', task);
}

// داخل MainComponent
minDate: string = new Date().toISOString().split('T')[0];


  getCurrentTheme() {
    return this.themes[this.userSettings.theme as keyof typeof this.themes];
  }

getRecurrenceIcon(type: string): string {
  switch (type) {
    case 'daily': return 'fas fa-calendar-day';
    case 'weekly': return 'fas fa-calendar-week';
    case 'monthly': return 'fas fa-calendar-alt';
    case 'yearly': return 'fas fa-calendar';
    default: return 'fas fa-calendar';
  }
}
getCompletedChecklistItems(checklist: { text: string; completed: boolean }[]): number {
  if (!checklist) return 0;
  return checklist.filter(item => item.completed).length;
}

getCompletedSubtasks(subtasks: { title: string; completed: boolean; estimatedTime?: number }[]): number {
  if (!subtasks) return 0;
  return subtasks.filter(subtask => subtask.completed).length;
}

getFileIcon(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return 'fas fa-file-pdf';
    case 'doc':
    case 'docx':
      return 'fas fa-file-word';
    case 'xls':
    case 'xlsx':
      return 'fas fa-file-excel';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'fas fa-file-image';
    case 'zip':
    case 'rar':
      return 'fas fa-file-archive';
    case 'txt':
      return 'fas fa-file-alt';
    default:
      return 'fas fa-file';
  }
}


  // 🔄 Pull to Refresh
  onPullToRefresh() {
    this.loadTasks();
    // إظهار مؤشر التحديث
    const refreshElement = document.createElement('div');
    refreshElement.className = 'refresh-indicator';
    refreshElement.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
    document.body.appendChild(refreshElement);

    setTimeout(() => {
      refreshElement.remove();
    }, 1000);
  }
}
