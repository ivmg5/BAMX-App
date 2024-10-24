import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Pressable, Alert, Keyboard, ActivityIndicator, ImageSourcePropType } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { doc, getDoc, collection, setDoc, serverTimestamp, updateDoc, addDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { useState, useEffect } from 'react';
import { useFirebase } from '../db/FirebaseContext';
import { ref, getDownloadURL } from 'firebase/storage';
import { fetchCategorias } from '../db/fetchCategorias';
import { fetchProductos } from '../db/fetchProductos';
import { fetchDonantes } from '../db/fetchDonantes';

const background = require('../assets/backgroundMainSmall.png');

export default function Entrada({ navigation }: any) {
    const { db, storage, auth } = useFirebase();
    const currentUser = auth?.currentUser;

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);  // First dropdown list
    const [productos, setProductos] = useState<any[]>([]);    // Second dropdown list
    const [selectedCategoria, setSelectedCategoria] = useState(null); // Selected category
    const [selectedProducto, setSelectedProducto] = useState(null);   // Selected product
    const [cantidad, setCantidad] = useState(0);
    const [donante, setDonante] = useState<any[]>([]);
    const [image, setImage] = useState<ImageSourcePropType | null>(null);
    const [openCategorias, setOpenCategorias] = useState(false);
    const [openProductos, setOpenProductos] = useState(false);
    const [openDonante, setOpenDonante] = useState(false);
    const [selectedDonante, setSelectedDonante] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        fetchDonantes(db).then(setDonante)
        .then(() => {
            setDonante(donantes => [{ label: 'Nuevo donante', value: 'RegistroDonante' }, ...donantes]);
        });
    }, [db]);

    useEffect(() => {
        fetchCategorias(db).then(setCategorias);
    }, [db]);

    useEffect(() => {
        if (selectedCategoria) {
            fetchProductos(db, selectedCategoria).then(setProductos);
        }
    }, [db, selectedCategoria]);

    useEffect(() => {
        if (selectedProducto && storage) {
            const extensions = ['png', 'jpg', 'jpeg'];
            const fetchImage = async () => {
                for (const ext of extensions) {
                    const storageRef = ref(storage, `Productos/${selectedProducto}.${ext}`);
                    try {
                        const url = await getDownloadURL(storageRef);
                        setImage({ uri: url });
                        return;
                    } catch (error) {
                        console.log(`No ${ext} image found for ${selectedProducto}`);
                    }
                }
                console.log(`No image found for ${selectedProducto}`);
                setImage(null);
            };
    
            fetchImage();
        } else {
            setImage(null);
        }
    }, [storage, selectedProducto]);

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" style={styles.backArrow} />
                    </Pressable>
                    <Text style={styles.title}>Entrada de Productos</Text>
                </View>

                <View style={styles.content}>
                    {image ? (
                        <Image
                            source={image}
                            style={styles.productImage}
                        />
                    ) : (
                        <></>
                    )}
                    <View style={styles.inputContainer}>
                        <View style={[styles.searchInputContainer, { zIndex: openDonante ? 3000 : 10 }]}>
                            <DropDownPicker
                                items={donante}
                                open={openDonante}
                                setOpen={setOpenDonante}
                                value={selectedDonante}
                                setValue={setSelectedDonante}
                                placeholder="Buscar donante"
                                zIndex={2000}
                                zIndexInverse={3000}
                                searchable={true}
                                listMode='MODAL'
                                onChangeValue={(value) => {
                                    if (value === 'RegistroDonante') {
                                        navigation.navigate('RegistroDonante');
                                    }
                                }}
                            />
                        </View>

                        <View style={[styles.searchInputContainer, { zIndex: openCategorias ? 2000 : 0 }]}>
                            <DropDownPicker
                                items={categorias}
                                open={openCategorias}
                                setOpen={setOpenCategorias}
                                value={selectedCategoria}
                                setValue={setSelectedCategoria}
                                placeholder="Buscar categoría"
                                zIndex={2000}
                                zIndexInverse={3000}
                            />
                        </View>
                        <View style={[styles.searchInputContainer, { zIndex: openProductos ? 1000 : 0 }]}>
                            {selectedCategoria && (
                                <DropDownPicker
                                    items={productos}
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
                        </View>
                        <View style={styles.quantityContainer}>
                            {selectedProducto && (
                                <TextInput
                                    keyboardType='numeric'
                                    style={styles.quantityInput}
                                    placeholder="Cantidad de Unidades"
                                    placeholderTextColor="#888"
                                    onChangeText={(text) => setCantidad(Number(text))}
                                />
                            )}
                        </View>
                        {isLoading ? <ActivityIndicator size="small" color="#000" /> :
                            <TouchableOpacity style={styles.confirmButton} onPress={async () => {
                                if (selectedDonante !== '' && selectedProducto !== '' && cantidad > 0 && db && currentUser) {
                                    setIsLoading(true);
                                    try {
                                        const newEntryRef = doc(collection(db, 'Historial'));
                                        await setDoc(newEntryRef, {
                                            cantidad: cantidad,
                                            donante: doc(db, `Donantes/${selectedDonante}`),
                                            fecha: serverTimestamp(),
                                            producto: doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`),
                                            tipo: 'Ingreso',
                                            usuario: doc(db, 'Usuarios', currentUser.uid)
                                        });
                                        const productoRef = doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`);
                                        const productoDoc = await getDoc(productoRef);
                                        if (productoDoc.exists()) {
                                            if (productoDoc.data().cantActual < productoDoc.data().cantMin && productoDoc.data().cantActual + cantidad > productoDoc.data().cantMin) {
                                                await addDoc(collection(db, 'Notificaciones'), {
                                                    inStock: true,
                                                    producto: doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`),
                                                    fecha: serverTimestamp(),
                                                });
                                            }
                                            await updateDoc(productoRef, {
                                                cantActual: productoDoc.data().cantActual + cantidad
                                            });
                                        }
                                        Alert.alert('Entrada', 'Entrada registrada con éxito');
                                        navigation.navigate('MainMenu');
                                        setIsLoading(false);
                                    } catch (error) {
                                        console.error('Error adding entry:', error);
                                        Alert.alert('Error', 'Hubo un problema al registrar la entrada');
                                        setIsLoading(false);
                                    }
                                } else {
                                    Alert.alert('Entrada', 'Por favor, complete todos los campos')
                                }
                            }}>
                                <Text style={{ fontWeight: 'bold' }}>Confirmar</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                {!isKeyboardVisible ? (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.registerButton} onPress={() => {
                            navigation.navigate('RegistroProducto')
                        }}>
                            <Text style={styles.registerButtonText}>+</Text>
                        </TouchableOpacity>
                        <Text style={styles.registerText}>Registrar</Text>
                    </View>
                ) : null}
            </ImageBackground>
        </View>
    );
};

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
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
    backArrow: {
        fontSize: 40,
        color: 'white',
    },
    content: {
        flex: 1,
        width: '100%',
        paddingTop: 100,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    productImage: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        marginVertical: 20,
        borderWidth: 8,
        borderColor: 'darkred',
    },
    inputContainer: {
        backgroundColor: '#d9d9d9',
        borderRadius: 10,
        padding: 15,
        width: '90%',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
    },
    quantityInput: {
        flex: 1,
        padding: 10,
    },
    confirmButton: {
        backgroundColor: '#F5A700',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
    },
    footer: {
        alignItems: 'center',
        padding: 10,
        width: '100%',
    },
    registerButton: {
        backgroundColor: '#fff',
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    registerButtonText: {
        fontSize: 30,
        color: '#ff0000',
    },
    registerText: {
        color: '#fff',
    },
});