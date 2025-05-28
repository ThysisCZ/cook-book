//dependencies and initialization
const path = require('path'); //module for file path work
const Ajv = require('ajv').default; //module for JSON schema validation
const IngredientDao = require('../../dao/ingredient-dao'); //imports ingredientsDao class
let dao = new IngredientDao( //creates a new instance of IngredientsDao class
    path.join(__dirname, "..", "..", "storage", "ingredients.json")
);

//schema - defines expected structure of request input
let schema = {
    type: "object",
    properties: {
        id: { type: "string" },
    },
    required: ["id"]
};

//asynchronous function - handles HTTP request for retrieving ingredient by ID
async function GetAbl(req, res) {
    try {
        const ajv = new Ajv(); //create a new Ajv instance for input validation
        const body = req.query.id ? req.query : req.body; //check if id is in query string or request JSON body
        const valid = ajv.validate(schema, body); //validates input with schema
        if (valid) {
            const ingredientId = body.id; //extract ID from valid input
            const ingredient = await dao.getIngredient(ingredientId); //pass ID to getIngredient DAO method
            if (!ingredient) { //if no ingredient is found
                res
                    .status(404)
                    .send({ error: `Ingredient with given id '${ingredientId}' does not exist.` });
            }
            res.json(ingredient); //send back ingredient JSON object
        } else { //dtoIn is not valid
            res.status(400).send({
                errorMessage: "Validation of dtoIn failed.",
                params: body,
                reason: ajv.errors,
            });
        }
    } catch (e) { //internal server error
        res.status(500).send(e);
    }
}

//makes the function available to other files
module.exports = GetAbl;
