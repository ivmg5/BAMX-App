import { View, StyleSheet, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useFirebase } from '../db/FirebaseContext';
import { doc, getDoc } from 'firebase/firestore';

export default function NotificacionesItem({ item }: any) {
    const { db } = useFirebase();
    const [producto, setProducto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (db) {
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
        };
        fetchData().then(() => setLoading(false));
    }, [db, item]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!producto) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error cargando datos del producto</Text>
            </View>
        );
    }

    const timestamp = formatDistanceToNow(new Date(item.fecha.seconds * 1000), { addSuffix: true });

    return (
        <View style={styles.notificationContainer}>
            <Text style={styles.timestamp}>{timestamp}</Text>
            <Text style={{ paddingBottom: 10 }}>
            {producto.nombre} {item.inStock ? 'se ha reabastecido' : 'ha llegado al minimo'} 
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    notificationContainer: {
        marginTop: 20,
        marginHorizontal: '5%',
        backgroundColor: '#d4d4d4',
        width: '90%',
        padding: 10,
        borderRadius: 20,
    },
    timestamp: {
        color: '#aaa',
        fontSize: 12,
        textAlign: 'right',
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    errorContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
    },
});
