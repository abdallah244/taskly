import { Injectable } from '@angular/core';
import { Attachment } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  async uploadFile(file: File): Promise<Attachment> {
    return new Promise((resolve, reject) => {
      // محاكاة رفع الملف
      setTimeout(() => {
        const attachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date()
        };
        resolve(attachment);
      }, 1000);
    });
  }

  async takePhoto(): Promise<Attachment> {
    return new Promise((resolve, reject) => {
      // محاكاة أخذ صورة
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#667eea';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Sample Photo', 150, 150);
      }

      canvas.toBlob(blob => {
        if (blob) {
          const attachment: Attachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: `photo-${new Date().getTime()}.png`,
            type: 'image/png',
            size: blob.size,
            url: URL.createObjectURL(blob),
            uploadedAt: new Date()
          };
          resolve(attachment);
        } else {
          reject(new Error('Failed to take photo'));
        }
      }, 'image/png');
    });
  }

  downloadAttachment(attachment: Attachment) {
    const a = document.createElement('a');
    a.href = attachment.url;
    a.download = attachment.name;
    a.click();
  }

  deleteAttachment(attachment: Attachment) {
    URL.revokeObjectURL(attachment.url);
  }
}
