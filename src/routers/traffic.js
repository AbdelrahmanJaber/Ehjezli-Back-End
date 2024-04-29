const express = require("express");

const Traffic = require("../models/traffic");

const auth = require("../middlewares/driverAuth");

const router = express.Router();

router.post("/addTraffic", auth, async (req, res) => {
  try {
    const traffic = new Traffic({ driverId: req.driver._id, ...req.body });
    await traffic.save();
    res.status(201).send(traffic);
  } catch (e) {
    //  console.log(e)
    res.status(400).send(e);
  }
});

//remove
router.delete("/traffic", auth, async (req, res) => {
  try {
    const traffic = await Traffic.findOne({ driverId: req.driver._id });

    if (!traffic) {
      res.status(404).send();
    } else {
      await traffic.remove();
      res.status(200).send(traffic);
    }
  } catch (e) {
    res.status(500).send("Wrong ID");
  }
});

router.get("/getTraffic", auth, async (req, res) => {
  try {
    Traffic.find({}, function (err, trafficPoints) {
      if (err) {
        res.status(400).send();
      } else {
        res.status(200).send({ trafficPoints: trafficPoints });
      }
    });
  } catch (e) {
    res.status(500).send();
  }
});
module.exports = router;
