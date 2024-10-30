import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (image, nombre, storage) => {
    if (!image) return null;
    
    const response = await fetch(image);
    const blob = await response.blob();
    const extension = image.split('.').pop();
    const filename = `Productos/${nombre}.${extension}`;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error("Upload failed", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    console.error("Failed to get download URL", error);
                    reject(error);
                }
            }
        );
    });
};
