import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, TextInput, View, ImageBackground, Image, Pressable, Text } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useFirebase } from '../db/FirebaseContext';
import { setDoc, doc } from "firebase/firestore";
import Ionicons from '@expo/vector-icons/Ionicons';

const background = require('../assets/background.png');
const logo = require('../assets/manzana_logo.png');

export default function SignUp({ navigation }: any) {
    const { auth, db } = useFirebase();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='cover' style={styles.back}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" style={styles.backArrow} />
                    </Pressable>
                </View>
                <Image source={logo} style={{ width: 150, height: 150, resizeMode: 'contain', margin: 20, marginTop: 50 }} />
                <TextInput
                    style={styles.input}
                    placeholder='Nombre Completo'
                    onChangeText={text => {
                        setName(text);
                    }} />
                <TextInput
                    style={styles.input}
                    placeholder='Email'
                    onChangeText={text => {
                        setEmail(text);
                    }} />
                <TextInput
                    style={styles.input}
                    placeholder='Nombre de Usuario'
                    onChangeText={text => {
                        setUsername(text);
                    }} />
                <TextInput
                    style={styles.input}
                    placeholder='Contraseña'
                    secureTextEntry={true}
                    onChangeText={text => {
                        setPassword(text);
                    }} />
                <TextInput
                    style={styles.input}
                    placeholder='Confirmar Contraseña'
                    secureTextEntry={true}
                    onChangeText={text => {
                        setConfirmPassword(text);
                    }} />
                <Pressable style={[styles.button, { backgroundColor: '#F5A700', }]}
                    onPress={() => {
                        if (password !== confirmPassword) {
                            alert('Las contraseñas no coinciden');
                        } else {
                            if (auth) {
                                createUserWithEmailAndPassword(auth, email, password)
                                    .then(async (userCredential) => {
                                        const user = userCredential.user;
                                        updateProfile(user, { displayName: username });
                                        if (db) {
                                            var userCollection = doc(db, 'Usuarios', user.uid)
                                            await setDoc(userCollection, {
                                                nombre: name,
                                                username: username,
                                                email: email,
                                                notifRead: 0,
                                                //editing permits
                                                inventario: true,
                                                historial: true,
                                                reporte: true,
                                                entradaSalida: true,
                                                admin: false,
                                            });
                                            console.log('Usuario creado con éxito');
                                            navigation.navigate('MainMenu');
                                        }
                                    })
                                    .catch((error) => {
                                        alert('Error al crear usuario: ' + error.message);
                                        console.error('Error al crear usuario:', error);
                                    });
                            }
                        }
                    }}>
                    <Text style={{ color: 'black' }}>CREAR CUENTA</Text>
                </Pressable>
            </ImageBackground>
            <StatusBar style="auto" />
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
    input: {
        padding: 10,
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        width: 200,
        backgroundColor: 'lightgray',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: 200,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingTop: 40,
    },
    backArrow: {
        fontSize: 40,
        color: 'white',
        backgroundColor: '#CE0F2C',
        borderRadius: 10,
        marginLeft: -15,
        paddingLeft: 20,
        overflow: 'hidden',
    },
});
