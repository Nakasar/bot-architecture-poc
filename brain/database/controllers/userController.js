'user strict';
var User = require("../models/userModel");
const bcrypt = require("bcrypt");
const secret = require("../../secret");
const jwt = require('jsonwebtoken');

exports.create_user = function(user) {
  return new Promise((resolve, reject) => {
    // check for user unicity
    User.findOne({ user_name: user.user_name }, (err, userFound) => {
      if (err) {
        return reject();
      } else if (userFound) {
        return reject({ message: "Username already used."})
      } else {
        // New user can be added.

        // Hash password
        bcrypt.hash(user.password, 8, (err, hash) => {
          if (err) {
            return reject();
          }

          let new_user = new User({ user_name: user.user_name, password: hash });
          new_user.save((err) => {
            if (err) {
              return reject();
            }
            return resolve({ user: { id: new_user._id }});
          })
        });
      }
    });
  });
}

exports.sign_in = function(user_name, password) {
  return new Promise((resolve, reject) => {
    User.findOne({ user_name: user_name }, function(err, user) {
      if (err) {
        console.log(err.stack);
        return reject();
      } else if (user) {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // Password matched, generate token.
            let token = jwt.sign({ user: { user_name: user.name, id: user._id }}, secret.secret, { expiresIn: '1d' });
            return resolve({ message: "User signed in.", token: token });
          } else {
            return reject({ message: "Invalid password." });
          }
        });
      } else {
        return reject({ message: "No user with this user_name."});
      }
    });
  })
}
