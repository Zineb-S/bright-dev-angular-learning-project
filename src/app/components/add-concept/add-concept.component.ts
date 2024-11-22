import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-concept',
  standalone: true,
  imports: [CommonModule,FormsModule,],
  templateUrl: './add-concept.component.html',
  styleUrls: ['./add-concept.component.scss'],
})
export class AddConceptComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() conceptAdded = new EventEmitter<string>(); 
  newConceptName: string = '';

  emitAddConcept() { 
    if (this.newConceptName.trim()) {
      this.conceptAdded.emit(this.newConceptName.trim());
      this.newConceptName = '';
    }
  }

  close() {
    this.closed.emit();
  }
}
