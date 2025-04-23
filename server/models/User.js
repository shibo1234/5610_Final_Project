const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
});

// bonus points, use bcrypt to hash passwords

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(this.password, saltRounds);
    this.password = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.recordWin = function () {
  this.wins++;
  return this.save();
};

UserSchema.methods.recordLoss = function () {
  this.losses++;
  return this.save();
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
