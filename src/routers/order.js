const express = require("express");
const Orders = require("../models/order");
const auth = require("../middlewares/studentAuth");

const AvailableDrivers = require("../models/availableDrivers");
const Driver = require("../models/driver");
const Student = require("../models/student");
const DriverInfo = require("../models/driverCarInfo");

const moment = require("moment");
const fetch = require("node-fetch");

const router = express.Router();

router.get("/orders", auth, async (req, res) => {
  try {
    const orders = await Orders.find({});

    if (!orders) {
      return res.status(404).send();
    }

    res.status(200).send(orders);
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/orders", auth, async (req, res) => {
  try {
    //check previous order
    const previousOrder = await Orders.findOne({
      studentID: req.student._id,
      status: "waiting",
    });
    if (previousOrder) {
      res.status(400).send();
    }

    //store the order
    const order = new Orders({ ...req.body, studentID: req.student._id });
    await order.save();

    //find the type of the car
    const carType = req.body.car.type;

    var carCapacity;
    if (carType === "تكسي") {
      carCapacity = 4;
    } else if (carType === "باص") {
      carCapacity = 50;
    } else if (carType === "حافلة") {
      carCapacity = 7;
    }

    //check number of previous matched order
    const matchedOrders = await Orders.find({
      "origin.gateName": order.origin.gateName,
      "destination.subDestination": order.destination.subDestination,
      "car.type": order.car.type,
      status: "waiting",
    });

    const matchedOrdersLength = matchedOrders.length;
    console.log(matchedOrdersLength);

    if (matchedOrdersLength === carCapacity) {
      //check if there is avaialable drivers
      const availableDriver = await AvailableDrivers.findOne({
        carType: order.car.type,
        track: order.destination.mainDestination,
      });
      if (!availableDriver) {
        res.status(200).send();
      }

      var driver = await Driver.findById(availableDriver.driverId);
      var driverInfo = await DriverInfo.findOne({ driverId: driver._id });

      //generate random code
      var code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

      //send notification and student information and gate to driver

      var ExpoTokensArray = [];
      for (let i = 0; i < matchedOrders.length; i++) {
        let studentObjectForExpo = await Student.findById(
          matchedOrders[i].studentID
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
          gate: order.origin.gateName,
          gateLongitude: order.origin.longitude,
          gateLatitude: order.origin.latitude,

          totalPrice: carCapacity * order.car.price,

          //student Expo Tokens

          //students information
          studentInformation: matchedOrders,

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
      for (let i = 0; i < matchedOrders.length; i++) {
        let studentObject = await Student.findById(matchedOrders[i].studentID);
        matchedOrders[i].status = "confirmed";

        await matchedOrders[i].save();

        if (studentObject) {
          let message = {
            to: studentObject.pushNotificationToken,
            sound: "default",
            title: "تم قبول طلبك",
            body: "",
            data: {
              type: "order",
              gate: order.origin.gateName,
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

          console.log(message);
        }
      } // if
      res.status(200).send();
    } else {
      res.status(200).send();
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/checkPreviousOrder", auth, async (req, res) => {
  try {
    const previousOrder = await Orders.findOne({
      studentID: req.student._id,
      status: "waiting",
    });

    if (previousOrder) {
      const lastOrder = previousOrder.createdAt;
      const diffInMinutes = moment().diff(moment(lastOrder), "minutes");
      if (diffInMinutes < 10) {
        const timeLeft = 10 - diffInMinutes;
        res.status(200).send({
          error:
            "لديك بالفعل طلب سابق، تستطيع حجز طلب جديد بعد " +
            timeLeft +
            " دقائق",
        });
      } else {
        await Orders.deleteOne({ studentID: req.student._id });
        res.status(200).send({ error: "" });
      }
    } else {
      res.status(200).send({ error: "" });
    }
  } catch (e) {
    res.status(400).send({ error: "" });
  }
});

router.get("/order/getStudentHistory", auth, async (req, res) => {
  try {
    const orders = await Orders.find({
      studentID: req.student._id,
      status: "confirmed",
    });

    if (!orders) {
      return res.status(404).send();
    }

    res.status(200).send(orders);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
