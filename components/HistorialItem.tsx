import { View, StyleSheet, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useFirebase } from '../db/FirebaseContext';
import { getProductoUsuarioDonante } from '../db/getProductoUsuarioDonante';

export default function HistorialItem({ item }: any) {
    const { db } = useFirebase();
    const [producto, setProducto] = useState<any>(null);
    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [donante, setDonante] = useState<any>(null);

    useEffect(() => {

        getProductoUsuarioDonante(db, item, setProducto, setUsuario, setDonante)
            .then(() => setLoading(false));
    }, [db, item.producto, item.usuario, item.donante]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!producto || !usuario) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error cargando datos del producto o usuario</Text>
            </View>
        );
    }

    const timestamp = formatDistanceToNow(new Date(item.fecha.seconds * 1000), { addSuffix: true });
    let alerta = `${item.tipo }: ${item.cantidad} ${producto.unidad} de ${producto.nombre} \npor ${usuario.nombre}\n${timestamp}`;

    if (donante) {
        alerta += `\nDonante: ${donante.nombre}`;
    }

    return (
        <View style={styles.notificationContainer}>
            <Pressable onPress={() => Alert.alert("Historial", alerta)}>
                <Text style={styles.timestamp}>{timestamp}</Text>
                <Text style={{ paddingBottom: 10 }}>
                    {item.tipo }: {item.cantidad} {producto.unidad} de {producto.nombre}
                </Text>
            </Pressable>
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
