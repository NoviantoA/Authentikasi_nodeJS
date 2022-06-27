const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// HALAMAN LOGIN
router.get("/login", (req, res) => res.render("login"));

// HALAMAN REGISTRASI
router.get("/registrasi", (req, res) => res.render("registrasi"));

// hadle registrasi
router.post("/registrasi", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //   check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "* Tolong Isi Field yang Tertera" });
  }

  // check password match
  if (password !== password2) {
    errors.push({ msg: "* Password Salah" });
  }

  // check password length
  if (password.length < 6) {
    errors.push({ msg: "* Password harus lebih dari 6 digit" });
  }
  if (errors.length > 0) {
    res.render("registrasi", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // validasi sukses
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // user exist
        errors.push({ msg: "* Email Sudah Digunakan" });
        res.render("registrasi", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        // hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hashed
            newUser.password = hash;
            // save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "Anda berhasil melakukan registrasi, sekarang anda harus login terlebih dahulu"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// login handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// logout handle
router.get("/login", (req, res) => {
  req.logout();
  req.flash("success_msg", "anda berhasil logout");
  res.redirect("/users/login");
});

module.exports = router;
