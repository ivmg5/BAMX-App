import { collection, query, getDocs } from 'firebase/firestore';

export const fetchDonantes = async (db) => {
    try {
        if (db) {
            const q = query(collection(db, 'Donantes'));
            const snapshot = await getDocs(q);
            const donantesData = snapshot.docs.map(doc => ({
                label: doc.data().nombre,
                value: doc.id
            }));
            return donantesData;
        }
    } catch (error) {
        console.error('Error fetching donantes:', error);
    }
    return [];
};