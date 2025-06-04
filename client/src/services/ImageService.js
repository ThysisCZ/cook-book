import { isMobileApp } from './platformUtils';
import { Filesystem, Directory } from '@capacitor/filesystem';
import crypto from 'crypto-js';

class ImageService {
    constructor() {
        this.imageDir = 'cookbook/images';
    }

    async saveImage(file) {
        if (!file) return null;

        try {
            if (isMobileApp()) {
                return this.saveMobileImage(file);
            } else {
                return this.saveWebImage(file);
            }
        } catch (error) {
            console.error('Failed to save image:', error);
            return null;
        }
    }

    async saveMobileImage(file) {
        console.log('Saving recipe image for mobile');
        const fileName = `${crypto.lib.WordArray.random(16).toString()}.${file.type.split('/')[1]}`;
        const filePath = `${this.imageDir}/${fileName}`;

        const base64Data = await this.convertFileToBase64(file);
        await Filesystem.writeFile({
            path: filePath,
            data: base64Data,
            directory: Directory.Data
        });

        console.log('Image saved successfully:', fileName);
        return fileName;
    } async saveWebImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Create and return a proper data URL
                const mimeType = file.type;
                const base64String = reader.result.split(',')[1];
                const dataUrl = `data:${mimeType};base64,${base64String}`;
                resolve(dataUrl);
            };
            reader.readAsDataURL(file);
        });
    }

    async getImage(imageData) {
        if (!imageData) return null;

        if (isMobileApp()) {
            return this.getMobileImage(imageData);
        } else {
            // For web, imageData is already a base64 string
            return imageData;
        }
    }

    async getMobileImage(fileName) {
        try {
            console.log(`Fetching image: ${fileName}`);
            const result = await Filesystem.readFile({
                path: `${this.imageDir}/${fileName}`,
                directory: Directory.Data
            });
            return `data:image/*;base64,${result.data}`;
        } catch (error) {
            console.error(`Failed to get image ${fileName}:`, error);
            return null;
        }
    }

    async deleteImage(imageData) {
        if (!imageData) return;

        if (isMobileApp()) {
            try {
                await Filesystem.deleteFile({
                    path: `${this.imageDir}/${imageData}`,
                    directory: Directory.Data
                });
                console.log('Image deleted successfully');
            } catch (error) {
                console.warn('Failed to delete image:', error);
            }
        }
        // For web, no need to delete as the base64 string will be garbage collected
    }

    async convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
}

export const imageService = new ImageService();
