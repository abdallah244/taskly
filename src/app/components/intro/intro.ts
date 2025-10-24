import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './intro.html',
  styleUrl: './intro.css'
})
export class IntroComponent implements AfterViewInit {
  currentStep: number = 0;
  totalSteps: number = 3;

  userData = {
    name: '',
    productivityStyle: 'balanced',
    dailyGoals: 5,
    notifications: true,
    theme: 'classic'
  };

  productivityStyles = [
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
  ];

  themes = [
    { name: 'classic', color: '#667eea' },
    { name: 'dark', color: '#2C3E50' },
    { name: 'green', color: '#27AE60' },
    { name: 'blue', color: '#3498DB' },
    { name: 'purple', color: '#9B59B6' }
  ];

  constructor(private router: Router, private elementRef: ElementRef) {}

  ngAfterViewInit() {
    // بداية الأنيميشن بعد ما الكومبوننت يتحمل
    setTimeout(() => {
      this.animateEntrance();
    }, 100);
  }

  animateEntrance() {
    const paper = this.elementRef.nativeElement.querySelector('.intro-paper');
    if (paper) {
      paper.style.opacity = '1';
      paper.style.transform = 'translateY(0) scale(1)';
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.animateStepTransition('next');
    } else {
      this.completeSetup();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.animateStepTransition('prev');
    }
  }

  animateStepTransition(direction: 'next' | 'prev') {
    const cards = this.elementRef.nativeElement.querySelectorAll('.question-card');
    const currentCard = cards[this.currentStep + (direction === 'next' ? -1 : 1)];
    const nextCard = cards[this.currentStep];

    if (currentCard && nextCard) {
      currentCard.style.opacity = '0';
      currentCard.style.transform = direction === 'next' ? 'translateX(-50px)' : 'translateX(50px)';

      setTimeout(() => {
        nextCard.style.opacity = '1';
        nextCard.style.transform = 'translateX(0)';
      }, 300);
    }
  }

  selectProductivityStyle(style: string) {
    this.userData.productivityStyle = style;
  }

  selectTheme(theme: string) {
    this.userData.theme = theme;
  }

  completeSetup() {
    localStorage.setItem('taskly-user-data', JSON.stringify(this.userData));

    // أنيميشن الخروج
    const paper = this.elementRef.nativeElement.querySelector('.intro-paper');
    if (paper) {
      paper.style.opacity = '0';
      paper.style.transform = 'translateY(-50px) scale(0.9)';
    }

    setTimeout(() => {
      this.router.navigate(['/main']);
    }, 600);
  }

  getProgressWidth(): string {
    return `${((this.currentStep + 1) / this.totalSteps) * 100}%`;
  }

  isStepValid(): boolean {
    if (this.currentStep === 0) {
      return !!this.userData.name.trim();
    }
    return true;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
