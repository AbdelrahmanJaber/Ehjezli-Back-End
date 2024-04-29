const express = require("express");
const DriverCarInfo = require("../models/driverCarInfo");
const auth = require("../middlewares/driverAuth");

const router = express.Router();

router.post("/driverCarInfo/me", auth, async (req, res) => {
  try {
    const carInfo = await DriverCarInfo.findOne({ driverId: req.driver._id });
    if (!carInfo) {
      res.status(404).send();
    }

    res.status(200).send({ carInfo: carInfo });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.patch("/driverCarInfo", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = [
    "carType",
    "track",
    "carBrand",
    "carModel",
    "carYear",
    "carNumber",
  ];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const carInfo = await DriverCarInfo.findOne({ driverId: req.driver._id });

    if (!carInfo) {
      return res.status(404).send();
    }

    updates.forEach((update) => (carInfo[update] = req.body[update]));
    await carInfo.save();
    res.status(200).send({ carInfo: carInfo });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
