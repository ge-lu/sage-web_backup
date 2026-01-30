import { 
    MOCK_CONTACTS, 
    MOCK_TASKS, 
    MOCK_BILLS, 
    MOCK_SECURITY_EVENTS, 
    MOCK_COMMERCE_ITEMS, 
    MOCK_RIDE 
} from '../constants';
import { 
    Contact, 
    Task, 
    Bill, 
    SecurityEvent, 
    CommerceItem, 
    RideSession,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    Medication
} from '../types';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// This service layer acts as the bridge. 
// Currently it returns MOCK data, but it is structured to easily switch to Firebase calls.

// 1. Contacts
export const getContacts = async (): Promise<Contact[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'contacts'));
        if (snapshot.empty) {
            console.log("No contacts in Firestore, returning MOCK_CONTACTS");
            return MOCK_CONTACTS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
    } catch (error) {
        console.warn("Error fetching contacts from Firestore, returning MOCK_CONTACTS", error);
        return MOCK_CONTACTS;
    }
};

export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    try {
        const docRef = await addDoc(collection(db, 'contacts'), contact);
        return { id: docRef.id, ...contact };
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
};

export const deleteContact = async (contactId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'contacts', contactId));
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
};

// 2. Tasks
export const getTasks = async (): Promise<Task[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'tasks'));
        if (snapshot.empty) {
            console.log("No tasks in Firestore, returning MOCK_TASKS");
            return MOCK_TASKS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    } catch (error) {
        console.warn("Error fetching tasks from Firestore, returning MOCK_TASKS", error);
        return MOCK_TASKS;
    }
};

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
    try {
        const docRef = await addDoc(collection(db, 'tasks'), task);
        return { id: docRef.id, ...task };
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};

// 3. Bills
export const getBills = async (): Promise<Bill[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'bills'))).docs.map(...)
    return Promise.resolve(MOCK_BILLS);
};

// 4. Security Events
export const getSecurityEvents = async (): Promise<SecurityEvent[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'security_events'))).docs.map(...)
    return Promise.resolve(MOCK_SECURITY_EVENTS);
};

// 5. Commerce Items
export const getCommerceItems = async (): Promise<CommerceItem[]> => {
    // TODO: Switch to: (await getDocs(collection(db, 'commerce_items'))).docs.map(...)
    return Promise.resolve(MOCK_COMMERCE_ITEMS);
};

// 6. Ride Session
export const getCurrentRide = async (): Promise<RideSession | null> => {
    // TODO: Switch to: doc(db, 'rides', 'current_user_id')
    return Promise.resolve(MOCK_RIDE);
};

// 7. Auth
export const login = async (req: LoginRequest): Promise<AuthResponse> => {
    // TODO: Implement Firebase Auth: signInWithEmailAndPassword(auth, req.email, req.password)
    console.log('Mock Login Request:', req);
    
    // Simulate successful login
    const mockUser: User = {
        id: 'u_123',
        name: 'Sage User',
        email: req.email,
        role: 'user',
        avatarSeed: 'sage_core'
    };
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'mock_jwt_token_12345',
                user: mockUser
            });
        }, 800);
    });
};

export const register = async (req: RegisterRequest): Promise<AuthResponse> => {
    // TODO: Implement Firebase Auth: createUserWithEmailAndPassword(auth, req.email, req.password)
    console.log('Mock Register Request:', req);
    
    const newUser: User = {
        id: `u_${Date.now()}`,
        name: req.name,
        email: req.email,
        role: 'user',
        avatarSeed: req.avatarSeed || 'default_seed'
    };
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'mock_jwt_token_new_user',
                user: newUser
            });
        }, 1000);
    });
};

// 7. Medications
export const getMedications = async (): Promise<Medication[]> => {
    try {
        const snapshot = await getDocs(collection(db, 'medications'));
        if (snapshot.empty) {
            console.log("No medications in Firestore, returning empty array");
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication));
    } catch (error) {
        console.warn("Error fetching medications from Firestore, returning empty array", error);
        return [];
    }
};

export const createMedication = async (medication: Omit<Medication, 'id'>): Promise<Medication> => {
    try {
        const docRef = await addDoc(collection(db, 'medications'), medication);
        return { id: docRef.id, ...medication };
    } catch (error) {
        console.error("Error creating medication:", error);
        throw error;
    }
};

export const updateMedication = async (medicationId: string, updates: Partial<Medication>): Promise<void> => {
    try {
        await updateDoc(doc(db, 'medications', medicationId), updates);
    } catch (error) {
        console.error("Error updating medication:", error);
        throw error;
    }
};

export const deleteMedication = async (medicationId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'medications', medicationId));
    } catch (error) {
        console.error("Error deleting medication:", error);
        throw error;
    }
};
