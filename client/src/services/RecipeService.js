import { storageService } from './StorageService';
import { isMobileApp } from './platformUtils';
import { Filesystem, Directory } from '@capacitor/filesystem';
import crypto from 'crypto-js';

class RecipeService {
    constructor() {
        this.storageKey = 'recipes.json';
        this.imageDir = 'cookbook/images';
        if (isMobileApp()) {
            this.initialize().catch(console.error);
        }
    }

    async initialize() {
        if (!isMobileApp()) return;

        try {
            console.log('Initializing recipe image directory...');

            try {
                await Filesystem.stat({
                    path: this.imageDir,
                    directory: Directory.Data
                });
                console.log('Recipe image directory already exists');
            } catch (e) {
                console.log('Creating recipe image directory');
                await Filesystem.mkdir({
                    path: this.imageDir,
                    directory: Directory.Data,
                    recursive: true
                });
            }

            console.log('Recipe service initialized successfully');
        } catch (error) {
            console.error('Error initializing recipe service:', error);
            throw error;
        }
    }

    async createEmptyStore() {
        try {
            console.log('Creating empty recipe store');
            await this.initialize();
            await storageService.saveData(this.storageKey, []);
            console.log('Empty recipe store created successfully');
        } catch (error) {
            console.error('Failed to create empty recipe store:', error);
            throw error;
        }
    }

    async getAllRecipes() {
        try {
            console.log('Fetching all recipes');
            const recipes = await storageService.loadData(this.storageKey);
            console.log(`Found ${recipes?.length || 0} recipes`);
            return recipes || [];
        } catch (error) {
            console.error('Failed to get all recipes:', error);
            throw error;
        }
    }

    async getRecipeById(id) {
        try {
            console.log(`Fetching recipe with id: ${id}`);
            const recipes = await this.getAllRecipes();
            const recipe = recipes.find(recipe => recipe.id === id);
            console.log(recipe ? 'Recipe found' : 'Recipe not found');
            return recipe || null;
        } catch (error) {
            console.error(`Failed to get recipe with id ${id}:`, error);
            throw error;
        }
    }

    async saveImage(imageFile) {
        if (!isMobileApp() || !imageFile) return null;

        try {
            console.log('Saving recipe image');
            const fileName = `${crypto.lib.WordArray.random(16).toString()}.${imageFile.type.split('/')[1]}`;
            const filePath = `${this.imageDir}/${fileName}`;

            const base64Data = await this.convertFileToBase64(imageFile);
            await Filesystem.writeFile({
                path: filePath,
                data: base64Data,
                directory: Directory.Data
            });

            console.log('Image saved successfully:', fileName);
            return fileName;
        } catch (error) {
            console.error('Failed to save image:', error);
            return null;
        }
    }

    async getImage(fileName) {
        if (!isMobileApp() || !fileName) return null;

        try {
            console.log(`Fetching image: ${fileName}`);
            const result = await Filesystem.readFile({
                path: `${this.imageDir}/${fileName}`,
                directory: Directory.Data
            });
            return result.data;
        } catch (error) {
            console.error(`Failed to get image ${fileName}:`, error);
            return null;
        }
    }

    async convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    async createRecipe(recipe) {
        try {
            console.log('Creating new recipe:', recipe);
            const recipes = await this.getAllRecipes();

            const newRecipe = {
                ...recipe,
                id: crypto.lib.WordArray.random(16).toString(),
                createdAt: new Date().toISOString()
            };

            if (isMobileApp() && recipe.imageFile) {
                const fileName = await this.saveImage(recipe.imageFile);
                if (fileName) {
                    newRecipe.image = fileName;
                }
                delete newRecipe.imageFile;
            }

            recipes.push(newRecipe);
            await storageService.saveData(this.storageKey, recipes);
            console.log('New recipe created successfully:', newRecipe);
            return newRecipe;
        } catch (error) {
            console.error('Failed to create recipe:', error);
            throw error;
        }
    }

    async updateRecipe(id, recipeData) {
        try {
            console.log(`Updating recipe with id ${id}:`, recipeData);
            const recipes = await this.getAllRecipes();
            const index = recipes.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Recipe not found');

            if (isMobileApp() && recipeData.imageFile) {
                const fileName = await this.saveImage(recipeData.imageFile);
                if (fileName) {
                    recipeData.image = fileName;
                }
                delete recipeData.imageFile;
            }

            const updatedRecipe = {
                ...recipes[index],
                ...recipeData,
                id,
                updatedAt: new Date().toISOString()
            };
            recipes[index] = updatedRecipe;

            await storageService.saveData(this.storageKey, recipes);
            console.log('Recipe updated successfully:', updatedRecipe);
            return updatedRecipe;
        } catch (error) {
            console.error(`Failed to update recipe with id ${id}:`, error);
            throw error;
        }
    }

    async deleteRecipe(id) {
        try {
            console.log(`Deleting recipe with id ${id}`);
            const recipes = await this.getAllRecipes();
            const recipe = recipes.find(r => r.id === id);

            if (recipe && isMobileApp() && recipe.image) {
                try {
                    await Filesystem.deleteFile({
                        path: `${this.imageDir}/${recipe.image}`,
                        directory: Directory.Data
                    });
                    console.log('Associated image deleted');
                } catch (error) {
                    console.warn('Failed to delete recipe image:', error);
                }
            }

            const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
            await storageService.saveData(this.storageKey, filteredRecipes);
            console.log('Recipe deleted successfully');
        } catch (error) {
            console.error(`Failed to delete recipe with id ${id}:`, error);
            throw error;
        }
    }

    async searchRecipes(query) {
        try {
            console.log(`Searching recipes with query: ${query}`);
            const recipes = await this.getAllRecipes();
            if (!query) return recipes;

            const searchTerm = query.toLowerCase();
            const results = recipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.preparationProcess?.toLowerCase().includes(searchTerm)
            );
            console.log(`Found ${results.length} matching recipes`);
            return results;
        } catch (error) {
            console.error('Failed to search recipes:', error);
            throw error;
        }
    }
}

export const recipeService = new RecipeService();