const express = require("express");
const Orders = require("../models/ordersDriver");
const auth = require("../middlewares/driverAuth");

const router = express.Router();

router.post("/getDriverOrders", auth, async (req, res) => {
  try {
    const orders = await Orders.findOne({ driverId: req.driver._id });
    if (!orders) {
      res.status(404).send();
    }

    res.status(200).send({ orders: orders });
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/driverOrders", auth, async (req, res) => {
  try {
    const orders = await Orders.findOne({ driverId: req.driver._id });

    if (!orders) {
      return res.status(404).send();
    }

    const current_date = new Date();
    const month = current_date.getMonth() + 1;
    const date =
      current_date.getFullYear() + "-" + month + "-" + current_date.getDate();
    const time =
      current_date.getHours() +
      ":" +
      current_date.getUTCMinutes() +
      ":" +
      current_date.getSeconds();

    const { code, gate } = req.body;
    orders.orders.push({ code, gate, date, time });
    orders.save();
    res.status(200).send({ orders: orders });
  } catch (e) {
    // console.log(e)
    res.status(400).send(e);
  }
});

module.exports = router;
