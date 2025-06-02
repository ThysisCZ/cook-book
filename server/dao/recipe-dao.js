//dependencies
"use-strict";
const fs = require('fs'); //module for reading/writing
const path = require('path'); //module for creating path to JSON

const crypto = require('crypto'); //module for ID generation

const rf = fs.promises.readFile; //enables using await for file reading
const wf = fs.promises.writeFile; //enables using await for file writing

const DEFAULT_STORAGE_PATH = path.join(__dirname, "storage", "recipes.json"); //sets default location for recipe data

//class - handles logic for reading/managing recipes in JSON
class RecipesDao {
    constructor(storagePath) { //checks if path is provided at instantiation
        this.recipeStoragePath = storagePath ? storagePath : DEFAULT_STORAGE_PATH;
    }

    //method - loads and finds all recipes with matching ID
    async getRecipe(id) {
        let recipeList = await this._loadAllRecipes();
        const result = recipeList.find((rec) => rec.id === id);
        return result;
    }

    async listRecipes() {
        let recipeList = await this._loadAllRecipes();
        return recipeList;
    }

    async createRecipe(recipe) {
        let recipeList = await this._loadAllRecipes();
        recipe.id = crypto.randomBytes(8).toString("hex");
        recipeList.push(recipe);
        await wf(this._getStorageLocation(), JSON.stringify(recipeList, null, 2));
        return recipe;
    }

    async updateRecipe(recipe) {
        let recipeList = await this._loadAllRecipes();
        const recipeIndex = recipeList.findIndex((rec) => rec.id === recipe.id);
        if (recipeIndex < 0) {
            throw new Error(`Recipe with given id '${recipe.id}' does not exist.`);
        } else {
            recipeList[recipeIndex] = {
                ...recipeList[recipeIndex],
                ...recipe
            };
        }
        await wf(this._getStorageLocation(), JSON.stringify(recipeList, null, 2));
        return recipeList[recipeIndex];
    }

    //private helper method - reads recipe data from JSON
    async _loadAllRecipes() {
        let recipeList;
        try {
            recipeList = JSON.parse(await rf(this._getStorageLocation()));
        } catch (e) {
            if (e.code === "ENOENT") { //Error No Entity - if file doesn't exist
                console.info("No storage found, initializing new one...");
                recipeList = [];
            } else { //if another kind of error occurs
                throw new Error(
                    "Unable to read from storage. Wrong data format. " +
                    this._getStorageLocation()
                );
            }
        }

        return recipeList;
    }

    //utility method - returns path to recipe JSON
    _getStorageLocation() {
        return this.recipeStoragePath;
    }
}

//makes the class available to other files
module.exports = RecipesDao;