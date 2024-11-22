import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

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
  userId?: string; // Shared if undefined, user-specific if set
}

@Injectable({
  providedIn: 'root',
})
export class ConceptService {
  private dbUrl = 'assets/db.json';
  private concepts$ = new BehaviorSubject<Concept[]>([]);

  constructor(
    private http: HttpClient,
    private indexedDBService: IndexedDBService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.initializeData();
  }

  private initializeData(): void {
    console.log('Initializing concepts data...');
    const user = this.authService.getLoggedInUser();
    if (!user) {
      console.warn('No user logged in. Initialization skipped.');
      return;
    }
  
    this.indexedDBService.getData('concepts').then((concepts) => {
      console.log('Existing concepts in IndexedDB:', concepts);
      if (concepts.length === 0) {
        this.http.get<{ concepts: Concept[] }>(this.dbUrl).subscribe((response) => {
          const sharedConcepts = response.concepts.map((concept) => ({
            ...concept,
            userId: undefined, // Shared concepts have no userId
          }));
  
          console.log('Fetched shared concepts from db.json:', sharedConcepts);
  
          this.indexedDBService.addBulkData('concepts', sharedConcepts).then(() => {
            console.log('Shared concepts added to IndexedDB');
            this.loadConcepts();
          });
        });
      } else {
        console.log('Concepts already exist in IndexedDB. Skipping initialization.');
        this.loadConcepts();
      }
    });
  }
  
  

  getConcepts() {
    return this.concepts$.asObservable();
  }

  addConcept(newConcept: { name: string }): void {
    const user = this.authService.getLoggedInUser();
    if (!user) return;
  
    // Find the maximum existing concept ID
    this.indexedDBService.getData('concepts').then((concepts) => {
      const maxId = concepts.length > 0 ? Math.max(...concepts.map(c => c.id)) : 0;
      const newId = maxId + 1;
  
      const conceptToAdd: Concept = {
        id: newId,
        name: newConcept.name,
        progress: 0,
        subconcepts: [],
        userId: user.id, // Associate concept with the current user
      };
  
      this.indexedDBService.addData('concepts', conceptToAdd).then(() => {
        this.loadConcepts();
      });
    });
  }
  
  addSubConcept(conceptId: number, newSubConcept: { name: string }): void {
    this.indexedDBService.getData('concepts').then((concepts) => {
      const conceptToUpdate = concepts.find((concept: Concept) => concept.id === conceptId);
      if (!conceptToUpdate) return;
  
      // Find the maximum existing subconcept ID
      const maxSubId = conceptToUpdate.subconcepts.length > 0
        ? Math.max(...conceptToUpdate.subconcepts.map((sub: { id: any; }) => sub.id))
        : 0;
      const newSubId = maxSubId + 1;
  
      const subConceptToAdd: SubConcept = { id: newSubId, name: newSubConcept.name, progress: 0 };
  
      conceptToUpdate.subconcepts.push(subConceptToAdd);
      conceptToUpdate.progress = this.calculateOverallProgress(conceptToUpdate.subconcepts);
  
      this.indexedDBService.addData('concepts', conceptToUpdate).then(() => {
        this.loadConcepts();
      });
    });
  }
  

  updateSubConceptProgress(conceptId: number, subConceptId: number, progress: number): void {
    this.indexedDBService.getData('concepts').then((concepts) => {
      const conceptToUpdate = concepts.find((concept: Concept) => concept.id === conceptId);
      if (!conceptToUpdate) return;

      const updatedSubconcepts = conceptToUpdate.subconcepts.map((sub: { id: number; }) =>
        sub.id === subConceptId ? { ...sub, progress } : sub
      );

      conceptToUpdate.subconcepts = updatedSubconcepts;
      conceptToUpdate.progress = this.calculateOverallProgress(updatedSubconcepts);

      this.indexedDBService.addData('concepts', conceptToUpdate).then(() => {
        this.loadConcepts();
      });
    });
  }

deleteConcept(conceptId: number): void {
  const user = this.authService.getLoggedInUser();
  if (!user) return;

  this.indexedDBService.getData('concepts').then((concepts) => {
    const conceptToDelete = concepts.find((c: Concept) => c.id === conceptId);
    if (!conceptToDelete) return;

    if (conceptToDelete.userId && conceptToDelete.userId !== user.id) {
      alert('You cannot delete shared concepts!');
      return;
    }

    this.indexedDBService.deleteData('concepts', conceptId).then(() => {
      this.loadConcepts();
    });
  });
}

deleteSubConcept(conceptId: number, subConceptId: number): void {
  this.indexedDBService.getData('concepts').then((concepts) => {
    const conceptToUpdate = concepts.find((concept: Concept) => concept.id === conceptId);
    if (!conceptToUpdate) return;

    conceptToUpdate.subconcepts = conceptToUpdate.subconcepts.filter(
      (sub: SubConcept) => sub.id !== subConceptId
    );
    conceptToUpdate.progress = this.calculateOverallProgress(conceptToUpdate.subconcepts);

    this.indexedDBService.addData('concepts', conceptToUpdate).then(() => {
      this.loadConcepts();
    });
  });
}


  private calculateOverallProgress(subconcepts: SubConcept[]): number {
    if (subconcepts.length === 0) return 0;

    const totalProgress = subconcepts.reduce((sum, sub) => sum + sub.progress, 0);
    return parseFloat((totalProgress / subconcepts.length).toFixed(2));
  }

  private loadConcepts(): void {
    const user = this.authService.getLoggedInUser();
    if (!user) return;

    this.indexedDBService.getData('concepts').then((concepts) => {
      const userSpecificConcepts = concepts.filter(
        (concept: Concept) => concept.userId === user.id || concept.userId === undefined
      );
      this.concepts$.next(userSpecificConcepts);
    });
  }
}
