
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseInit';

// Generic listener for any collection
export const listenToCollection = <T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const q = collection(db, collectionName);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: T[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as T);
            });
            callback(data);
        }, (error) => {
            console.error(`Error fetching collection ${collectionName}:`, error);
            onError(error);
        });

    return unsubscribe;
};

// Generic save (create or update) function
export const save = async <T extends { id: string }>(collectionName: string, item: T): Promise<void> => {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
};


// Generic remove function
export const remove = async (collectionName: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, collectionName, id));
};


export const clearCompletedOrders = async (): Promise<void> => {
    const ordersCollection = collection(db, 'orders');
    
    // Query to get only completed orders
    const q = query(ordersCollection, where("endTime", "!=", null));
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return; // No completed orders to delete
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};