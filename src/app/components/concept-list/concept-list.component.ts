import { Component, OnInit } from '@angular/core';
import { ConceptService } from '../../services/concept.service';
import { ConceptDetailComponent } from "../concept-detail/concept-detail.component";
import { AddConceptComponent } from "../add-concept/add-concept.component";
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { WeatherComponent } from '../weather/weather.component';

@Component({
  selector: 'app-concept-list',
  standalone: true,
  imports: [CommonModule, ConceptDetailComponent, AddConceptComponent,WeatherComponent],
  templateUrl: './concept-list.component.html',
  styleUrls: ['./concept-list.component.scss'],
})
export class ConceptListComponent implements OnInit {
  concepts$ = this.conceptService.getConcepts();
  selectedConcept: any = null;
  showAddConceptModal = false;

  constructor(private conceptService: ConceptService) {}

  ngOnInit() {
    this.concepts$.subscribe((concepts) => {
      // Initialize charts for all concepts
      concepts.forEach((concept, index) => this.createCircularChart(concept, index));
    });
  }

  createCircularChart(concept: any, index: number): void {
    const chartId = `CircularChart-${index}`;
    const progress = concept.progress;

    // Wait for the DOM element to be available
    setTimeout(() => {
      new Chart(chartId, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Remaining'],
          datasets: [
            {
              data: [progress, 100 - progress],
              backgroundColor: ['#28a745', '#e9ecef'],
            },
          ],
        },
        options: {
          responsive: true,
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        },
      });
    }, 0); // Ensures chart is initialized after DOM rendering
  }

  selectConcept(concept: any): void {
    console.log('Selected concept:', concept); // Debugging log
    this.selectedConcept = concept;
  }

  deleteConcept(conceptId: number) {
    if (confirm('Are you sure you want to delete this concept?')) {
      this.conceptService.deleteConcept(conceptId);
    }
  }

  openAddConceptModal() {
    this.showAddConceptModal = true;
  }

  closeAddConceptModal() {
    this.showAddConceptModal = false;
  }

  addNewConcept(conceptName: string) {
    this.conceptService.addConcept({ name: conceptName });
    this.closeAddConceptModal();
  }
  closeSubconceptCard(): void {
    this.selectedConcept = null;
  }
}
