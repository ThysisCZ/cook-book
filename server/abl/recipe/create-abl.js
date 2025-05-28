const path = require('path');
const Ajv = require('ajv').default;
const RecipeDao = require('../../dao/recipe-dao');
const dao = new RecipeDao(
    path.join(__dirname, "..", "..", "storage", "recipes.json")
);
const IngredientDao = require('../../dao/ingredient-dao');
const ingredientDao = new IngredientDao(
    path.join(__dirname, "..", "..", "storage", "ingredients.json")
);

const schema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 20 },
        image: { type: "string" },
        preparationProcess: { type: "string", minLength: 1, maxLength: 4000 },
        requiredIngredients: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    requiredAmountValue: { type: "number", minimum: 0.001, maximum: 9999999 },
                    requiredAmountUnit: { type: "string" },
                },
                required: ["id", "requiredAmountValue", "requiredAmountUnit"]
            }
        }

    },
    required: ["name", "image", "preparationProcess", "requiredIngredients"]
};

async function CreateAbl(req, res) {
    try {
        const ajv = new Ajv();
        const valid = ajv.validate(schema, req.body);
        if (valid) {
            let recipe = req.body;
            //loop over each ingredient object
            for (const ing of recipe.requiredIngredients) {
                if (ing.id) {
                    //get ingredient ID with a DAO method
                    let ingredient = await ingredientDao.getIngredient(ing.id);
                    //check if ingredient exists
                    if (!ingredient) {
                        res.status(404).send({
                            errorMessage: `Ingredient with given id ${ing.id} does not exist.`,
                            params: req.body,
                            reason: ajv.errors,
                        });
                        return;
                    }
                }
            }
            //extract ids
            const ids = recipe.requiredIngredients.map((ing) => ing.id)
            //check if any id occurs more than once by comparing their index with the current index
            const hasDuplicates = ids.find((id, idx) => ids.indexOf(id) !== idx)
            if (hasDuplicates) {
                res.status(403).send({
                    errorMessage: `Recipe contains duplicit ingredients.`,
                    params: req.body,
                    reason: ajv.errors,
                });
                return;
            }
            recipe = await dao.createRecipe(recipe);
            const recipeList = await dao._loadAllRecipes();
            res.json({ recipe, recipeList });
        } else {
            res.status(400).send({
                errorMessage: "Validation of dtoIn failed.",
                params: req.body,
                reason: ajv.errors
            });
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = CreateAbl;