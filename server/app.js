const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

const ingredientRouter = require('./controller/ingredient-controller'); //import router for ingredients

//middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

//add ingredient routes to the app
app.use("/ingredient", ingredientRouter);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});