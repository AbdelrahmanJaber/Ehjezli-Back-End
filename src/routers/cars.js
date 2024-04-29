const express = require("express");
const Cars = require("../models/cars");
const auth = require("../middlewares/studentAuth");

const router = express.Router();

router.get("/cars", auth, async (req, res) => {
  try {
    const cars = await Cars.find({});

    if (!cars) {
      return res.status(404).send();
    }

    res.status(200).send(cars);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
