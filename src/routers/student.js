const Student = require("../models/student");
const auth = require("../middlewares/studentAuth");
const bcrypt = require("bcryptjs");

const express = require("express");
const router = express.Router();

const {
  sendWelcomeEmail,
  sendCancelationEmail,
  sendResetPasswordCode,
} = require("../emails/account");

//  for Avatar

const multer = require("multer");
const sharp = require("sharp");

router.post("/student/signup", async (req, res) => {
  console.log(req.body);

  try {
    const student = new Student(req.body);
    await student.save();

    const code = await student.generateCode();
    sendWelcomeEmail(student.email, student.firstName, code);

    const token = await student.generateAuthToken();
    res.status(201).send({ student, token });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.post("/student/signUpConfirmation", auth, async (req, res) => {
  console.log("f");

  try {
    const storedCode = req.student.signUpConfirmation.code;
    const comingCode = req.body.code;

    if (storedCode === comingCode) {
      req.student.confirmed = true;
      await req.student.save();
      res.send(req.student);
    } else {
      res.send({ error: "الرمز التأكيدي الذي أرسلته غير صحيح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/student/resetSignUpConfirmationCode", auth, async (req, res) => {
  try {
    const code = await req.student.generateCode();
    sendWelcomeEmail(req.student.email, req.student.firstName, code);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/student/login", async (req, res) => {
  try {
    const student = await Student.findByCredentials(
      req.body.email,
      req.body.password
    );

    if (student.confirmed === false) {
      return res
        .status(400)
        .send({
          error: "بجب عليك تأكيد حسابك أولا",
          message: "navigate him to signup confirmation",
        });
    }

    const token = await student.generateAuthToken();

    res.status(200).send({ student, token });
  } catch (e) {
    res.status(400).send({ error: "الايميل المدخل أو كلمة السر غير صحيحة" });
  }
});

router.get("/student/me", auth, async (req, res) => {
  const studentObject = req.student.toObject();

  delete studentObject.signUpConfirmation;
  delete studentObject.confirmed;
  delete studentObject.createdAt;
  delete studentObject.updatedAt;
  delete studentObject.__v;
  delete studentObject.password;
  delete studentObject.resetPassword;

  if (studentObject.avatar) {
    delete studentObject.avatar;
  }

  console.log("hello");

  res.status(200).send(studentObject);
});

//get avatar
router.get("/student/getAvatar", auth, async (req, res) => {
  const studentObject = req.student.toObject();

  res.status(200).send({ avatar: studentObject.avatar });
});

// Reset Password
router.post("/student/forgetPasswordEmail", async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });

    if (!student) {
      return res.send({ error: "هذا الايميل غير صالح" });
    } else if (student.confirmed === false) {
      return res.send({ error: "هذا الايميل غير صالح" });
    }

    const code = await student.generateResetPasswordCode();
    sendResetPasswordCode(student.email, student.firstName, code);

    const token = await student.generateAuthToken();

    res.status(200).send({ token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/student/frogetPasswordConfirmation", auth, async (req, res) => {
  try {
    const storedCode = req.student.resetPassword.code;
    const comingCode = req.body.code;

    if (storedCode === comingCode) {
      // req.student.confirmed = true
      // await req.student.save()
      res.send(req.student);
    } else {
      res.send({ error: "الرمز التأكيدي الذي أرسلته غير صحيح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post(
  "/student/resetForgetPasswordConfirmationCode",
  auth,
  async (req, res) => {
    try {
      // console.log('Hello')

      const code = await req.student.generateResetPasswordCode();
      sendResetPasswordCode(req.student.email, req.student.firstName, code);
      res.status(200).send();
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.post("/student/newPassword", auth, async (req, res) => {
  try {
    const newPassword = req.body.password;
    const oldPassword = req.student.password;

    const isMatch = await bcrypt.compare(newPassword, oldPassword);

    if (isMatch) {
      return res.send({
        error: "يجب عليك ادخال كلمة سر مختلفة عن كلمة السر السابقة",
      });
    } else {
      req.student.password = newPassword;
      await req.student.save();

      res.status(200).send(req.student);
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//update profile
router.patch("/student/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  const allowedUpdates = [
    "firstName",
    "lastName",
    "phoneNumber",
    "DOB",
    "email",
    "password",
    "gender",
    "city",
    "faculty",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    console.log(req.body.DOB);

    updates.forEach((update) => {
      req.student[update] = req.body[update];
    });

    await req.student.save();

    res.send(req.student);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

router.post("/student/storeExpoToken", auth, async (req, res) => {
  try {
    //  console.log('dd')
    const token = req.body.token;
    req.student.pushNotificationToken = token;

    await req.student.save();

    res.status(200).send(req.student.pushNotificationToken);
  } catch (e) {
    res.status(400).send(e);
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
  "/student/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.student.avatar = buffer;
    await req.student.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
    console.log(error);
  }
);

router.delete("/student/me/avatar", auth, async (req, res) => {
  req.student.avatar = undefined;
  await req.student.save();
  res.send();
});

router.get("/student/me/avatar", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    if (!student || !student.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");

    res.send(student.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

//change password
router.patch("/student/changePassword", auth, async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const currentPassword = req.student.password;

    const isMatch = await bcrypt.compare(oldPassword, currentPassword);

    if (!isMatch) {
      return res.send({ error: "كلمة السر القديمة غير صحيحة", message: "" });
    } else {
      req.student.password = newPassword;
      await req.student.save();

      res.status(200).send({ error: "", message: "تم تغيير كلمة السر بنجاح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//change Email
router.patch("/student/changeEmail", auth, async (req, res) => {
  try {
    const oldEmail = req.body.oldEmail;
    const newEmail = req.body.newEmail;

    const currentEmail = req.student.email;

    if (oldEmail !== currentEmail) {
      return res.send({ error: "الإيميل القديم غير صحيح", message: "" });
    } else {
      req.student.email = newEmail;
      await req.student.save();

      res.status(200).send({ error: "", message: "تم تغيير الإيميل بنجاح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//change phone Number
router.patch("/student/changePhoneNumber", auth, async (req, res) => {
  try {
    const oldPhoneNumber = req.body.oldPhoneNumber;
    const newPhoneNumber = req.body.newPhoneNumber;

    const currentPhoneNumber = req.student.phoneNumber;

    if (oldPhoneNumber !== currentPhoneNumber) {
      return res.send({ error: "رقم الهاتف القديم غير صحيح", message: "" });
    } else {
      req.student.phoneNumber = newPhoneNumber;
      await req.student.save();
      res
        .status(200)
        .send({ error: "", message: "تم تغيير  رقم الهاتف بنجاح" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

//update avatar
router.patch("/student/updateAvatar", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const availableUpdates = ["avatar"];
  const isValidOperation = updates.every((update) => {
    return availableUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const student = await Student.findOne({ _id: req.student._id });

    if (!student) {
      return res.status(404).send();
    }

    updates.forEach((update) => (student[update] = req.body[update]));
    await student.save();

    res.status(200).send({ avatar: student.avatar });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
