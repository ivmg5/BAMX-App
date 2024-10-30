import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const reporte = async (db, dateInicio, dateFin, navigation, titulo, descripcion) => {

    try {
        const startDate = Timestamp.fromDate(dateInicio);
        const endDate = Timestamp.fromDate(dateFin);

        const q = query(
            collection(db, 'Historial'),
            where('fecha', '>=', startDate),
            where('fecha', '<=', endDate)
        );

        const querySnapshot = await getDocs(q);
        const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Here you can process the documents or pass them to another function/screen
        var fileContent = '';
        fileContent += `Titulo: ${titulo}\n`;
        fileContent += `Descripcion: ${descripcion}\n`;
        fileContent += `Fecha de inicio: ${dateInicio}\n`;
        fileContent += `Fecha de fin: ${dateFin}\n`;
        fileContent += '\n';
        for (const docu of documents) {
            fileContent += `ID: ${docu.id}\n`;

            const fecha = docu.fecha?.toDate().toLocaleDateString() || 'N/A';
            fileContent += `fecha: ${fecha}\n`;
            fileContent += `Tipo: ${docu.tipo}\n`;

            var docRef = doc(db, docu.producto.path);
            var docSnap = await getDoc(docRef);
            const productoNombre = docSnap.data()?.nombre || 'N/A';
            fileContent += `producto: ${productoNombre}\n`;
            fileContent += `cantidad: ${docu.cantidad} ${docSnap.data()?.unidad}\n`;


            docRef = doc(db, docu.usuario.path);
            docSnap = await getDoc(docRef);
            const usuarioNombre = docSnap.data()?.nombre || 'N/A';
            fileContent += `usuario: ${usuarioNombre}\n`;

            if (docu.donante.path) {
                docRef = doc(db, docu.donante.path);
                docSnap = await getDoc(docRef);
                const donanteNombre = docSnap.data()?.nombre || 'N/A';
                fileContent += `donante: ${donanteNombre}\n`;
            }

            fileContent += '\n';
        }

        // Generate a filename with current date and time
        const fileName = `reporte_${new Date().toISOString().replace(/[:.]/g, '_')}.txt`;
        const filePath = `${FileSystem.documentDirectory}${fileName}`;

        // Write the file
        await FileSystem.writeAsStringAsync(filePath, fileContent);

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath);
            Alert.alert('Reporte', `Reporte generado con éxito. ${documents.length} documentos encontrados.`);
        } else {
            Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
        }

        navigation.navigate('MainMenu');
    } catch (error) {
        console.error('Error generating report:', error);
        Alert.alert('Error', 'Hubo un problema al generar el reporte.');
    }
}