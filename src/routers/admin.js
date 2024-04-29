const Admin = require("../models/admin");
const auth = require("../middlewares/adminAuth");

const Driver = require("../models/driver");
const DriverCarInfo = require("../models/driverCarInfo");
const OriginPlaces = require("../models/originPlaces");
const Cars = require("../models/cars");
const DestinationPlaces = require("../models/destinationPlaces");

const ObjectId = require("mongodb").ObjectId;

const express = require("express");
const router = express.Router();

router.post("/admin/signUp", async (req, res) => {
  try {
    const admin = new Admin(req.body);

    await admin.save();

    const token = await admin.generateAuthToken();
    res.status(201).send({ admin, token });
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await admin.generateAuthToken();
    res.status(200).send({ admin, token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/admin/logout", auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.admin.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/admin/logoutAll", auth, async (req, res) => {
  try {
    req.admin.tokens = [];
    await req.admin.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/admin/me", auth, async (req, res) => {
  res.status(200).send(req.admin);
});

router.get("/admin/driversNotConfirmed", async (req, res) => {
  try {
    const drivers = await Driver.find({ confirmedAdmin: false });

    if (!drivers) {
      return res.status(404).send();
    }

    const result = await drivers.map(async (drv) => {
      const carInfo = await DriverCarInfo.findOne({ driverId: drv._id });
      return { driver: drv, carInfo: carInfo };
    });

    const arr = await Promise.all(result);

    res.status(200).send(arr);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.delete("/admin/deleteDriver/:driverID", async (req, res) => {
  try {
    await Driver.deleteOne({ _id: req.params.driverID });
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/admin/confirmDriver/:driverID", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverID);

    if (!driver) {
      return res.status(404).send();
    }

    driver.confirmedAdmin = true;
    await driver.save();

    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/admin/AddoriginPlace", async (req, res) => {
  const originPlaces = new OriginPlaces(req.body);
  try {
    await originPlaces.save();
    res.status(201).send(originPlaces);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete("/admin/deleteGate/:gateID", async (req, res) => {
  try {
    await OriginPlaces.deleteOne({ _id: req.params.gateID });
    res.status(200).send();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.patch("/admin/updateGate/:gateID", async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["gateName", "opened", "longitude", "latitude"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const gate = await OriginPlaces.findById(req.params.gateID);

    if (!gate) {
      return res.status(404).send();
    }

    updates.forEach((update) => (gate[update] = req.body[update]));
    await gate.save();
    res.send(gate);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/admin/getOriginPlaces", async (req, res) => {
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

// cars
router.post("/admin/AddCar", async (req, res) => {
  const car = new Cars({
    ...req.body,
    carTypeEncoded:
      req.body.carName === "تكسي"
        ? "Taxi"
        : req.body.carName === "باص"
        ? "Bus"
        : req.body.carName === "حافلة"
        ? "Van"
        : null,
    carTrackEncoded:
      req.body.carTrack === "رفيديا"
        ? "Rafidia"
        : req.body.carTrack === "البلد"
        ? "Balad"
        : req.body.carTrack === "القديمة"
        ? "Qadima"
        : req.body.carTrack === "المخفية"
        ? "Makhfia"
        : null,
  });

  try {
    await car.save();
    res.status(201).send(car);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete("/admin/deleteCar/:carID", async (req, res) => {
  try {
    await Cars.deleteOne({ _id: req.params.carID });
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/admin/updateCar/:carID", async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["carName", "carTrack", "carPrice"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const car = await Cars.findById(req.params.carID);

    if (!car) {
      return res.status(404).send();
    }

    updates.forEach((update) => (car[update] = req.body[update]));
    await car.save();
    res.send(car);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/admin/getCars", async (req, res) => {
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

//destination places
router.post("/admin/AddDestinationPlace", async (req, res) => {
  const destinationPlace = new DestinationPlaces(req.body);

  try {
    await destinationPlace.save();
    res.status(201).send(destinationPlace);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete(
  "/admin/deleteDestinationPlace/:destinationPlaceID",
  async (req, res) => {
    try {
      await DestinationPlaces.deleteOne({ _id: req.params.destinationPlaceID });
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.patch(
  "/admin/updateDestinationPlace/:destinationPlaceID",
  async (req, res) => {
    const updates = Object.keys(req.body);
    const availableUpdates = [
      "mainDestination",
      "subDestination",
      "exactDestination",
      "longitude",
      "latitude",
    ];
    const isValidOperation = updates.every((update) => {
      return availableUpdates.includes(update);
    });

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates" });
    }

    try {
      const destinationPlace = await DestinationPlaces.findById(
        req.params.destinationPlaceID
      );

      if (!destinationPlace) {
        return res.status(404).send();
      }

      updates.forEach(
        (update) => (destinationPlace[update] = req.body[update])
      );
      await destinationPlace.save();
      res.send(destinationPlace);
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.get("/admin/getDestinationPlaces", async (req, res) => {
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

var queue = [];
router.get("/getQueue", async (req, res) => {
  res.status(200).send(queue);
});

router.get("/pushQueue", async (req, res) => {
  queue.push("1");
  res.status(200).send(queue);
});

module.exports = router;
