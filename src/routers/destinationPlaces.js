const express = require("express");
const DestinationPlaces = require("../models/destinationPlaces");
const auth = require("../middlewares/studentAuth");

const router = express.Router();

router.get("/destinationPlaces", auth, async (req, res) => {
  console.log("jello");
  try {
    const destinationPlaces = await DestinationPlaces.find({});

    if (!destinationPlaces) {
      return res.status(404).send();
    }

    res.status(200).send(destinationPlaces);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
