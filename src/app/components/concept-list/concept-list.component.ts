import { Component, OnInit } from '@angular/core';
import { ConceptService } from '../../services/concept.service';
import { ConceptDetailComponent } from "../concept-detail/concept-detail.component";
import { AddConceptComponent } from "../add-concept/add-concept.component";
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { WeatherComponent } from '../weather/weather.component';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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

  constructor(private conceptService: ConceptService,private authService:AuthService,private router: Router) {}

  ngOnInit() {
    this.conceptService.getConcepts().subscribe((concepts) => {
      this.concepts$ = new BehaviorSubject(concepts).asObservable();
  
      // Create charts for each concept after concepts load
      concepts.forEach((concept, index) => {
        this.createCircularChart(concept, index);
      });
    });
  }
  
  

  createCircularChart(concept: any, index: number): void {
    const chartId = `CircularChart-${index}`;
    console.log(`Creating chart with ID: ${chartId}`);
  
    setTimeout(() => {
      const element = document.getElementById(chartId) as HTMLCanvasElement;
  
      if (element) {
        new Chart(element, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'Remaining'],
            datasets: [
              {
                data: [concept.progress, 100 - concept.progress],
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
      } else {
        console.warn(`Chart element not found for ID: ${chartId}`);
      }
    }, 0); // Delay ensures DOM is updated
  }
  
  
  logout() {
    this.authService.logout(); // Use AuthService to clear session
    this.router.navigate(['/login']); // Redirect to login
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
