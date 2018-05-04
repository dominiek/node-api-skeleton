const { omit } = require('lodash');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    name: { type: String, trim: true, required: true },
    hashedPassword: { type: String }
  },
  {
    timestamps: true
  }
);

schema.methods.verifyPassword = function verifyPassword(password) {
  if (!this.hashedPassword) return false;
  return bcrypt.compare(password, this.hashedPassword);
};

schema.virtual('password').set(function setPassword(password) {
  this._password = password;
});

schema.pre('save', async function preSave(next) {
  if (this._password) {
    const salt = await bcrypt.genSalt(12);
    this.hashedPassword = await bcrypt.hash(this._password, salt);
    delete this._password;
  }
  return next();
});

schema.methods.toResource = function toResource() {
  return {
    id: this._id,
    ...omit(this.toObject(), ['_id', 'hashedPassword', '_password'])
  };
};

module.exports = mongoose.models.User || mongoose.model('User', schema);
