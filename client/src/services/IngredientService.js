import { storageService } from './StorageService';
import crypto from 'crypto-js';

class IngredientService {
    constructor() {
        this.storageKey = 'ingredients.json';
    }

    async createEmptyStore() {
        try {
            console.log('Creating empty ingredients store');
            await storageService.saveData(this.storageKey, []);
            console.log('Empty ingredients store created successfully');
        } catch (error) {
            console.error('Failed to create empty ingredients store:', error);
            throw error;
        }
    }

    async getAllIngredients() {
        try {
            console.log('Fetching all ingredients');
            const ingredients = await storageService.loadData(this.storageKey);
            console.log(`Found ${ingredients?.length || 0} ingredients`);
            return ingredients || [];
        } catch (error) {
            console.error('Failed to get all ingredients:', error);
            throw error;
        }
    }

    async getIngredientById(id) {
        try {
            console.log(`Fetching ingredient with id: ${id}`);
            const ingredients = await this.getAllIngredients();
            const ingredient = ingredients.find(ingredient => ingredient.id === id);
            if (ingredient) {
                console.log('Ingredient found');
            } else {
                console.log('Ingredient not found');
            }
            return ingredient || null;
        } catch (error) {
            console.error(`Failed to get ingredient with id ${id}:`, error);
            throw error;
        }
    }

    async createIngredient(ingredient) {
        try {
            console.log('Creating new ingredient:', ingredient);
            const ingredients = await this.getAllIngredients();

            // Check for duplicates by name
            const existingIngredient = ingredients.find(
                ing => ing.name.toLowerCase() === ingredient.name.toLowerCase()
            );
            if (existingIngredient) {
                throw new Error('An ingredient with this name already exists');
            }

            const newIngredient = {
                ...ingredient,
                id: crypto.lib.WordArray.random(16).toString(),
                createdAt: new Date().toISOString()
            };

            ingredients.push(newIngredient);
            await storageService.saveData(this.storageKey, ingredients);
            console.log('New ingredient created successfully:', newIngredient);
            return newIngredient;
        } catch (error) {
            console.error('Failed to create ingredient:', error);
            throw error;
        }
    }

    async updateIngredient(id, ingredientData) {
        try {
            console.log(`Updating ingredient with id ${id}:`, ingredientData);
            const ingredients = await this.getAllIngredients();
            const index = ingredients.findIndex(i => i.id === id);
            if (index === -1) throw new Error('Ingredient not found');

            // Check for duplicates by name, excluding the current ingredient
            const duplicateNameIndex = ingredients.findIndex(
                i => i.id !== id && i.name.toLowerCase() === ingredientData.name.toLowerCase()
            );
            if (duplicateNameIndex !== -1) {
                throw new Error('An ingredient with this name already exists');
            }

            const updatedIngredient = {
                ...ingredients[index],
                ...ingredientData,
                id,
                updatedAt: new Date().toISOString()
            };
            ingredients[index] = updatedIngredient;

            await storageService.saveData(this.storageKey, ingredients);
            console.log('Ingredient updated successfully:', updatedIngredient);
            return updatedIngredient;
        } catch (error) {
            console.error(`Failed to update ingredient with id ${id}:`, error);
            throw error;
        }
    }

    async deleteIngredient(id) {
        try {
            console.log(`Deleting ingredient with id ${id}`);
            const ingredients = await this.getAllIngredients();
            const filteredIngredients = ingredients.filter(ingredient => ingredient.id !== id);
            await storageService.saveData(this.storageKey, filteredIngredients);
            console.log('Ingredient deleted successfully');
        } catch (error) {
            console.error(`Failed to delete ingredient with id ${id}:`, error);
            throw error;
        }
    }

    async searchIngredients(query) {
        try {
            console.log(`Searching ingredients with query: ${query}`);
            const ingredients = await this.getAllIngredients();
            if (!query) return ingredients;

            const searchTerm = query.toLowerCase();
            const results = ingredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(searchTerm)
            );
            console.log(`Found ${results.length} matching ingredients`);
            return results;
        } catch (error) {
            console.error('Failed to search ingredients:', error);
            throw error;
        }
    }
}

export const ingredientService = new IngredientService();