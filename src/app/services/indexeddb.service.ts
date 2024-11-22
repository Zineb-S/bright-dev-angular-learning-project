import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'ConceptsDB';

  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 3); // Increment version if necessary
  
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
  
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'email' });
          console.log('Created users store');
        }
  
        if (!db.objectStoreNames.contains('concepts')) {
          db.createObjectStore('concepts', { keyPath: 'id' });
          console.log('Created concepts store');
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  addUser(user: any): Promise<void> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      return new Promise<void>((resolve, reject) => {
        const request = store.put(user); // Use put to update or add
        request.onsuccess = () => {
          console.log('User added to IndexedDB:', user);
          resolve();
        };
        request.onerror = () => {
          console.error('Failed to add user to IndexedDB:', request.error);
          reject(request.error);
        };
      });
    });
  }
  
  getUser(email: string): Promise<any> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      return new Promise<any>((resolve, reject) => {
        const request = store.get(email); // Get user by email
        request.onsuccess = () => {
          console.log('Fetched user from IndexedDB:', request.result);
          resolve(request.result);
        };
        request.onerror = () => {
          console.error('Failed to fetch user from IndexedDB:', request.error);
          reject(request.error);
        };
      });
    });
  }
  
  
  getData(storeName: string): Promise<any[]> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      return new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  addData(storeName: string, data: any): Promise<void> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      return new Promise<void>((resolve, reject) => {
        store.put(data);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    });
  }

  addBulkData(storeName: string, data: any[]): Promise<void> {
    console.log(`Adding bulk data to store: ${storeName}`, data);
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
  
      return new Promise<void>((resolve, reject) => {
        data.forEach((item) => {
          const request = store.put(item);
          request.onsuccess = () => console.log(`Added item to ${storeName}:`, item);
          request.onerror = () => console.error(`Failed to add item:`, item);
        });
  
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    });
  }
  
  deleteData(storeName: string, id: number): Promise<void> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      return new Promise<void>((resolve, reject) => {
        store.delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    });
  }
}
