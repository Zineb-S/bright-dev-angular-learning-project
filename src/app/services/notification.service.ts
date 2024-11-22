import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<string>();
  notifications$ = this.notificationSubject.asObservable();

  constructor(private toastr: ToastrService) {}

  // Simulate WebSocket notifications
  simulateWebSocket() {
    setInterval(() => {
      const simulatedMessages = [
        'Keep going! You are making great progress!',
        'Don\'t forget to take water breaks',
        'Keep up the good work :) ',
      ];
      const randomMessage = simulatedMessages[Math.floor(Math.random() * simulatedMessages.length)];
      this.toastr.info(randomMessage, 'Minion said : '); // Display as an info toast
    }, 20000);
  }

  // Send a specific notification
  sendNotification(message: string) {
    this.toastr.success(message, 'Notification'); 
  }
}
