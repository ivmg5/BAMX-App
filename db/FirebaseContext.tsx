import React from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextType {
    app: FirebaseApp | null;
    auth: Auth | null;
    db: Firestore | null;
    storage: FirebaseStorage | null;
}

export const FirebaseContext = React.createContext<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
    storage: null,
});

export const useFirebase = () => React.useContext(FirebaseContext);