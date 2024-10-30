import { View, StyleSheet, Text, ImageBackground, Pressable, FlatList, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import HistorialItem from '../components/HistorialItem';
import DropDownPicker from 'react-native-dropdown-picker';

const background = require('../assets/backgroundMainSmall.png');

export default function Historial({ navigation }: any) {
    const { db } = useFirebase();
    const [data, setData] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [items, setItems] = useState<any[]>([]);

    const fetchData = async () => {
        if (db) {
            const snapshot = query(collection(db, 'Historial'), orderBy('fecha', 'desc'));
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

    useEffect(() => {
        if (db) {
            const fetchUsers = async () => {
                const querySnapshot = await getDocs(collection(db, 'Usuarios'));
                setItems([
                    { label: "Todos los usuarios", value: null },
                    ...querySnapshot.docs.map(doc => ({
                        label: doc.data().nombre,
                        value: doc.id
                    }))
                ]);
            };
            fetchUsers();
        }
    }, [db]);

    const filteredData = data.filter(item => {
        if (selectedUser === null) {
            return true;
        }
        const usuarioId = item.usuario.path.split('/').pop();
        return usuarioId === selectedUser;
    });

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" style={styles.backArrow} />
                    </Pressable>
                    <Text style={styles.title}>Historial</Text>
                </View>
                <View style={{ marginTop: '20%', marginBottom: '75%', width: '100%' }}>
                    {
                        data.length > 0 ? (
                            <View>
                                <DropDownPicker
                                    items={items}
                                    open={open}
                                    setOpen={setOpen}
                                    value={selectedUser}
                                    setValue={setSelectedUser}
                                    placeholder='Buscar usuario'
                                    style={styles.dropdown}
                                />
                                <FlatList
                                    data={filteredData}
                                    renderItem={({ item }) => <HistorialItem item={item} />}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                        />
                                    }
                                />
                            </View>
                        ) : (
                            <Text style={{ justifyContent: 'center', alignSelf: 'center', fontSize: 20, color: 'black' }}>No hay historial</Text>
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
    dropdown: {
        marginHorizontal: '5%',
        width: '90%',
        borderRadius: 20,
    },
});
