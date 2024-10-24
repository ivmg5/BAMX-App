import { Text, View, StyleSheet, ImageBackground, Pressable, Image, ActivityIndicator, Dimensions } from 'react-native';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import { doc, onSnapshot, collection, updateDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

const background = require('../assets/backgroundMain.png');
const logo = require('../assets/manzana_logo.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MainMenu({ navigation }: any) {
    const { auth, db } = useFirebase();
    const currentUser = auth?.currentUser;
    const [usuario, setUsuario] = useState<any>(null);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [totalNotificaciones, setTotalNotificaciones] = useState(0);

    useEffect(() => {
        if (db && currentUser) {
            const usuarioRef = doc(db, 'Usuarios', currentUser.uid);
            const unsubscribeUser = onSnapshot(usuarioRef, async (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    setUsuario(userData);
                    const notificationsQuery = collection(db, 'Notificaciones');
                    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
                        const totalNotificaciones = snapshot.size;
                        setTotalNotificaciones(totalNotificaciones);
                        if (userData.notifRead < totalNotificaciones) {
                            setHasUnreadNotifications(true);
                        } else {
                            setHasUnreadNotifications(false);
                        }
                    });
                    return () => unsubscribeNotifications();
                }
            });
            return () => unsubscribeUser();
        }
    }, [db]);

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={background} resizeMode='cover' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => { if (auth) signOut(auth) }}>
                        <Ionicons name="log-out" style={styles.leftHeaderItem} />
                    </Pressable>
                    <Pressable onPress={() => {
                        if (db && usuario && currentUser?.uid) {
                            updateDoc(doc(db, 'Usuarios', currentUser?.uid), { notifRead: totalNotificaciones })
                                .then(() => {
                                    console.log('Successfully updated notifRead');
                                    navigation.navigate('Notificaciones');
                                })
                                .catch((error) => {
                                    console.error('Error updating notifRead:', error);
                                });
                        } else {
                            console.error('Missing db, usuario, or usuario.uid:', { db: !!db, usuario: !!usuario, uid: usuario?.uid });
                        }
                    }}>
                        <Ionicons name={hasUnreadNotifications ? "notifications" : "notifications-outline"} style={styles.rightHeaderItem} />
                    </Pressable>
                </View>
                <Image source={logo} style={styles.logo} />
                <Text style={styles.welcome}>{usuario ? `Bienvenido, ${usuario.username}` : 'Cargando...'}</Text>
                {usuario ? <Text style={styles.welcome}>Menu Principal</Text> : <ActivityIndicator size="large" color="#000" />}

                <View style={styles.menu}>
                    {usuario?.entradaSalida ?
                        <>
                            <Pressable style={styles.button} onPress={() => { navigation.navigate('Entrada') }}>
                                <Text style={styles.buttonText}>Entrada de Producto</Text>
                            </Pressable>
                            <Pressable style={styles.button} onPress={() => { navigation.navigate('Salida') }}>
                                <Text style={styles.buttonText}>Salida de Producto</Text>
                            </Pressable>
                        </>
                        :
                        <></>
                    }
                    {usuario?.inventario ?
                        <>
                            <Pressable style={styles.button} onPress={() => { navigation.navigate('Inventario') }}>
                                <Text style={styles.buttonText}>Inventario</Text>
                            </Pressable>
                        </>
                        :
                        <></>
                    }
                    {usuario?.reporte ?
                        <>
                            <Pressable style={styles.button} onPress={() => { navigation.navigate('Reporte') }}>
                                <Text style={styles.buttonText}>Reporte</Text>
                            </Pressable>
                        </>
                        :
                        <></>
                    }
                    {usuario?.historial ?
                        <>
                            <Pressable style={styles.button} onPress={() => { navigation.navigate('Historial') }}>
                                <Text style={styles.buttonText}>Historial</Text>
                            </Pressable>
                        </>
                        :
                        <></>
                    }
                    {usuario?.admin ?
                        <>
                            <Text>Administrador</Text>
                            <View style={styles.adminButtons}>
                                <Pressable style={styles.adminButton} onPress={() => { navigation.navigate('Editar', { type: 'Donantes' }) }}>
                                    <Text style={styles.adminButtonText}>Donante</Text>
                                </Pressable>
                                <Pressable style={styles.adminButton} onPress={() => { navigation.navigate('Editar', { type: 'Usuarios' }) }}>
                                    <Text style={styles.adminButtonText}>Usuarios</Text>
                                </Pressable>
                                <Pressable style={styles.adminButton} onPress={() => { navigation.navigate('Editar', { type: 'Productos' }) }}>
                                    <Text style={styles.adminButtonText}>Producto</Text>
                                </Pressable>
                            </View>
                        </>
                        :
                        <></>
                    }
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    back: {
        flex: 1,
        alignItems: 'center',
    },
    input: {
        padding: 10,
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        width: 200,
        backgroundColor: 'lightgray',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        margin: 20,
    },
    welcome: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingTop: 40,
    },
    leftHeaderItem: {
        paddingLeft: 20,
        fontSize: 35,
        color: 'white',
    },
    rightHeaderItem: {
        paddingRight: 20,
        fontSize: 35,
        color: 'white',
    },
    button: {
        padding: '2.5%',
        margin: '2.5%',
        borderRadius: 30,
        alignItems: 'center',
        width: '80%',
        height: SCREEN_WIDTH * 0.125,
        backgroundColor: '#CE0F2C',
        justifyContent: 'center',
    },
    menu: {
        marginTop: '5%',
        width: '100%',
        alignItems: 'center',
    },
    adminButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        width: '80%',
    },
    adminButton: {
        padding: '2%',
        margin: '1%',
        borderRadius: 20,
        alignItems: 'center',
        width: '30%', 
        aspectRatio: 1.5, 
        backgroundColor: '#CE0F2C',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.04,
    },
    adminButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.03, 
        textAlign: 'center',
    },
});