const fetch = require("node-fetch");

const auth = require("../middlewares/studentAuth");

const express = require("express");
const router = express.Router();

router.post("/receiverOrderFromStudent", async (req, res) => {
  const message = {
    to: "ExponentPushToken[K9Vpf3KvTCEpu7Z8xaUZFF]",
    sound: "default",
    title: "طلب جديد",
    body: "",
    data: {
      type: "order",
      gate: "البوابة الرئيسية",
      code: Math.round(Math.random() * 10000),
    },
  };

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    res.status(200).send("Done123");
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
