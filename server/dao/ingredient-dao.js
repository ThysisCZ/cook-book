//dependencies
"use-strict";
const fs = require('fs'); //module for reading/writing
const path = require('path'); //module for creating path to JSON

const crypto = require('crypto'); //module for ID generation

const rf = fs.promises.readFile; //enables using await for file reading
const wf = fs.promises.writeFile; //enables using await for file writing

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "ingredients.json"); //sets default location for ingredient data

//class - handles logic for reading/managing ingredients in JSON
class IngredientsDao {
    constructor(storagePath) { //checks if path is provided at instantiation
        this.ingredientStoragePath = storagePath ? storagePath : DEFAULT_STORAGE_PATH;
    }

    //method - loads and finds all ingredients with matching ID
    async getIngredient(id) {
        let ingredientList = await this._loadAllIngredients();
        const result = ingredientList.find((ing) => ing.id === id);
        return result;
    }

    async listIngredients() {
        let ingredientList = await this._loadAllIngredients();
        return ingredientList;
    }

    async createIngredient(ingredient) {
        let ingredientList = await this._loadAllIngredients();
        ingredient.id = crypto.randomBytes(8).toString("hex");
        ingredientList.push(ingredient);
        await wf(this._getStorageLocation(), JSON.stringify(ingredientList, null, 2));
        return ingredient;
    }

    //private helper method - reads ingredient data from JSON
    async _loadAllIngredients() {
        let ingredientList;
        try {
            ingredientList = JSON.parse(await rf(this._getStorageLocation()));
        } catch (e) {
            if (e.code === "ENOENT") { //Error No Entity - if file doesn't exist
                console.info("No storage found, initializing new one...");
                ingredientList = [];
            } else { //if another kind of error occurs
                throw new Error(
                    "Unable to read from storage. Wrong data format. " +
                    this._getStorageLocation()
                );
            }
        }

        return ingredientList;
    }

    //utility method - returns path to ingredient JSON
    _getStorageLocation() {
        return this.ingredientStoragePath;
    }
}

//makes the class available to other files
module.exports = IngredientsDao;