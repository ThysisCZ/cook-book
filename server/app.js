const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8000;

const ingredientRouter = require('./controller/ingredient-controller'); //import router for ingredients
const recipeRouter = require('./controller/recipe-controller'); //import router for recipes

//middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

//ingredient endpoint
app.use("/ingredient", ingredientRouter);

//recipe endpoint
app.use("/recipe", recipeRouter);

//endpoint for images
app.use('/images', express.static(path.join(__dirname, 'script/images')));

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});