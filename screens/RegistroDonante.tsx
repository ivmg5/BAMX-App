import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useFirebase } from '../db/FirebaseContext';
import Ionicons from '@expo/vector-icons/Ionicons';

const background = require('../assets/backgroundMainSmall.png');

export default function RegistroDonante({ navigation }: any) {
    const { db, auth } = useFirebase();
    const currentUser = auth?.currentUser;

    const [isLoading, setIsLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='stretch' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" style={styles.backArrow} />
                    </Pressable>
                    <Text style={styles.title}>Registro de Donantes</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.inputContainer}>
                        <View>
                            <View style={styles.InputContainer}>
                                <TextInput
                                    placeholder='Nombre'
                                    value={nombre}
                                    onChangeText={(text) => setNombre(text)}
                                    style={styles.input}
                                />
                            </View>
                            <View style={styles.InputContainer}>
                                <TextInput
                                    placeholder='Email'
                                    value={email}
                                    keyboardType='email-address'
                                    onChangeText={(text) => setEmail(text)}
                                    style={styles.input}
                                />
                            </View>
                            {isLoading ? <ActivityIndicator size="small" color="#000" /> :
                                <TouchableOpacity style={styles.confirmButton} onPress={async () => {
                                    if (nombre !== '' && email !== '' && db && currentUser) {
                                        setIsLoading(true);
                                        try {
                                            const newEntryRef = doc(db, 'Donantes/' + nombre);
                                            await setDoc(newEntryRef, {
                                                nombre: nombre,
                                                email: email,
                                            });
                                            Alert.alert('Donante', 'Donante registrado con éxito')
                                            navigation.navigate('MainMenu')
                                            setIsLoading(false);
                                        } catch (error) {
                                            console.error('Error adding entry:', error);
                                            Alert.alert('Error', 'Hubo un problema al registrar el donante');
                                            setIsLoading(false);
                                        }
                                    } else {
                                        Alert.alert('Donante', 'Por favor, complete todos los campos')
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
        justifyContent: 'center',
        marginBottom: 200,
    },
    inputContainer: {
        backgroundColor: '#d9d9d9',
        borderRadius: 10,
        padding: 15,
        width: '90%',
    },
    InputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
    },
    confirmButton: {
        backgroundColor: '#ffd700',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        marginVertical: 10,
    },
    input: {
        flex: 1,
        padding: 10,
    },
});