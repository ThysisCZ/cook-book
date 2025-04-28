const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const port = 8000;

const ingredientRouter = require('./controller/ingredient-controller');
const recipeRouter = require('./controller/recipe-controller');

//middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//ingredient endpoint
app.use("/ingredient", ingredientRouter);

//recipe endpoint
app.use("/recipe", recipeRouter);

//endpoint for images
app.use("/images", express.static(path.join(__dirname, "script/images")));

//default path for images
const DEFAULT_STORAGE_PATH = path.join(__dirname, "script", "images");

//storage for saving images in script/images
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, DEFAULT_STORAGE_PATH),
    filename: (req, file, cb) => cb(null, file.originalname)
});

//process uploaded images
const upload = multer({
    storage: storage,
});

//post images to the endpoint for images
app.post('/images', upload.single('image'), (req, res) => {
    res.json({ filename: req.file.filename });
});

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});