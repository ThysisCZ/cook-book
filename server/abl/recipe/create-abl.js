const path = require('path');
const Ajv = require('ajv').default;
const RecipeDao = require('../../dao/recipe-dao');
const dao = new RecipeDao(
    path.join(__dirname, "..", "..", "storage", "recipes.json")
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