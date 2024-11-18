import { Routes } from '@angular/router';
import { ConceptListComponent } from './components/concept-list/concept-list.component';

export const routes: Routes = [
  { path: '', component: ConceptListComponent }, // Default route to display all concepts
  { path: '**', redirectTo: '' }, // Redirect unknown routes to the main page
];
