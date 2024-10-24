import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useState, useEffect } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import InventoryItem from '../components/InventoryItem';
import { getProductos } from '../db/getProductos';

export default function InventarioDetalles({ navigation, route }: any) {
    const { db } = useFirebase();
    const { title } = route.params;

    const [productosFormated, setProductosFormated] = useState<any[]>([]);
    const [productos, setProductos] = useState<any[]>([]);
    const [openProductos, setOpenProductos] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const onRefresh = async () => {
        setRefreshing(true);
        await getProductos(setProductos, db, title).then(() => {
            setProductosFormated([
                { label: "Todos", value: null },
                ...productos.map(producto => ({ label: producto.nombre, value: producto.id }))
            ]);
            setRefreshing(false);
        });
    };

    useEffect(() => {
        getProductos(setProductos, db, title)
    }, [db]);

    useEffect(() => {
        setProductosFormated([
            { label: "Todos", value: null },
            ...productos.map(producto => ({ label: producto.nombre, value: producto.id }))
        ]);
        setLoading(false);
    }, [productos]);

    const selectedProductData = productos.find(producto => producto.id === selectedProducto);

    return (
        <View style={styles.container}>
            {loading ? <></> : (
                <DropDownPicker
                    items={productosFormated}
                    open={openProductos}
                    setOpen={setOpenProductos}
                    value={selectedProducto}
                    setValue={setSelectedProducto}
                    placeholder="Buscar producto"
                    searchable={true}
                    listMode='MODAL'
                    zIndex={1000}
                    zIndexInverse={2000}
                />
            )}

            {selectedProducto ? (
                selectedProductData ? (
                    <InventoryItem
                        nombre={selectedProductData.nombre}
                        cantActual={selectedProductData.cantActual}
                        unidad={selectedProductData.unidad}
                        cantMin={selectedProductData.cantMin}
                    />
                ) : (
                    <ActivityIndicator size="large" color="#000" />
                )
            ) : (
                productos.length > 0 ? (
                    <FlatList
                        data={productos}
                        renderItem={({ item }) => (
                            <InventoryItem
                                nombre={item.nombre}
                                cantActual={item.cantActual}
                                unidad={item.unidad}
                                cantMin={item.cantMin}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    />
                ) : (
                    <Text style={styles.text}>No hay productos</Text>
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    text: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    }
});
