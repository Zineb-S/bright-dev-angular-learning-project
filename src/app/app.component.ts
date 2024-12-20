import { Component, importProvidersFrom } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConceptListComponent } from "./components/concept-list/concept-list.component";
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true, 
  
  imports: [RouterOutlet, ConceptListComponent,
     ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'bright-dev-angular-learning-project';
  constructor(private notificationService: NotificationService) {
    this.notificationService.simulateWebSocket(); // Start WebSocket simulation
  }
}
