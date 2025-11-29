const express = require("express");
const { User } = require("../../config");
const routes = express.Router();

// LOGIN
routes.post("/login", async (req, res) => {
  try {
    const result = await User.get();
    const list = result.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const user = list.find(
      (x) => x.email === req.body.email && x.password === req.body.password
    );

    if (user) {
      return res.send({
        success: true,
        data: user, // includes user_type if it exists in Firestore
        message: "User logged in successfully.",
      });
    } else {
      return res.send({
        success: false,
        data: null,
        message: "Email or password is wrong.",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send({
      success: false,
      message: "Error logging in user.",
      error: err.message,
    });
  }
});

// REGISTER
routes.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      user_type, // may be undefined
    } = req.body;

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      // default to 'staff' if not provided
      user_type: user_type || "staff",
    };

    const added = await User.add(newUser);

    return res.send({
      success: true,
      id: added.id,
      data: newUser, // added user_type
      message: "User registered successfully.",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).send({
      success: false,
      message: "Error registering user.",
      error: err.message,
    });
  }
});

module.exports = routes;
