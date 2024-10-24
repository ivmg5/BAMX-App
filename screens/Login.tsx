import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, TextInput, View, ImageBackground, Image, Pressable, Text } from 'react-native';
import { useFirebase } from '../db/FirebaseContext';
import { signInWithEmailAndPassword } from 'firebase/auth';

const background = require('../assets/background.png');
const logo = require('../assets/manzana_logo.png');
const text_logo = require('../assets/texto_logo.png');

export default function Login({ navigation }: any) {
    const { auth } = useFirebase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (auth) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log('Usuario autenticado:', user);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainMenu' }],
                    });
                })
                .catch((error) => {
                    if (error.code === 'auth/invalid-email') {
                        alert('El email no es valido');
                    } else if (error.code === 'auth/user-not-found') {
                        alert('El usuario no existe');
                    } else if (error.code === 'auth/wrong-password') {
                        alert('La contraseña es incorrecta');
                    } else if (error.code === 'auth/invalid-credential') {
                        alert('Usuario o contraseña incorrectos');
                    } else {
                        console.error('Error al autenticar:', error);
                    }
                });
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={background} resizeMode='cover' style={styles.back}>
                <Image source={logo} style={styles.logo} />
                <TextInput
                    style={styles.input}
                    placeholder='Email'
                    onChangeText={text => {
                        setEmail(text);
                    }} />
                <TextInput
                    style={styles.input}
                    placeholder='Contraseña'
                    secureTextEntry={true}
                    onChangeText={text => {
                        setPassword(text);
                    }} />
                <Pressable style={[styles.button, { backgroundColor: '#CE0F2C', }]} onPress={() => { handleLogin() }}>
                    <Text style={{ color: 'white' }}>INICIAR SESIÓN</Text>
                </Pressable>
                <Pressable style={[styles.button, { backgroundColor: '#F5A700', }]}
                    onPress={() => { navigation.navigate('CreateAccount') }}>
                    <Text style={{ color: 'black' }}>CREAR CUENTA</Text>
                </Pressable>
                <Image source={text_logo} style={styles.text_logo} />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        padding: 10,
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        backgroundColor: 'lightgray',
        width: 200,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: 200,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        margin: 20,
    },
    text_logo: {
        width: 150,
        height: 80,
        resizeMode: 'contain',
        marginBottom: 50,
    },
});
