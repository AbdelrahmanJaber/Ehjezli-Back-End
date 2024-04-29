const express = require("express");
const OriginPlaces = require("../models/originPlaces");
const auth = require("../middlewares/studentAuth");

const router = express.Router();

//student use this route

router.get("/originPlaces", async (req, res) => {
  try {
    const originPlaces = await OriginPlaces.find({});

    if (!originPlaces) {
      return res.status(404).send();
    }

    res.status(200).send(originPlaces);
  } catch (e) {
    res.status(500).send();
  }
});

//this auth should be for admin just
router.post("/originPlaces", auth, async (req, res) => {
  const originPlaces = new OriginPlaces(req.body);

  // console.log(originPlaces)

  try {
    await originPlaces.save();
    res.status(201).send(originPlaces);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
