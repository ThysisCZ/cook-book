//dependencies and initialization
const path = require('path'); //module for file path work
const Ajv = require('ajv').default; //module for JSON schema validation
const RecipeDao = require('../../dao/recipe-dao'); //imports recipeDao class
let dao = new RecipeDao( //creates a new instance of RecipesDao class
    path.join(__dirname, "..", "..", "storage", "recipes.json")
);

//schema - defines expected structure of request input
let schema = {
    type: "object",
    properties: {
        id: { type: "string" },
    },
    required: ["id"]
};

//asynchronous function - handles HTTP request for retrieving recipe by ID
async function GetAbl(req, res) {
    try {
        const ajv = new Ajv(); //create a new Ajv instance for input validation
        const body = req.query.id ? req.query : req.body; //check if id is in query string or request JSON body
        const valid = ajv.validate(schema, body); //validates input with schema
        if (valid) {
            const recipeId = body.id; //extract ID from valid input
            const recipe = await dao.getRecipe(recipeId); //pass ID to getRecipe DAO method
            if (!recipe) { //if no recipe is found
                res
                    .status(400)
                    .send({ error: `Recipe with id '${recipeId}' doesn't exist.` });
            }
            res.json(recipe); //send back recipe JSON object
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
