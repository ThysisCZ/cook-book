import { Filesystem, Directory } from '@capacitor/filesystem';
import { isMobileApp } from './platformUtils';

class StorageService {
    constructor() {
        this.baseDir = 'cookbook/data';
        this.initialized = false;
        this.initPromise = null;
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
    }

    async initialize() {
        if (this.initialized) {
            console.log('Storage already initialized');
            return;
        }

        if (!this.initPromise) {
            console.log('Starting new initialization');
            this.initPromise = this._initializeWithRetry();
        } else {
            console.log('Using existing initialization promise');
        }

        return this.initPromise;
    }

    async _initializeWithRetry(retryCount = 0) {
        try {
            return await this._initialize();
        } catch (error) {
            // Don't retry if directory already exists, that's not an error
            if (error.message.includes('exist')) {
                console.log('Directory exists, continuing with initialization');
                return await this._initialize();
            }

            console.error(`Initialization attempt ${retryCount + 1} failed:`, error);
            if (retryCount < this.maxRetries) {
                console.log(`Retrying in ${this.retryDelay / 1000} seconds... (${this.maxRetries - retryCount} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this._initializeWithRetry(retryCount + 1);
            } else {
                console.error('All initialization attempts failed');
                this.initPromise = null; // Reset for future attempts
                throw error;
            }
        }
    }

    async _initialize() {
        try {
            if (!isMobileApp()) {
                this.initialized = true;
                return true;
            }

            console.log('Starting storage system initialization...');

            // First ensure the base directory exists
            try {
                console.log('Creating base directory structure...');
                await Filesystem.mkdir({
                    path: this.baseDir,
                    directory: Directory.Data,
                    recursive: true
                });
                console.log('Base directory created successfully');
            } catch (e) {
                // Only ignore error if directory already exists
                if (!e.message.includes('exist')) {
                    console.error('Error creating base directory:', e);
                    throw e;
                }
                console.log('Base directory already exists');
            }

            // Initialize JSON files with empty arrays if they don't exist
            const initialFiles = ['ingredients.json', 'recipes.json'];
            for (const file of initialFiles) {
                try {
                    console.log(`Checking ${file}...`);
                    let needsInit = false;

                    try {
                        const stat = await Filesystem.stat({
                            path: `${this.baseDir}/${file}`,
                            directory: Directory.Data
                        });
                        console.log(`${file} exists, size: ${stat.size}`);
                        if (stat.size === 0) needsInit = true;
                    } catch (e) {
                        // File doesn't exist
                        needsInit = true;
                    }

                    if (needsInit) {
                        console.log(`Initializing ${file} with empty array`);
                        await Filesystem.writeFile({
                            path: `${this.baseDir}/${file}`,
                            directory: Directory.Data,
                            data: JSON.stringify([]),
                            encoding: 'utf8'
                        });
                        console.log(`${file} initialized successfully`);
                    }
                } catch (e) {
                    console.error(`Error handling ${file}:`, e);
                    throw new Error(`Failed to initialize ${file}: ${e.message}`);
                }
            }

            this.initialized = true;
            console.log('Storage system initialization completed successfully');
            return true;
        } catch (error) {
            console.error('Storage initialization failed:', error);
            this.initialized = false;
            throw error;
        }
    }

    async saveData(filename, data) {
        try {
            console.log(`[StorageService] Saving data to ${filename}`);
            await this.initialize();

            if (!filename || !data) {
                console.error('[StorageService] Invalid filename or data');
                throw new Error('Invalid filename or data');
            }

            const jsonData = JSON.stringify(data, null, 2);

            if (isMobileApp()) {
                try {
                    console.log(`[StorageService] Writing to file: ${this.baseDir}/${filename}`);
                    await Filesystem.writeFile({
                        path: `${this.baseDir}/${filename}`,
                        data: jsonData,
                        directory: Directory.Data,
                        encoding: 'utf8'
                    });

                    // Verify the write
                    const verification = await Filesystem.readFile({
                        path: `${this.baseDir}/${filename}`,
                        directory: Directory.Data,
                        encoding: 'utf8'
                    });

                    if (verification.data !== jsonData) {
                        throw new Error('Data verification failed');
                    }
                } catch (error) {
                    console.error(`[StorageService] Error saving ${filename}:`, error);
                    throw error;
                }
            } else {
                // Web environment - use localStorage
                try {
                    localStorage.setItem(filename, jsonData);
                } catch (error) {
                    console.error(`[StorageService] Error saving to localStorage:`, error);
                    throw error;
                }
            }

            console.log(`[StorageService] Data saved successfully in ${filename}`);
        } catch (error) {
            console.error(`[StorageService] Error in saveData for ${filename}:`, error);
            throw error;
        }
    }

    async loadData(filename) {
        try {
            console.log(`[StorageService] Loading data from ${filename}`);
            await this.initialize();

            if (!filename) {
                console.error('[StorageService] Invalid filename');
                throw new Error('Invalid filename');
            }

            if (isMobileApp()) {
                try {
                    const result = await Filesystem.readFile({
                        path: `${this.baseDir}/${filename}`,
                        directory: Directory.Data,
                        encoding: 'utf8'
                    });

                    try {
                        const parsedData = JSON.parse(result.data);
                        console.log(`[StorageService] JSON parsed successfully from ${filename}`);
                        return parsedData;
                    } catch (parseError) {
                        console.error(`[StorageService] Invalid JSON in ${filename}:`, parseError);
                        return null;
                    }
                } catch (error) {
                    if (error.message.includes('File does not exist')) {
                        console.log(`[StorageService] File ${filename} does not exist, initializing with empty array`);
                        await this.saveData(filename, []);
                        return [];
                    }
                    throw error;
                }
            } else {
                // Web environment - use localStorage
                try {
                    const data = localStorage.getItem(filename);
                    if (data === null) {
                        console.log(`[StorageService] No data found in localStorage for ${filename}, initializing with empty array`);
                        await this.saveData(filename, []);
                        return [];
                    }
                    return JSON.parse(data);
                } catch (error) {
                    console.error(`[StorageService] Error loading from localStorage:`, error);
                    return [];
                }
            }
        } catch (error) {
            console.error(`[StorageService] Error in loadData for ${filename}:`, error);
            throw error;
        }
    }

    async deleteData(filename) {
        await this.initialize();

        if (!filename) {
            throw new Error('Invalid filename');
        }

        if (isMobileApp()) {
            try {
                await Filesystem.deleteFile({
                    path: `${this.baseDir}/${filename}`,
                    directory: Directory.Data
                });
                console.log(`${filename} deleted successfully`);
            } catch (error) {
                if (error.message.includes('File does not exist')) {
                    return; // File already doesn't exist, that's fine
                }
                console.error(`Error deleting ${filename}:`, error);
                throw error;
            }
        } else {
            // Web environment - use localStorage
            try {
                localStorage.removeItem(filename);
                console.log(`${filename} removed from localStorage successfully`);
            } catch (error) {
                console.error(`Error removing ${filename} from localStorage:`, error);
                throw error;
            }
        }
    }
}

export const storageService = new StorageService();