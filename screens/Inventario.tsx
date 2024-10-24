import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import CategoryItem from '../components/CategoryItem';
import { useFirebase } from '../db/FirebaseContext';
import getCategorias from '../db/getCategorias';

export default function Inventario({ navigation }: any) {

    const { db } = useFirebase();
    const [categorias, setCategorias] = useState<any[]>([]);

    useEffect(() => {
        if (db) {
            getCategorias(db).then((categorias) => {
                setCategorias(categorias);
            });
        }
    }, [db]);

    return (
        <View style={styles.container}>
            {
                categorias.length > 0 ?
                    <FlatList
                        data={categorias}
                        renderItem={({ item }) => <CategoryItem title={item} navigation={navigation} />}
                    />
                    :
                    <ActivityIndicator size="large" color="#000" />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
});