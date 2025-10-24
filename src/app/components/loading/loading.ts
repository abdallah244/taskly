import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class LoadingComponent implements AfterViewInit, OnDestroy {
  progress: number = 0;
  isLoading: boolean = true;
  currentText: string = '';
  private interval: any;

   writingTexts: string[] = [
    "Initializing Task Manager...",
    "Loading Your Workspace...",
    "Preparing Productivity Tools...",
    "Almost Ready to Organize..."
  ];
   currentWritingIndex: number = 0;
   isWriting: boolean = false;

  constructor(private router: Router, private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.startLoading();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  startLoading() {
    this.interval = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 1;
        this.handleWriting();
      } else {
        clearInterval(this.interval);
        this.completeLoading();
      }
    }, 40);
  }

  private handleWriting() {
    const writingThresholds = [15, 40, 65, 85];

    if (this.currentWritingIndex < writingThresholds.length &&
        this.progress >= writingThresholds[this.currentWritingIndex] &&
        !this.isWriting) {

      this.isWriting = true;
      this.typeWriterEffect(this.writingTexts[this.currentWritingIndex], () => {
        this.currentWritingIndex++;
        this.isWriting = false;
      });
    }
  }

  private typeWriterEffect(text: string, onComplete: () => void) {
    this.currentText = '';
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        this.currentText += text.charAt(index);
        index++;
      } else {
        clearInterval(typeInterval);
        onComplete();
      }
    }, 50);
  }

  private completeLoading() {
    // تأخير بسيط قبل الانتقال
    setTimeout(() => {
      this.router.navigate(['/intro']);
    }, 1800);
  }
getCurrentDate(): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  }

}
