import { Injectable } from '@angular/core';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    paper: string;
    text: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
themes: Theme[] = [
    {
      name: 'classic',
      colors: {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#E74C3C',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        paper: '#FFFEF7',
        text: '#2C3E50'
      }
    },
    {
      name: 'dark',
      colors: {
        primary: '#ECF0F1',
        secondary: '#BDC3C7',
        accent: '#E74C3C',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
        paper: '#2C3E50',
        text: '#ECF0F1'
      }
    },
    {
      name: 'green',
      colors: {
        primary: '#27AE60',
        secondary: '#2ECC71',
        accent: '#E67E22',
        background: 'linear-gradient(135deg, #1a3c27 0%, #2d4a3a 50%, #3d5c48 100%)',
        paper: '#FFFEF7',
        text: '#2C3E50'
      }
    }
  ];



  private currentTheme: Theme = this.themes[0];


  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(themeName: string) {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
    }
  }

  // في theme.service.ts
getThemeColor(themeName: string): string {
  const theme = this.themes.find(t => t.name === themeName);
  return theme ? theme.colors.primary : '#2C3E50';
}

  private applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--background-gradient', theme.colors.background);
    root.style.setProperty('--paper-color', theme.colors.paper);
    root.style.setProperty('--text-color', theme.colors.text);
  }
}
