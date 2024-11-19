import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { NotificationService } from './notification.service';
interface SubConcept {
  id: number;
  name: string;
  progress: number;
}

interface Concept {
  id: number;
  name: string;
  progress: number;
  subconcepts: SubConcept[];
}

@Injectable({
  providedIn: 'root',
})
export class ConceptService {
  private dbUrl = 'assets/db.json'; // Path to your local JSON file
  private concepts$ = new BehaviorSubject<Concept[]>([]);
 

  constructor(private http: HttpClient, private indexedDBService: IndexedDBService,private notificationService: NotificationService) {
    this.initializeData();
  }

  // Initialize data from IndexedDB or load from assets/db.json
  private initializeData(): void {
    this.indexedDBService.getData().then((data) => {
      if (data.length === 0) {
        // If IndexedDB is empty, fetch data from db.json
        this.http.get<{ concepts: Concept[] }>(this.dbUrl).subscribe((response) => {
          this.indexedDBService.addData(response.concepts).then(() => {
            this.loadConcepts(); // Load concepts into BehaviorSubject
          });
        });
      } else {
        this.loadConcepts(); // Load concepts from IndexedDB
      }
    });
  }

  // Load concepts from IndexedDB
  private loadConcepts(): void {
    this.indexedDBService.getData().then((data) => {
      this.concepts$.next(data);
    });
  }

  // Get observable for concepts
  getConcepts() {
    return this.concepts$.asObservable();
  }

  // Add a new concept
  addConcept(newConcept: { name: string }): void {
    const currentConcepts = this.concepts$.value;
    const newId = currentConcepts.length > 0 ? Math.max(...currentConcepts.map((c) => c.id)) + 1 : 1;

    const conceptToAdd: Concept = {
      id: newId,
      name: newConcept.name,
      progress: 0,
      subconcepts: [],
    };

    const updatedConcepts = [...currentConcepts, conceptToAdd];
    this.indexedDBService.addData(updatedConcepts).then(() => {
      this.loadConcepts();
    });
  }

  // Add a new subconcept
  addSubConcept(conceptId: number, newSubConcept: { name: string }): void {
    const currentConcepts = this.concepts$.value;
    const conceptToUpdate = currentConcepts.find((c) => c.id === conceptId);
    if (!conceptToUpdate) return;

    const newSubId =
      conceptToUpdate.subconcepts.length > 0
        ? Math.max(...conceptToUpdate.subconcepts.map((sub) => sub.id)) + 1
        : 1;

    const subConceptToAdd = {
      id: newSubId,
      name: newSubConcept.name,
      progress: 0,
    };

    const updatedSubconcepts = [...conceptToUpdate.subconcepts, subConceptToAdd];
    const updatedConcept = {
      ...conceptToUpdate,
      subconcepts: updatedSubconcepts,
      progress: this.calculateOverallProgress(updatedSubconcepts),
    };

    const updatedConcepts = currentConcepts.map((c) =>
      c.id === conceptId ? updatedConcept : c
    );

    this.indexedDBService.addData(updatedConcepts).then(() => {
      this.loadConcepts();
    });
  }

  // Update subconcept progress
  updateSubConceptProgress(conceptId: number, subConceptId: number, progress: number): void {
    const currentConcepts = this.concepts$.value;
    const conceptToUpdate = currentConcepts.find((c) => c.id === conceptId);
    if (!conceptToUpdate) return;

    const updatedSubconcepts = conceptToUpdate.subconcepts.map((sub) =>
      sub.id === subConceptId ? { ...sub, progress } : sub
    );

    const updatedConcept = {
      ...conceptToUpdate,
      subconcepts: updatedSubconcepts,
      progress: this.calculateOverallProgress(updatedSubconcepts),
    };

    const updatedConcepts = currentConcepts.map((c) =>
      c.id === conceptId ? updatedConcept : c
    );

    this.indexedDBService.addData(updatedConcepts).then(() => {
      this.loadConcepts();

      // Trigger a notification
      const updatedSubconcept = updatedSubconcepts.find((sub) => sub.id === subConceptId);
      if (updatedSubconcept?.progress === 100) {
        this.notificationService.sendNotification(
          `You just completed "${updatedSubconcept.name}"!`
        );
      }
    });
  }

  // Delete a concept
  deleteConcept(conceptId: number): void {
    // Filter out the concept to delete
    const updatedConcepts = this.concepts$.value.filter((concept) => concept.id !== conceptId);
  
    // Update IndexedDB
    this.indexedDBService.addData(updatedConcepts).then(() => {
      // Update the BehaviorSubject after successfully updating IndexedDB
      this.concepts$.next(updatedConcepts);
    });
  }
  
  

  // Delete a subconcept
  deleteSubConcept(conceptId: number, subConceptId: number): void {
    const currentConcepts = this.concepts$.value;
    const conceptToUpdate = currentConcepts.find((c) => c.id === conceptId);
    if (!conceptToUpdate) return;

    const updatedSubconcepts = conceptToUpdate.subconcepts.filter((sub) => sub.id !== subConceptId);
    const updatedConcept = {
      ...conceptToUpdate,
      subconcepts: updatedSubconcepts,
      progress: this.calculateOverallProgress(updatedSubconcepts),
    };

    const updatedConcepts = currentConcepts.map((c) =>
      c.id === conceptId ? updatedConcept : c
    );

    this.indexedDBService.addData(updatedConcepts).then(() => {
      this.loadConcepts();
    });
  }

  // Helper method to calculate overall progress
  private calculateOverallProgress(subconcepts: SubConcept[]): number {
    if (subconcepts.length === 0) {
      return 0; // No subconcepts, progress is 0
    }
  
    const totalProgress = subconcepts.reduce((sum, sub) => sum + sub.progress, 0);
    const averageProgress = totalProgress / subconcepts.length;
  
    // Round the result to 2 decimal places
    return parseFloat(averageProgress.toFixed(2));  // Convert the result back to a number
  }
}
