//dependencies
const express = require('express');
const router = express.Router(); //creates Express router instance

const GetAbl = require('../abl/ingredient/get-abl'); //imports getAbl function
const ListAbl = require('../abl/ingredient/list-abl');
const CreateAbl = require('../abl/ingredient/create-abl');

//defines a route for GET requests at /ingredient/get
router.get("/get", async (req, res) => {
    await GetAbl(req, res);
});

router.get("/list", async (req, res) => {
    await ListAbl(req, res);
});

router.post("/create", async (req, res) => {
    await CreateAbl(req, res);
})

//makes the router available to other files, allows to set up endpoint
module.exports = router;