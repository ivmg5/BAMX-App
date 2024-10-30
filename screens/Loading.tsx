import { View, ImageBackground, Image, StyleSheet } from 'react-native';

const background = require('../assets/background.png');
const logo = require('../assets/manzana_logo.png');
const text_logo = require('../assets/texto_logo.png');

export default function Loading() {
    return (
<View style={styles.container}>
            <ImageBackground source={background} resizeMode='cover' style={styles.back}>
                <Image source={logo} style={{ width: 150, height: 150, resizeMode: 'contain', margin: 20, }} />
                <Image source={text_logo} style={{ width: 150, height: 80, resizeMode: 'contain', marginBottom: 50 }} />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
});