import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Login, CreateAccount, MainMenu, Inventario, Historial, GenerarReporte, Entrada, RegistroProducto, Salida, Loading, RegistroDonante, InventarioDetalles, Notificaciones, Editar } from './screens';
import { FirebaseContext } from './db/FirebaseContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);
const Stack = createNativeStackNavigator();


const screenOptions = ({ navigation }: any) => ({
  headerBackVisible: false,
  headerShown: true,
  headerTitle: () => (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>Inventario</Text>
    </View>
  ),
  headerRight: () => (
    <Pressable onPress={() => navigation.navigate('MainMenu')}>
      <Image
        source={require('./assets/manzana_logo.png')}
        style={styles.headerRightImage}
      />
    </Pressable>
  ),
  headerLeft: () => (
    <Pressable onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" style={[styles.backArrow, { marginLeft: -30 }]} />
    </Pressable>
  ),
});

export default function Navigation() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return <Loading />;

  return (
    <FirebaseContext.Provider value={{ app, auth, db, storage }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="MainMenu" component={MainMenu} initialParams={{ name: user.displayName }} />
              <Stack.Screen name="RegistroProducto" component={RegistroProducto} />
              <Stack.Screen name="Salida" component={Salida} />
              <Stack.Screen name="InventarioDetalles" component={InventarioDetalles} options={({ navigation }) => ({ ...screenOptions({ navigation }) })} />
              <Stack.Screen name="Entrada" component={Entrada} />
              <Stack.Screen name="Historial" component={Historial} />
              <Stack.Screen name="Reporte" component={GenerarReporte} />
              <Stack.Screen name="Inventario" component={Inventario} options={({ navigation }) => ({ ...screenOptions({ navigation }) })} />
              <Stack.Screen name="RegistroDonante" component={RegistroDonante} />
              <Stack.Screen name="Notificaciones" component={Notificaciones} />
              <Stack.Screen name="Editar" component={Editar} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="CreateAccount" component={CreateAccount} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FirebaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  customContent: {
    padding: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  customText: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
  },
  bottomDrawerSection: {
    marginTop: 'auto',
    paddingVertical: 20,
    backgroundColor: '#CE0F2C',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerItemIcon: {
    marginRight: 20,
  },
  drawerItemText: {
    color: 'white',
    fontSize: 16,
  },
  backArrow: {
    width: 60,
    fontSize: 40,
    color: 'white',
    backgroundColor: '#CE0F2C',
    paddingLeft: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerTitleContainer: {
    backgroundColor: '#CE0F2C',
    paddingVertical: 5,
    borderRadius: 10,
    width: '80%',
    maxWidth: 270,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerRightImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});