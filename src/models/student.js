const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error("Not a valid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    studentNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    DOB: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    pushNotificationToken: {
      type: String,
    },
    signUpConfirmation: {
      code: { type: String },
      expiredTime: { type: Date },
    },
    resetPassword: {
      code: { type: String },
      expiredTime: { type: Date },
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.methods.toJSON = function () {
  const student = this;

  const studentObject = student.toObject();

  delete studentObject.password;

  return studentObject;
};

studentSchema.methods.generateAuthToken = async function () {
  const student = this;

  const token = jwt.sign(
    { _id: student._id.toString() },
    process.env.secret_jwt
  );

  return token;
};

studentSchema.methods.generateCode = async function () {
  const student = this;

  const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  student.signUpConfirmation.code = code;

  await student.save();

  return code;
};

studentSchema.methods.generateResetPasswordCode = async function () {
  const student = this;

  const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);

  student.resetPassword.code = code;

  await student.save();

  return code;
};

studentSchema.statics.findByCredentials = async (email, password) => {
  const student = await Student.findOne({ email });

  if (!student) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, student.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return student;
};

studentSchema.pre("save", async function (next) {
  const student = this;

  if (student.isModified("password")) {
    student.password = await bcrypt.hash(student.password, 8);
  }

  next();
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
