const path = require('path');
const Ajv = require('ajv').default;
const RecipeDao = require('../../dao/recipe-dao');
const dao = new RecipeDao(
    path.join(__dirname, "..", "..", "storage", "recipes.json")
);

const schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        image: { type: "string" },
        preparationProcess: { type: "string" },
        requiredIngredients: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    requiredAmountValue: { type: "number" },
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
        if (e.includes("Recipe with ID ")) {
            res.status(400).send({ errorMessage: e, params: req.body });
        } else {
            res.status(500).send(e);
        }
    }
}

module.exports = CreateAbl;