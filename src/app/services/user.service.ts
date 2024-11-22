import { Injectable } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private indexedDBService: IndexedDBService) {}

  // Register a new user
  async registerUser(email: string, password: string): Promise<boolean> {
    const db = await this.indexedDBService.openDatabase();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');

    const user = await this.getUserByEmail(email);
    if (user) {
      throw new Error('User already exists');
    }

    const newUser = { email, password };
    store.put(newUser);
    return true;
  }

  // Login user
  async loginUser(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      localStorage.setItem('loggedInUser', JSON.stringify(user)); // Persist login
      return true;
    }
    throw new Error('Invalid credentials');
  }

  // Logout user
  logoutUser(): void {
    localStorage.removeItem('loggedInUser');
  }

  // Get user by email
  private async getUserByEmail(email: string): Promise<any> {
    const db = await this.indexedDBService.openDatabase();
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const request = store.get(email);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
