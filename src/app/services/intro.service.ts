import { Injectable } from '@angular/core';

export interface UserPreferences {
  name: string;
  productivityStyle: 'focused' | 'balanced' | 'flexible';
  dailyGoals: number;
  notifications: boolean;
  theme: string;
  workspace: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntroService {
  private preferences: UserPreferences = {
    name: '',
    productivityStyle: 'balanced',
    dailyGoals: 5,
    notifications: true,
    theme: 'classic',
    workspace: 'personal'
  };

  private questions = [
    {
      id: 1,
      title: 'Welcome to Taskly!',
      subtitle: 'Let\'s personalize your experience',
      type: 'welcome',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'What should we call you?',
          placeholder: 'Enter your name...',
          required: true,
          icon: 'fas fa-user'
        }
      ]
    },
    {
      id: 2,
      title: 'Productivity Style',
      subtitle: 'How do you like to work?',
      type: 'choice',
      fields: [
        {
          type: 'card',
          name: 'productivityStyle',
          options: [
            {
              value: 'focused',
              title: 'Deep Focus',
              icon: 'fas fa-bullseye',
              description: 'Minimal distractions, maximum concentration',
              color: '#E74C3C'
            },
            {
              value: 'balanced',
              title: 'Balanced Flow',
              icon: 'fas fa-balance-scale',
              description: 'Mix of focused work and breaks',
              color: '#3498DB'
            },
            {
              value: 'flexible',
              title: 'Flexible & Adaptive',
              icon: 'fas fa-sliders-h',
              description: 'Adapt to changing priorities',
              color: '#27AE60'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Daily Goals',
      subtitle: 'Set your daily task target',
      type: 'slider',
      fields: [
        {
          type: 'range',
          name: 'dailyGoals',
          min: 3,
          max: 15,
          step: 1,
          unit: 'tasks',
          labels: ['Light', 'Moderate', 'Ambitious', 'Intense'],
          icon: 'fas fa-bullseye'
        }
      ]
    },
    {
      id: 4,
      title: 'Workspace Setup',
      subtitle: 'Choose your environment',
      type: 'workspace',
      fields: [
        {
          type: 'workspace',
          name: 'workspace',
          options: [
            {
              value: 'personal',
              title: 'Personal',
              icon: 'fas fa-home',
              description: 'For personal tasks and projects',
              theme: 'personal'
            },
            {
              value: 'work',
              title: 'Professional',
              icon: 'fas fa-briefcase',
              description: 'For work and business tasks',
              theme: 'work'
            },
            {
              value: 'creative',
              title: 'Creative',
              icon: 'fas fa-palette',
              description: 'For creative projects and ideas',
              theme: 'creative'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Preferences',
      subtitle: 'Final touches',
      type: 'preferences',
      fields: [
        {
          type: 'toggle',
          name: 'notifications',
          label: 'Enable notifications',
          description: 'Get reminders for important tasks',
          icon: 'fas fa-bell',
          default: true
        },
        {
          type: 'theme',
          name: 'theme',
          label: 'Color theme',
          options: ['classic', 'dark', 'green', 'blue', 'purple'],
          icon: 'fas fa-palette'
        }
      ]
    }
  ];

  getQuestions() {
    return this.questions;
  }

  getCurrentQuestion(step: number) {
    return this.questions[step];
  }

  updatePreferences(updates: Partial<UserPreferences>) {
    this.preferences = { ...this.preferences, ...updates };
  }

  getPreferences(): UserPreferences {
    return this.preferences;
  }

  saveToLocalStorage() {
    localStorage.setItem('taskly-preferences', JSON.stringify(this.preferences));
  }

  loadFromLocalStorage() {
    const saved = localStorage.getItem('taskly-preferences');
    if (saved) {
      this.preferences = JSON.parse(saved);
    }
    return this.preferences;
  }
}
