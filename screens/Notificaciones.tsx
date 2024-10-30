import { View, StyleSheet, Text, ImageBackground, Pressable, FlatList, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import NotificacionesItem from '../components/NotificacionesItem';

const background = require('../assets/backgroundMainSmall.png');

export default function Notificaciones({ navigation }: any) {
    const { db } = useFirebase();
    const [data, setData] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (db) {
            const snapshot = query(collection(db, 'Notificaciones'), orderBy('fecha', 'desc'));
            const data = await getDocs(snapshot);
            setData(data.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
    };

    useEffect(() => {
        fetchData();
    }, [db]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" style={styles.backArrow} />
                    </Pressable>
                    <Text style={styles.title}>Notificaciones</Text>
                </View>
                <View style={{ marginTop: '20%', marginBottom: '50%', width: '100%' }}>
                    {
                        data.length > 0 ? (
                            <FlatList 
                                data={data}
                                renderItem={({ item }) => <NotificacionesItem item={item} />}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                            />
                        ) : (
                            <Text style={{justifyContent: 'center', alignSelf: 'center', fontSize: 20, color: 'black'}}>No hay notificaciones</Text>
                        )
                    }
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    back: {
        flex: 1,
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingTop: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
        paddingRight: 80,
    },
    backArrow: {
        paddingLeft: 20,
        fontSize: 40,
        color: 'white',
    },
});
