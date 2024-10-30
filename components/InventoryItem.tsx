import { View, Text, Image, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '../db/FirebaseContext';

export default function InventoryItem({ nombre, cantActual, unidad, cantMin }: any) {
    const { storage } = useFirebase();
    const [imageSource, setImageSource] = useState(require('../assets/inventarioPlaceholder.png'));
    const isLowStock = cantActual < cantMin;

    useEffect(() => {
        const extensions = ['png', 'jpg', 'jpeg'];
        const fetchImage = async () => {
            if (!storage) return;

            for (const ext of extensions) {
                const storageRef = ref(storage, `Productos/${nombre}.${ext}`);
                try {
                    const url = await getDownloadURL(storageRef);
                    setImageSource({ uri: url });
                    return;
                } catch (error) {
                    console.log(`No ${ext} image found for ${nombre}`);
                }
            }
            console.log(`No image found for ${nombre}`);
        };

        fetchImage();
    }, [nombre, storage]);

    return (
        <View style={{ marginTop: 25 }}>
            <Text style={styles.title}>{nombre}</Text>
            <View style={[styles.itemContainer, isLowStock ? styles.lowStock : styles.inStock]}>
                <View style={styles.contentContainer}>
                    <View style={styles.imageContainer}>
                        <Image source={imageSource} style={styles.image} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.text}>
                            Cantidad: {cantActual} {unidad}
                        </Text>
                        {isLowStock && <Text style={[styles.text, { color: 'red' }]}>Mínimo: {cantMin} {unidad}</Text>}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        borderWidth: 15,
        borderRadius: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
    },
    image: {
        width: 150,
        height: 100,
        resizeMode: 'contain',
    },
    detailsContainer: {
        flex: 1,
        paddingLeft: 10,
    },
    title: {
        fontSize: 18,
        color: '#555555',
        backgroundColor: '#F5A700',
        padding: 5,
        borderRadius: 10,
        position: 'absolute',
        top: -10,
        alignSelf: 'center',
        zIndex: 1,
        overflow: 'hidden',
    },
    text: {
        fontSize: 16,
        color: '#555555',
    },
    inStock: {
        borderColor: 'green',
    },
    lowStock: {
        borderColor: 'red',
    },
});
