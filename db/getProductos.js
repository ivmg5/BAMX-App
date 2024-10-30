import { collection, getDocs } from 'firebase/firestore';

//Este es el get de productos que se usa en la pantalla de inventario
//este se usa para obtener los productos de la db y mostrarlos en la lista
export async function getProductos(setProductos, db, title) {
    if (db) {
        const querySnapshot = await getDocs(collection(db, `/Inventario/Categorias/${title}`));
        const productos = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setProductos(productos);
    }
}; 