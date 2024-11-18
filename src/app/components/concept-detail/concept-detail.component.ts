import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Added for ngModel
import { ConceptService } from '../../services/concept.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-concept-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss'],
})
export class ConceptDetailComponent implements OnInit {
  @Input() concept: any;
  @Output() close = new EventEmitter<void>();

  subconceptControls: FormControl[] = [];
  newSubConceptName: string = ''; // For new subconcept input

  constructor(private conceptService: ConceptService) {}

  ngOnInit() {
    if (this.concept) {
      this.initializeSubconceptControls();
    }
  }

  // Initialize controls with prefilled values
  initializeSubconceptControls() {
    // Reinitialize the form controls to reset them
    this.subconceptControls = this.concept.subconcepts.map((sub: any) =>
      new FormControl(sub.progress, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ])
    );
  }

  // This method is triggered when "View Subconcepts" is clicked
  ngOnChanges() {
    if (this.concept) {
      // Reset and refill form controls with the latest values
      this.initializeSubconceptControls();
    }
  }

  // Add a new subconcept
  addSubConcept() {
    if (this.newSubConceptName.trim()) {
      this.conceptService.addSubConcept(this.concept.id, {
        name: this.newSubConceptName.trim(),
      });
      this.newSubConceptName = ''; // Clear the input field after adding
      this.refreshSubconcepts(); // Refresh subconcepts
    }
  }

  // Confirm and update progress of a subconcept
  confirmSubProgress(subId: number, index: number) {
    const control = this.subconceptControls[index];
    if (control.valid) {
      const progressValue = control.value;
      this.conceptService.updateSubConceptProgress(this.concept.id, subId, progressValue);
      this.refreshSubconcepts(); // Refresh after progress update
    }
  }

  // Delete a subconcept
  deleteSubConcept(subId: number) {
    this.conceptService.deleteSubConcept(this.concept.id, subId);
    this.refreshSubconcepts(); // Refresh after deletion
  }

  // Refresh subconcepts and controls
  private refreshSubconcepts() {
    this.conceptService.getConcepts().subscribe((concepts) => {
      const updatedConcept = concepts.find((c) => c.id === this.concept.id);
      if (updatedConcept) {
        this.concept = updatedConcept; // Update the concept
        this.initializeSubconceptControls(); // Reinitialize controls
      }
    });
  }
}
