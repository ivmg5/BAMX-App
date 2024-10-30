import { View, StyleSheet, Text, ImageBackground, Pressable, TextInput, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection,  getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import { fetchCategorias } from '../db/fetchCategorias';
import { fetchProductos } from '../db/fetchProductos';

const background = require('../assets/backgroundMainSmall.png');

export default function Editar({ navigation, route }: any) {
    const { db } = useFirebase();

    if (route.params.type == 'Productos') {
        const [categorias, setCategorias] = useState<any[]>([]);
        const [productos, setProductos] = useState<any[]>([]);
        const [selectedCategoria, setSelectedCategoria] = useState(null);
        const [selectedProducto, setSelectedProducto] = useState(null);
        const [openCategorias, setOpenCategorias] = useState(false);
        const [openProductos, setOpenProductos] = useState(false);
        const [productData, setProductData] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            if (db) {
                fetchCategorias(db).then(setCategorias);
            }
        }, [db]);

        useEffect(() => {
            if (selectedCategoria) {
                fetchProductos(db, selectedCategoria).then(setProductos);
            }
        }, [db, selectedCategoria]);

        useEffect(() => {
            if (selectedProducto && db) {
                const fetchProductData = async () => {
                    const docRef = doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProductData(docSnap.data());
                    }
                };
                fetchProductData();
            }
        }, [db, selectedCategoria, selectedProducto]);

        const handleUpdateProduct = async () => {
            if (!db || !selectedCategoria || !selectedProducto || !productData) return;

            setIsLoading(true);
            try {
                const docRef = doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`);
                await updateDoc(docRef, productData);
                alert('Producto actualizado con éxito');
                navigation.goBack();
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Error al actualizar el producto');
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <View style={styles.container}>
                <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" style={styles.backArrow} />
                        </Pressable>
                        <Text style={styles.title}>Editar {route.params.type}</Text>
                    </View>
                    <View style={styles.content}>
                        <View style={[styles.dropdownContainer, { zIndex: openCategorias ? 3000 : 2000 }]}>
                            <DropDownPicker
                                items={categorias}
                                open={openCategorias}
                                setOpen={setOpenCategorias}
                                value={selectedCategoria}
                                setValue={setSelectedCategoria}
                                placeholder="Seleccionar categoría"
                                zIndex={3000}
                                zIndexInverse={1000}
                            />
                        </View>
                        {selectedCategoria && (
                            <View style={[styles.dropdownContainer, { zIndex: openProductos ? 2000 : 1000 }]}>
                                <DropDownPicker
                                    items={productos}
                                    open={openProductos}
                                    setOpen={setOpenProductos}
                                    value={selectedProducto}
                                    setValue={setSelectedProducto}
                                    placeholder="Seleccionar producto"
                                    zIndex={2000}
                                    zIndexInverse={3000}
                                />
                            </View>
                        )}
                        {productData && (
                            <View style={styles.productDataContainer}>
                                <Text style={styles.productName}>{productData.nombre}</Text>
                                <Text>Cantidad Actual</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cantidad Actual"
                                    value={String(productData.cantActual)}
                                    onChangeText={(text) => setProductData({ ...productData, cantActual: Number(text) })}
                                    keyboardType="numeric"
                                />
                                <Text>Cantidad Mínima</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cantidad Mínima"
                                    value={String(productData.cantMin)}
                                    onChangeText={(text) => setProductData({ ...productData, cantMin: Number(text) })}
                                    keyboardType="numeric"
                                />
                                <Text>Unidad</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Unidad"
                                    value={productData.unidad}
                                    onChangeText={(text) => setProductData({ ...productData, unidad: text })}
                                />
                                {isLoading ? (
                                    <ActivityIndicator size="large" color="#000" />
                                ) : (
                                    <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateProduct}>
                                        <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </View>
        );
    }

    else if (route.params.type == 'Donantes') {
        const [donantes, setDonantes] = useState<any[]>([]);
        const [selectedDonante, setSelectedDonante] = useState(null);
        const [openDonantes, setOpenDonantes] = useState(false);
        const [donanteData, setDonanteData] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            if (db) {
                const fetchDonantes = async () => {
                    const querySnapshot = await getDocs(collection(db, 'Donantes'));
                    const donantesData = querySnapshot.docs.map(doc => ({
                        label: doc.data().nombre,
                        value: doc.id
                    }));
                    setDonantes(donantesData);
                };
                fetchDonantes();
            }
        }, [db]);

        useEffect(() => {
            if (selectedDonante && db) {
                const fetchDonanteData = async () => {
                    const docRef = doc(db, 'Donantes', selectedDonante);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setDonanteData(docSnap.data());
                    }
                };
                fetchDonanteData();
            }
        }, [db, selectedDonante]);

        const handleUpdateDonante = async () => {
            if (!db || !selectedDonante || !donanteData) return;

            setIsLoading(true);
            try {
                const docRef = doc(db, 'Donantes', selectedDonante);
                await updateDoc(docRef, donanteData);
                alert('Donante actualizado con éxito');
                navigation.goBack();
            } catch (error) {
                console.error('Error updating donante:', error);
                alert('Error al actualizar el donante');
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <View style={styles.container}>
                <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" style={styles.backArrow} />
                        </Pressable>
                        <Text style={styles.title}>Editar {route.params.type}</Text>
                    </View>
                    <View style={styles.content}>
                        <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
                            <DropDownPicker
                                items={donantes}
                                open={openDonantes}
                                setOpen={setOpenDonantes}
                                value={selectedDonante}
                                setValue={setSelectedDonante}
                                placeholder="Seleccionar donante"
                                zIndex={3000}
                                zIndexInverse={1000}
                            />
                        </View>
                        {donanteData && (
                            <View style={styles.donanteDataContainer}>
                                <Text style={styles.donanteName}>{donanteData.nombre}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={donanteData.email}
                                    onChangeText={(text) => setDonanteData({ ...donanteData, email: text })}
                                    keyboardType="email-address"
                                />
                                {isLoading ? (
                                    <ActivityIndicator size="large" color="#000" />
                                ) : (
                                    <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateDonante}>
                                        <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </View>
        );
    }

    else {
        const [users, setUsers] = useState<any[]>([]);
        const [selectedUser, setSelectedUser] = useState(null);
        const [openUsers, setOpenUsers] = useState(false);
        const [userData, setUserData] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            if (db) {
                const fetchUsers = async () => {
                    const querySnapshot = await getDocs(collection(db, 'Usuarios'));
                    const usersData = querySnapshot.docs.map(doc => ({
                        label: doc.data().nombre,
                        value: doc.id
                    }));
                    setUsers(usersData);
                };
                fetchUsers();
            }
        }, [db]);

        useEffect(() => {
            if (selectedUser && db) {
                const fetchUserData = async () => {
                    const docRef = doc(db, 'Usuarios', selectedUser);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                };
                fetchUserData();
            }
        }, [db, selectedUser]);

        const handleUpdateUser = async () => {
            if (!db || !selectedUser || !userData) return;

            setIsLoading(true);
            try {
                const docRef = doc(db, 'Usuarios', selectedUser);
                await updateDoc(docRef, userData);
                alert('Permisos de usuario actualizados con éxito');
                navigation.goBack();
            } catch (error) {
                console.error('Error updating user permissions:', error);
                alert('Error al actualizar los permisos del usuario');
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <View style={styles.container}>
                <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                    <View style={styles.headerContainer}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" style={styles.backArrow} />
                        </Pressable>
                        <Text style={styles.title}>Editar {route.params.type}</Text>
                    </View>
                    <View style={styles.content}>
                        <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
                            <DropDownPicker
                                items={users}
                                open={openUsers}
                                setOpen={setOpenUsers}
                                value={selectedUser}
                                setValue={setSelectedUser}
                                placeholder="Seleccionar usuario"
                                zIndex={3000}
                                zIndexInverse={1000}
                            />
                        </View>
                        {userData && (
                            <View style={styles.userDataContainer}>
                                <Text style={styles.userName}>{userData.nombre}</Text>
                                <View style={styles.permissionContainer}>
                                    <Text>Inventario</Text>
                                    <Switch
                                        value={userData.inventario}
                                        onValueChange={(value) => setUserData({ ...userData, inventario: value })}
                                    />
                                </View>
                                <View style={styles.permissionContainer}>
                                    <Text>Historial</Text>
                                    <Switch
                                        value={userData.historial}
                                        onValueChange={(value) => setUserData({ ...userData, historial: value })}
                                    />
                                </View>
                                <View style={styles.permissionContainer}>
                                    <Text>Reporte</Text>
                                    <Switch
                                        value={userData.reporte}
                                        onValueChange={(value) => setUserData({ ...userData, reporte: value })}
                                    />
                                </View>
                                <View style={styles.permissionContainer}>
                                    <Text>Entrada/Salida</Text>
                                    <Switch
                                        value={userData.entradaSalida}
                                        onValueChange={(value) => setUserData({ ...userData, entradaSalida: value })}
                                    />
                                </View>
                                <View style={styles.permissionContainer}>
                                    <Text>Admin</Text>
                                    <Switch
                                        value={userData.admin}
                                        onValueChange={(value) => setUserData({ ...userData, admin: value })}
                                    />
                                </View>
                                {isLoading ? (
                                    <ActivityIndicator size="large" color="#000" />
                                ) : (
                                    <TouchableOpacity style={styles.confirmButton} onPress={handleUpdateUser}>
                                        <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    userDataContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    permissionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    donanteDataContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    donanteName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
    content: {
        flex: 1,
        width: '100%',
        paddingTop: '25%',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    dropdownContainer: {
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    productDataContainer: {
        width: '100%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    confirmButton: {
        backgroundColor: '#ffd700',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    confirmButtonText: {
        fontWeight: 'bold',
    },
});
