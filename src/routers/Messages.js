const express = require("express");
const Messages = require("../models/messages");
const auth = require("../middlewares/driverAuth");
const Driver = require("../models/driver");

const router = express.Router();

router.delete("/deleteMessages", auth, async (req, res) => {
  try {
    await Messages.deleteMany();

    res.status(200).send();
  } catch (e) {
    res.status(500).send("Wrong ID");
  }
});

router.patch("/saveMessage", auth, async (req, res) => {
  try {
    //  const timeDate = new Date().toLocaleString();
    const { userName, text } = req.body;

    const driver = await Driver.findOne({ driverId: req.driver._id });

    if (!driver) {
      return res.status(404).send();
    }

    const chat = await Messages.findOne({ driverId: req.driver._id });

    if (!chat) {
      const message = new Messages({ driverId: req.driver._id });

      message.chats.push({
        userId: req.body.userId,
        userExpoPushNotificationToken: req.body.userExpoPushNotificationToken,
        avatar: req.body.avatar,
        name: req.body.userName,
        content: [
          {
            text: req.body.text,
            createdAt: new Date(),
            "user._id": req.body._id,
          },
        ],
      });
      // message.chats.content.push({dataMessage:'',timeDate:''});
      await message.save();

      return res.status(200).send({ chat: message.chats[0] });
    }

    let i = 0;

    let flag = true;
    for (i = 0; i < chat.chats.length; i++) {
      if (chat.chats[i].userId == req.body.userId) {
        chat.chats[i].content.push({
          text: req.body.text,
          createdAt: new Date(),
          "user._id": req.body._id,
        });

        chat.chats[i].userExpoPushNotificationToken =
          req.body.userExpoPushNotificationToken; //.updateOne({userId: req.body.userId }, { $set: { expoPushNotificationToken: req.body.expoPushNotificationToken } });
        chat.chats[i].avatar = req.body.avatar;
        chat.chats[i].name = req.body.userName;

        await chat.save();
        flag = false;

        return res.status(200).send({ chat: chat.chats[i] });
      }
    }

    if (flag) {
      chat.chats.push({
        userId: req.body.userId,
        userExpoPushNotificationToken: req.body.userExpoPushNotificationToken,
        avatar: req.body.avatar,
        name: req.body.userName,
      });

      chat.chats[i].content.push({
        text: req.body.text,
        createdAt: new Date(),
        "user._id": req.body._id,
        "user.name": req.body.userName,
      });
      await chat.save();
      return res.status(200).send({ chat: chat.chats[i] });
    }
    flag = true;
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/getAllChats", auth, async (req, res) => {
  try {
    const chats = await Messages.findOne({ driverId: req.driver._id });

    if (!chats) {
      res.status(404).send();
    }

    res.status(200).send({ chats: chats });
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
