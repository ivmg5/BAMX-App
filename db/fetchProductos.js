import { collection, query, getDocs } from 'firebase/firestore';

//Este es el fetch de productos que se usa en la pantalla de entrada y salida
//este se usa para las dropdowns de productos ya que formatean los datos para que sean usados en el dropdown
export const fetchProductos = async (db, selectedCategoria) => {
    try {
        if (db) {
            const q = query(collection(db, 'Inventario/Categorias/' + selectedCategoria));
            const snapshot = await getDocs(q);
            const productosData = snapshot.docs.map(doc => ({
                label: doc.data().nombre,
                value: doc.id
            }));
            return productosData;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
    return [];
};