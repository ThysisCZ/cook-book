const path = require('path');
const Ajv = require('ajv').default;
const IngredientDao = require('../../dao/ingredient-dao');
const dao = new IngredientDao(
    path.join(__dirname, "..", "..", "storage", "ingredients.json")
);

const schema = {
    type: "object",
    properties: {
        name: { type: "string", minLength: 1, maxLength: 20 },
        amountValue: { type: "number", minimum: 0.001, maximum: 9999999 },
        amountUnit: { type: "string" }
    },
    required: ["name", "amountValue", "amountUnit"]
};

async function CreateAbl(req, res) {
    try {
        const ajv = new Ajv();
        const valid = ajv.validate(schema, req.body);
        if (valid) {
            let ingredient = req.body;
            ingredient = await dao.createIngredient(ingredient);
            const ingredientList = await dao._loadAllIngredients();
            res.json({ ingredient, ingredientList });
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