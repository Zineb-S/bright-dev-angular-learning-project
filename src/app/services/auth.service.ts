import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInUser: any = null;

  constructor(private indexedDBService: IndexedDBService) {
    this.loadUserFromStorage(); // Ensure this is called
  }
  

  register(email: string, password: string): Promise<string> {
    return this.getUser(email).then((existingUser) => {
      if (existingUser) {
        return Promise.reject('Email already exists.');
      }

      // Load shared concepts from db.json
      return fetch('assets/db.json')
        .then((response) => response.json())
        .then((data) => {
          const newUser = { email, password, id: crypto.randomUUID(), concepts: [...data.concepts] };
          console.log('New user to register:', newUser);
          return this.indexedDBService.addUser(newUser).then(() => 'Registration successful.');
        });
    });
  }

  login(email: string, password: string): Promise<any> {
    return this.getUser(email).then((user) => {
      console.log('Fetched user:', user);
      if (user && user.password === password) {
        this.loggedInUser = user;
        this.saveUserToStorage(); // Save user to local storage
        return Promise.resolve(user);
      }
      return Promise.reject('Invalid email or password.');
    });
  }
  

  logout(): void {
    this.loggedInUser = null;
    console.log('Logged out. Clearing local storage.');
    localStorage.removeItem('loggedInUser');
  }
  

  getLoggedInUser(): any {
    return this.loggedInUser;
  }

  private saveUserToStorage(): void {
    if (this.loggedInUser) {
      console.log('Saving user to local storage:', this.loggedInUser);
      localStorage.setItem('loggedInUser', JSON.stringify(this.loggedInUser));
    } else {
      console.warn('No user to save to local storage.');
    }
  }
  
  private loadUserFromStorage(): void {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      this.loggedInUser = JSON.parse(user);
      console.log('Loaded user from local storage:', this.loggedInUser);
    } else {
      console.warn('No user found in local storage.');
    }
  }
  

  private getUser(email: string): Promise<any> {
    return this.indexedDBService.getUser(email).then((user) => {
      console.log('Retrieved user from IndexedDB:', user);
      return user;
    });
  }
}
