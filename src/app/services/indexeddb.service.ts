import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'ConceptsDB';
  private storeName = 'concepts';

  // Open or create the database
  openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Create an object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Get all data from the store
  getData(): Promise<any[]> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      return new Promise<any[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Add data to the store
  addData(data: any[]): Promise<void> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
  
      // Clear the store before adding new data
      const clearRequest = store.clear();
  
      return new Promise<void>((resolve, reject) => {
        clearRequest.onsuccess = () => {
          // Add the new data after clearing the store
          data.forEach((item) => store.put(item));
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        clearRequest.onerror = () => reject(clearRequest.error);
      });
    });
  }
  

  // Clear all data from the store
  clearData(): Promise<void> {
    return this.openDatabase().then((db) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }
}
