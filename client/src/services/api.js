import { recipeService } from './RecipeService';
import { ingredientService } from './IngredientService';
import { storageService } from './StorageService';
import { isMobileApp } from './platformUtils';

// This service acts as a drop-in replacement for the backend API
// It redirects all API calls to local storage via Capacitor

let initializationPromise = null;

const initializeStorage = async () => {
    if (!isMobileApp()) return;

    if (initializationPromise) {
        console.log('Using existing initialization promise');
        return initializationPromise;
    }

    console.log('Starting storage initialization process');
    initializationPromise = (async () => {
        try {
            console.log('Initializing storage system...');
            await storageService.initialize();

            if (!storageService.initialized) {
                console.error('Storage system failed to initialize properly');
                throw new Error('Storage system initialization failed');
            }

            console.log('Storage system initialized, verifying data structures...');

            try {
                const recipes = await recipeService.getAllRecipes();
                console.log(`Found ${recipes?.length || 0} existing recipes`);
            } catch (e) {
                console.error('Error verifying recipes:', e);
            }

            try {
                const ingredients = await ingredientService.getAllIngredients();
                console.log(`Found ${ingredients?.length || 0} existing ingredients`);
            } catch (e) {
                console.error('Error verifying ingredients:', e);
            }

            console.log('Storage system initialization complete');
            return true;
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            initializationPromise = null;
            throw error;
        }
    })();

    return initializationPromise;
};

// Initialize storage on app start for mobile environment
if (isMobileApp()) {
    console.log('Mobile app detected, starting initialization');
    let retries = 5;
    const tryInitialize = async () => {
        try {
            await initializeStorage();
            console.log('Initialization successful');
        } catch (error) {
            console.error(`Storage initialization attempt failed (${retries} retries left):`, error);
            if (retries > 0) {
                retries--;
                console.log(`Retrying in 2 seconds... (${retries} attempts remaining)`);
                setTimeout(tryInitialize, 2000);
            } else {
                console.error('All initialization attempts failed. Please restart the app.');
            }
        }
    };
    tryInitialize();
}

export const api = {
    async ensureInitialized() {
        if (isMobileApp()) {
            await initializeStorage();
        }
    },

    // Recipe endpoints
    async getRecipe(id) {
        await this.ensureInitialized();
        return recipeService.getRecipeById(id);
    },

    async listRecipes() {
        await this.ensureInitialized();
        return recipeService.getAllRecipes();
    },

    async createRecipe(data) {
        await this.ensureInitialized();
        return recipeService.createRecipe(data);
    },

    async updateRecipe(id, data) {
        await this.ensureInitialized();
        return recipeService.updateRecipe(id, data);
    },

    async deleteRecipe(id) {
        await this.ensureInitialized();
        return recipeService.deleteRecipe(id);
    },

    async searchRecipes(query) {
        await this.ensureInitialized();
        return recipeService.searchRecipes(query);
    },

    // Ingredient endpoints
    async getIngredient(id) {
        await this.ensureInitialized();
        return ingredientService.getIngredientById(id);
    },

    async listIngredients() {
        await this.ensureInitialized();
        return ingredientService.getAllIngredients();
    },

    async createIngredient(data) {
        await this.ensureInitialized();
        return ingredientService.createIngredient(data);
    },

    async updateIngredient(id, data) {
        await this.ensureInitialized();
        return ingredientService.updateIngredient(id, data);
    },

    async deleteIngredient(id) {
        await this.ensureInitialized();
        return ingredientService.deleteIngredient(id);
    },

    async searchIngredients(query) {
        await this.ensureInitialized();
        return ingredientService.searchIngredients(query);
    }
};

// Wrapper for fetch that uses the api object when running in mobile app
export async function fetchApi(endpoint, options = {}) {
    if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint');
    }

    // Split endpoint into path and query
    const pathPart = endpoint.split('?')[0];
    const parts = pathPart.split('/');
    if (parts.length < 2) {
        throw new Error(`Invalid endpoint format: ${endpoint}`);
    }

    const [resource, action] = parts;

    // Use the api object for both web and mobile environments
    try {
        // Parse URL parameters if any
        let urlParams;
        if (endpoint.includes('?')) {
            urlParams = new URLSearchParams(endpoint.split('?')[1]);
        }

        const resourceLower = resource.toLowerCase();
        const actionLower = action.toLowerCase();

        switch (resourceLower) {
            case 'recipe':
            case 'recipes': {
                switch (actionLower) {
                    case 'get':
                        return api.getRecipe(urlParams.get('id'));
                    case 'list':
                        return api.listRecipes();
                    case 'create':
                        return api.createRecipe(options.body ? JSON.parse(options.body) : {});
                    case 'update':
                        return api.updateRecipe(
                            urlParams.get('id'),
                            options.body ? JSON.parse(options.body) : {}
                        );
                    case 'delete':
                        return api.deleteRecipe(urlParams.get('id'));
                    case 'search':
                        return api.searchRecipes(urlParams.get('query'));
                    default:
                        throw new Error(`Unknown recipe action: ${action}`);
                }
            }
            case 'ingredient':
            case 'ingredients': {
                switch (actionLower) {
                    case 'get':
                        return api.getIngredient(urlParams.get('id'));
                    case 'list':
                        return api.listIngredients();
                    case 'create':
                        return api.createIngredient(options.body ? JSON.parse(options.body) : {});
                    case 'update':
                        return api.updateIngredient(
                            urlParams.get('id'),
                            options.body ? JSON.parse(options.body) : {}
                        );
                    case 'delete':
                        return api.deleteIngredient(urlParams.get('id'));
                    case 'search':
                        return api.searchIngredients(urlParams.get('query'));
                    default:
                        throw new Error(`Unknown ingredient action: ${action}`);
                }
            }
            default:
                throw new Error(`Unknown resource: ${resource}`);
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}