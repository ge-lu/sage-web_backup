import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { storage, auth } from "./firebase";

/**
 * Uploads an image to Firebase Storage
 * @param file - File object, Blob, or base64 string
 * @param path - Optional path in storage (default: 'uploads/{userId}/{timestamp}_{filename}')
 * @returns Promise that resolves to the download URL
 */
export const uploadImage = async (
    file: File | Blob | string,
    path?: string
): Promise<string> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("User must be logged in to upload images");
        }

        let storageRef;
        let uploadTask;

        if (!path) {
            const timestamp = Date.now();
            // Create a unique filename
            const filename = `image_${timestamp}.jpg`;
            path = `uploads/${currentUser.uid}/${filename}`;
        }

        storageRef = ref(storage, path);

        if (typeof file === 'string') {
            // Handle base64 string
            // Check if it's a data URL (starts with data:image/...)
            if (file.startsWith('data:')) {
                uploadTask = await uploadString(storageRef, file, 'data_url');
            } else {
                // Assume base64
                uploadTask = await uploadString(storageRef, file, 'base64');
            }
        } else {
            // Handle File or Blob
            uploadTask = await uploadBytes(storageRef, file);
        }

        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error: any) {
        console.error("Error uploading image:", error);
        throw new Error(error.message || "Failed to upload image");
    }
};
