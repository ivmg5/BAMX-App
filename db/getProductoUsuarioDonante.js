import { doc, getDoc } from 'firebase/firestore';

export const getProductoUsuarioDonante = async (db, item, setProducto, setUsuario, setDonante) => {
    if (db && item.producto && item.producto.path) {
        try {
            const docRef = doc(db, item.producto.path);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProducto(docSnap.data());
            } else {
                console.error('No such product document!');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }

    if (db && item.usuario && item.usuario.path) {
        try {
            const userDocRef = doc(db, item.usuario.path);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setUsuario(userDocSnap.data());
            } else {
                console.error('No such user document!');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }

    if (db && item.donante && item.donante.path) {
        try {
            const donanteDocRef = doc(db, item.donante.path);
            const donanteDocSnap = await getDoc(donanteDocRef);
            if (donanteDocSnap.exists()) {
                setDonante(donanteDocSnap.data());
            } else {
                console.error('No such donante document!');
            }
        } catch (error) {
            console.error('Error fetching donante:', error);
        }
    }
};