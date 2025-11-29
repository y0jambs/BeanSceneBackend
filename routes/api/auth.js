const express = require("express");
const { User } = require("../../config");
const routes = express.Router();

// LOGIN
routes.post("/login", async (req, res) => {
  try {
    // Log what we receive
    console.log("REQ BODY:", req.body);

    const result = await User.get();
    const list = result.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Log what we have in Firestore
    console.log("USERS FROM FIRESTORE:", list);

    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    const user = list.find(
      (x) =>
        (x.email || "").trim().toLowerCase() === email &&
        (x.password || "").trim() === password
    );

    if (user) {
      return res.send({
        success: true,
        data: user,
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
      user_type, // optional
    } = req.body;

    const newUser = {
      firstName,
      lastName,
      email,
      password,
      user_type: user_type || "staff",
    };

    const added = await User.add(newUser);

    return res.send({
      success: true,
      id: added.id,
      data: newUser,
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
