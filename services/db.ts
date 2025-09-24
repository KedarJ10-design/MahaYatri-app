import { DetailedItinerary, Booking } from '../types';

const DB_NAME = 'MahaYatriDB';
const DB_VERSION = 1;
const ITINERARY_STORE = 'itineraries';
const BOOKINGS_STORE = 'bookings';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(ITINERARY_STORE)) {
        dbInstance.createObjectStore(ITINERARY_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!dbInstance.objectStoreNames.contains(BOOKINGS_STORE)) {
        dbInstance.createObjectStore(BOOKINGS_STORE, { keyPath: 'id' });
      }
    };
  });
};

const getStore = (storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> => {
    return openDB().then(dbInstance => {
        const transaction = dbInstance.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    });
};

export const saveItinerary = async (itinerary: DetailedItinerary): Promise<void> => {
    try {
        const store = await getStore(ITINERARY_STORE, 'readwrite');
        // We only want to store the latest itinerary. Clear the store first.
        const clearRequest = store.clear();
        return new Promise((resolve, reject) => {
            clearRequest.onsuccess = () => {
                const addRequest = store.add({ ...itinerary, id: 'latest' });
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            };
            clearRequest.onerror = () => reject(clearRequest.error);
        });
    } catch (error) {
        console.error("Failed to save itinerary to IndexedDB", error);
    }
};

export const getLatestItinerary = async (): Promise<DetailedItinerary | null> => {
    try {
        const store = await getStore(ITINERARY_STORE, 'readonly');
        const request = store.get('latest');
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result as DetailedItinerary | null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get itinerary from IndexedDB", error);
        return null;
    }
};

export const saveBookings = async (bookings: Booking[]): Promise<void> => {
    if (!bookings || bookings.length === 0) return;
    try {
        const store = await getStore(BOOKINGS_STORE, 'readwrite');
        const transaction = store.transaction;
        
        // Clear old bookings before saving new ones to ensure sync
        store.clear(); 
        
        bookings.forEach(booking => {
            store.put(booking);
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error("Failed to save bookings to IndexedDB", error);
    }
};

export const getBookings = async (): Promise<Booking[]> => {
     try {
        const store = await getStore(BOOKINGS_STORE, 'readonly');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result as Booking[]);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Failed to get bookings from IndexedDB", error);
        return [];
    }
};