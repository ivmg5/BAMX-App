import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Pressable, Alert, ActivityIndicator, ImageSourcePropType } from 'react-native';
import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, serverTimestamp, getDoc, updateDoc, addDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchCategorias } from '../db/fetchCategorias';
import { fetchProductos } from '../db/fetchProductos';
import { useFirebase } from '../db/FirebaseContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const background = require('../assets/backgroundMainSmall.png');

export default function Salida({ navigation }: any) {
    const { db, storage, auth } = useFirebase();
    const currentUser = auth?.currentUser;
    const [categorias, setCategorias] = useState<any[]>([]);  // First dropdown list
    const [productos, setProductos] = useState<any[]>([]);    // Second dropdown list
    const [selectedCategoria, setSelectedCategoria] = useState(null); // Selected category
    const [selectedProducto, setSelectedProducto] = useState(null);   // Selected product
    const [image, setImage] = useState<ImageSourcePropType | null>(null);
    const [cantidad, setCantidad] = useState(0);
    const [openCategorias, setOpenCategorias] = useState(false);
    const [openProductos, setOpenProductos] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                    <Text style={styles.title}>Salida de Productos</Text>
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
                        <View>
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
                                        zIndex={1000}
                                        zIndexInverse={2000}
                                        searchable={true}
                                        listMode='MODAL'
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
                                    if (selectedProducto !== '' && cantidad > 0 && db && currentUser) {
                                        setIsLoading(true);
                                        try {
                                            const productoRef = doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`);
                                            const productoDoc = await getDoc(productoRef);
                                            if (productoDoc.exists() && cantidad <= productoDoc.data().cantActual) {
                                                if (productoDoc.data().cantActual > productoDoc.data().cantMin && productoDoc.data().cantActual - cantidad < productoDoc.data().cantMin) {
                                                    await addDoc(collection(db, 'Notificaciones'), {
                                                        inStock: false,
                                                        producto: doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`),
                                                        fecha: serverTimestamp(),
                                                    });
                                                }
                                                await updateDoc(productoRef, {
                                                    cantActual: productoDoc.data().cantActual - cantidad
                                                });
                                                const newEntryRef = doc(collection(db, 'Historial'));
                                                await setDoc(newEntryRef, {
                                                    cantidad: cantidad,
                                                    donante: 'n/a',
                                                    fecha: serverTimestamp(),
                                                    producto: doc(db, `Inventario/Categorias/${selectedCategoria}/${selectedProducto}`),
                                                    tipo: 'Salida',
                                                    usuario: doc(db, 'Usuarios', currentUser.uid)
                                                });
                                                Alert.alert('Salida', 'Salida registrada con éxito')
                                                navigation.navigate('MainMenu')
                                                setIsLoading(false);
                                            } else {
                                                Alert.alert('Salida', 'No hay suficientes unidades en el inventario')
                                            }
                                        } catch (error) {
                                            console.error('Error adding entry:', error);
                                            Alert.alert('Error', 'Hubo un problema al registrar la salida');
                                            setIsLoading(false);
                                        }
                                    } else {
                                        Alert.alert('Salida', 'Por favor, complete todos los campos')
                                    }
                                }}>
                                    <Text style={{ fontWeight: 'bold' }}>Confirmar</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
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
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
        marginVertical: 10,
    },
    searchInput: {
        flex: 1,
        padding: 15,
    },
    searchButton: {
        padding: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
        marginVertical: 10,
    },
    quantityInput: {
        flex: 1,
        padding: 10,
    },
    unitText: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    confirmButton: {
        backgroundColor: '#F5A700',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        marginVertical: 10,
    },
    unitContainer: {
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
});