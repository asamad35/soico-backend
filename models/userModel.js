const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First Name is a required field"],
    maxlength: [10, "First Name should be less than 10 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is a required field"],
    maxlength: [10, "Last Name should be less than 10 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field"],
    unique: true,
    validate: {
      validator: function (email) {
        return validator.isEmail(email);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is a required field"],
    minlength: [6, "Password should be atleast 6 characters long"],
    select: false,
  },
  originalPassword: {
    type: String,
  },
  status: {
    type: String,
    default: "Hi! I am using SocioPlus",
  },
  photoUrl: {
    type: String,
    default: "https://static.thenounproject.com/png/3465604-200.png",
  },
  loggedInWithThirdParty: {
    type: Boolean,
    default: false,
  },
});

// hash pass before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// capialize first and last name before saving to db
userSchema.pre("save", async function (next) {
  if (!this.isModified("firstName") && !this.isModified("lastName")) {
    return next();
  }
  this.firstName =
    this.firstName.slice(0, 1).toUpperCase() + this.firstName.slice(1);
  this.lastName =
    this.lastName.slice(0, 1).toUpperCase() + this.lastName.slice(1);
});

// comapre user pass with hashed password
userSchema.methods.isPasswordValid = async function (userEnteredPassword) {
  return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

module.exports = mongoose.model("UserSchema", userSchema);
