const express = require("express");
const auth = require("../middlewares/driverAuth");
//for get available drivers router
const studentAuth = require("../middlewares/studentAuth");

const AvailableDrivers = require("../models/availableDrivers");
const Orders = require("../models/order");
const Driver = require("../models/driver");
const Student = require("../models/student");
const DriverInfo = require("../models/driverCarInfo");

const router = express.Router();

router.get("/availableDrivers", studentAuth, async (req, res) => {
  try {
    const availableDrivers = await AvailableDrivers.find({});

    if (!availableDrivers) {
      return res.status(404).send();
    }

    res.status(200).send(availableDrivers);
  } catch (e) {
    res.status(500).send();
  }
});

//save the driver data in the available drivers
router.post("/availableDrivers", auth, async (req, res) => {
  try {
    //store the driver in the database
    const availableDriver = new AvailableDrivers({
      ...req.body,
      driverId: req.driver._id,
    });
    await availableDriver.save();

    // check if there is completed number of students
    let carType = availableDriver.carType;

    let carCapacity;

    if (carType === "تكسي") {
      carCapacity = 4;
    } else if (carType === "باص") {
      carCapacity = 50;
    } else if (carType === "حافلة") {
      carCapacity = 7;
    }

    let carTrack = availableDriver.track;

    // find number of students orders with the same track and count of them greater tha n or equal to carCapacity

    const matchedOrders = await Orders.find({
      "destination.mainDestination": carTrack,
      "car.type": carType,
      status: "waiting",
    });

    let matchedOrdersCheck = [];
    for (let i = 0; i < matchedOrders.length; i++) {
      matchedOrdersCheck = [];
      for (let j = 0; j < matchedOrders.length; j++) {
        if (i === j);
        else if (
          matchedOrders[j].origin.gateName ===
            matchedOrders[i].origin.gateName &&
          matchedOrders[j].destination.subDestination ===
            matchedOrders[i].destination.subDestination
        ) {
          matchedOrdersCheck.push(matchedOrders[j]);
        }
      }

      if (matchedOrdersCheck.length >= carCapacity) {
        break;
      }
    }

    //check length
    var matchedOrdersLimit = [];
    if (matchedOrdersCheck.length >= carCapacity) {
      for (let i = 0; i < carCapacity; i++) {
        matchedOrdersLimit.push(matchedOrdersCheck[i]);
      }

      let driver = await Driver.findById(availableDriver.driverId);
      let driverInfo = await DriverInfo.findOne({ driverId: driver._id });

      //generate random code
      var code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

      //send notification and student information and gate to driver

      var ExpoTokensArray = [];
      for (let i = 0; i < matchedOrdersLimit.length; i++) {
        let studentObjectForExpo = await Student.findById(
          matchedOrdersLimit[i].studentID
        );
        ExpoTokensArray.push(studentObjectForExpo.pushNotificationToken);
      }

      const message = {
        to: driver.pushNotificationToken,
        sound: "default",
        title: "طلب جديد",
        body: "",
        data: {
          type: "order",

          code: code,

          // gate Information
          gate: matchedOrdersLimit[0].origin.gateName,
          gateLongitude: matchedOrdersLimit[0].origin.longitude,
          gateLatitude: matchedOrdersLimit[0].origin.latitude,

          totalPrice: carCapacity * matchedOrdersLimit[0].car.price,

          //students information
          studentInformation: matchedOrdersLimit,

          //student tokens
          studentsPushToken: ExpoTokensArray,
        },
      };

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      //send notification to students and their driver information
      for (let i = 0; i < matchedOrdersLimit.length; i++) {
        let studentObject = await Student.findById(
          matchedOrdersLimit[i].studentID
        );
        matchedOrdersLimit[i].status = "confirmed";

        await matchedOrdersLimit[i].save();

        if (studentObject) {
          //remove it

          let message = {
            to: studentObject.pushNotificationToken,
            sound: "default",
            title: "تم قبول طلبك",
            body: "",
            data: {
              type: "order",
              gate: matchedOrdersLimit[i].origin.gateName,
              code: code,

              driverName: driver.firstName + " " + driver.lastName,
              driverNumber: driver.phoneNumber,
              driverExpoToken: driver.pushNotificationToken,
              carNumber: driverInfo.carNumber,
            },
          };

          await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Accept-encoding": "gzip, deflate",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
          });
        }
      } // if remove it
    }
    res.status(201).send(availableDriver);
  } catch (e) {
    // console.log(e)
    res.status(400).send(e);
  }
});

//update longitude, latitude and heading over time
router.patch("/availableDrivers", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["longitude", "latitude", "heading"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const availableDriver = await AvailableDrivers.findOne({
      driverID: req.driver._id,
    });

    if (!availableDriver) {
      return res.status(404).send();
    }

    updates.forEach((update) => (availableDriver[update] = req.body[update]));
    await availableDriver.save();
    res.send(availableDriver);
  } catch (e) {
    res.status(400).send(e);
  }
});

//remove the driver if not available
router.delete("/availableDrivers", auth, async (req, res) => {
  try {
    const availableDriver = await AvailableDrivers.findOne({
      driverId: req.driver._id,
    });

    // console.log(req.driver._id)

    if (!availableDriver) {
      res.status(404).send();
    }

    await availableDriver.remove();
    res.send(availableDriver);
  } catch (e) {
    res.status(500).send("Wrong ID");
  }
});

module.exports = router;
