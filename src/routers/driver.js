const Driver = require("../models/driver");
const DriverCarInfo = require("../models/driverCarInfo");
const auth = require("../middlewares/driverAuth");

const Orders = require("../models/ordersDriver");

const bcrypt = require("bcryptjs");

const express = require("express");
const router = express.Router();

const {
  sendWelcomeEmail,
  sendCancelationEmail,
  sendResetPasswordCode,
} = require("../emails/account");

const multer = require("multer");
const sharp = require("sharp");

router.post("/driver/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      email,
      password,
      phoneNumber,
      DOB,
      city,
    } = req.body;

    const { carNumber, track, carType } = req.body;

    const driver = new Driver({
      firstName,
      lastName,
      gender,
      email,
      password,
      phoneNumber,
      DOB,
      city,
    });
    await driver.save();
    const carInfo = new DriverCarInfo({
      driverId: driver._id,
      carNumber,
      track,
      carType,
    });
    await carInfo.save();

    const orders = new Orders({ driverId: driver._id });
    await orders.save();

    const code = await driver.generateCode();
    sendWelcomeEmail(driver.email, driver.firstName, code);

    const token = await driver.generateAuthToken();
    res.status(201).send({ driver, carInfo, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/driver/signUpConfirmation", auth, async (req, res) => {
  try {
    console.log("s");
    const storedCode = req.driver.signUpConfirmation.code;
    const comingCode = req.body.code;
    console.log(storedCode);
    console.log(comingCode);

    if (storedCode === comingCode) {
      req.driver.confirmedSignUp = true;
      await req.driver.save();
      res.send(req.driver);
    } else {
      res.send({ error: "الرمز التأكيدي الذي أرسلته غير صحيح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/driver/resetSignUpConfirmationCode", auth, async (req, res) => {
  try {
    const code = await req.driver.generateCode();
    sendWelcomeEmail(req.driver.email, req.driver.firstName, code);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/driver/login", async (req, res) => {
  try {
    const driver = await Driver.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (driver.confirmedSignUp === false) {
      return res
        .status(400)
        .send({
          error: "بجب عليك تأكيد حسابك أولا",
          message: "navigate him to signup confirmation",
        });
    }

    if (driver.confirmedAdmin === false) {
      return res
        .status(400)
        .send({ error: "لن تستطيع تسجيل الدخول الا بعد الموافقة من الادمن" });
    }

    const token = await driver.generateAuthToken();

    res.status(200).send({ driver, token });
  } catch (e) {
    res.status(400).send({ error: "الايميل المدخل أو كلمة السر غير صحيحة" });
  }
});

router.post("/driver/logout", auth, async (req, res) => {
  try {
    req.driver.tokens = req.driver.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.driver.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/driver/logoutAll", auth, async (req, res) => {
  try {
    req.driver.tokens = [];
    await req.driver.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/driver/me", auth, async (req, res) => {
  res.status(200).send({ driver: req.driver });
});

// Reset Password
router.post("/driver/forgetPasswordEmail", async (req, res) => {
  try {
    const driver = await Driver.findOne({ email: req.body.email });

    if (!driver) {
      return res.send({ error: "هذا الايميل غير صالح" });
    }

    // else if(driver.confirmed === false){
    //     return res.send({error: 'هذا الايميل غير صالح'})
    // }

    const code = await driver.generateResetPasswordCode();
    sendResetPasswordCode(driver.email, driver.firstName, code);

    const token = await driver.generateAuthToken();

    res.status(200).send({ token });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/driver/frogetPasswordConfirmation", auth, async (req, res) => {
  try {
    const storedCode = req.driver.resetPassword.code;
    const comingCode = req.body.code;

    if (storedCode === comingCode) {
      // req.student.confirmed = true
      // await req.student.save()
      res.send(req.driver);
    } else {
      res.send({ error: "الرمز التأكيدي الذي أرسلته غير صحيح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post(
  "/driver/resetForgetPasswordConfirmationCode",
  auth,
  async (req, res) => {
    try {
      // console.log('Hello')

      const code = await req.driver.generateResetPasswordCode();
      sendResetPasswordCode(req.driver.email, req.driver.firstName, code);
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.post("/driver/newPassword", auth, async (req, res) => {
  try {
    const newPassword = req.body.password;
    const oldPassword = req.driver.password;

    const isMatch = await bcrypt.compare(newPassword, oldPassword);

    if (isMatch) {
      return res.send({
        error: "يجب عليك ادخال كلمة سر مختلفة عن كلمة السر السابقة",
      });
    } else {
      req.driver.password = newPassword;
      await req.driver.save();

      res.status(200).send(req.driver);
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//update profile
router.patch("/driver/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  //firstName, lastName, phoneNumber, email, gender, DOB
  const allowedUpdates = [
    "firstName",
    "lastName",
    "phoneNumber",
    "DOB",
    "email",
    "password",
    "gender",
    "city",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      // console.log(req.driver[update])
      // console.log(req.body[update])
      req.driver[update] = req.body[update];
    });

    await req.driver.save();

    res.send(req.driver);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

//for Avatar
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/driver/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.driver.avatar = buffer;
    await req.driver.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
    console.log(error);
  }
);

router.patch("/driver/me/avatar", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["avatar"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const driver = await Driver.findOne({ _id: req.driver._id });

    if (!driver) {
      return res.status(404).send();
    }

    updates.forEach((update) => (driver[update] = req.body[update]));
    await driver.save();

    // console.log(driver)
    res.status(200).send({ driver: driver });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/driver/me/avatar", auth, async (req, res) => {
  req.driver.avatar = undefined;
  await req.driver.save();
  res.send();
});

router.get("/driver/me/avatar", auth, async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);

    if (!driver || !driver.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");

    res.send(driver.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//for chat
router.post("/searchDriverByName", auth, async (req, res) => {
  try {
    //   console.log(req.body.driverName)

    const drivers = await Driver.find({ firstName: req.body.driverName });

    if (!drivers) {
      return res.status(404).send();
    }

    res.status(200).send({ drivers: drivers });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch("/storeExpoToken", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["pushNotificationToken"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.driver[update] = req.body[update];
    });

    await req.driver.save();

    res.send(req.driver);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

///for settings
router.patch("/driver/changeEmail", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["email"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    // const drivew = await Driver.findOne({_id: req.driver._id })
    const driver = await Driver.findById(req.driver._id);
    if (!driver) {
      return res.status(404).send();
    }

    updates.forEach((update) => (driver[update] = req.body[update]));
    await driver.save();
    res.status(200).send({ newEmail: driver.email });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.patch("/driver/changePhoneNumber", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["phoneNumber"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    // const drivew = await Driver.findOne({_id: req.driver._id })
    const driver = await Driver.findById(req.driver._id);
    if (!driver) {
      return res.status(404).send();
    }

    updates.forEach((update) => (driver[update] = req.body[update]));
    await driver.save();
    res.status(200).send(); //{ newEmail: driver.phoneNumber }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.post("/driver/checkPassword", auth, async (req, res) => {
  try {
    const driver = await Driver.findById({ _id: req.driver._id });

    if (!driver) {
      res.status(404).send();
    }

    const { password } = req.body;
    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      res.status(200).send({ validPassword: false });
    }

    res.status(200).send({ validPassword: true });
  } catch (e) {
    res.status(500).send();
  }
});

//changePassword
router.patch("/driver/changePassword", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["password"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    // const drivew = await Driver.findOne({_id: req.driver._id })
    const driver = await Driver.findById(req.driver._id);
    if (!driver) {
      return res.status(404).send();
    }

    updates.forEach((update) => (driver[update] = req.body[update]));
    await driver.save();
    res.status(200).send(); //{ newEmail: driver.phoneNumber }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
