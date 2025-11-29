// routes/api/dishes.js

const express = require("express");
const { Dishes } = require("../../config");
const multer = require("multer");
const path = require("path");

const routes = express.Router();

// ------------------------------------------------------
// MULTER SETUP  (for optional image upload)
// ------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // images folder in project root
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    // keep original file name so it matches what you use in Firestore
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// ------------------------------------------------------
// GET ALL DISHES
// ------------------------------------------------------
routes.get("/", async (req, res) => {
  try {
    const snapshot = await Dishes.get();
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).send(list);
  } catch (err) {
    console.error("Get dishes error:", err);
    return res.status(500).send({
      success: false,
      message: "Error getting dishes.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// CREATE ONE DISH  (supports image upload OR plain file name)
// ------------------------------------------------------
// If you upload an image from Postman / frontend, use field name "file"
routes.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { name, description, price, dietary_flags, category } = req.body;

    if (!name || !category || price == null) {
      return res.status(400).send({
        success: false,
        message: "name, category and price are required",
      });
    }

    // If an image was uploaded, use its filename.
    // Otherwise, allow a plain text "file" field in the JSON body.
    const fileName = req.file
      ? req.file.filename
      : req.body.file
      ? req.body.file
      : "";

    const payload = {
      name,
      description: description || "",
      category,
      price: Number(price),
      dietary_flags: dietary_flags || "",
      file: fileName,
    };

    const docRef = await Dishes.add(payload);

    return res.status(201).send({
      success: true,
      id: docRef.id,
      data: payload,
      message: "Dish created successfully",
    });
  } catch (err) {
    console.error("Create dish error:", err);
    return res.status(500).send({
      success: false,
      message: "Error creating dish.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// BULK CREATE DISHES  (for seeding via Postman)
// ------------------------------------------------------
// POST /api/dishes/bulk
// Body example:
// {
//   "dishes": [
//     { "name": "Veggie Burger", "category": "mains", "price": 18, "file": "veggieburger.jpg" },
//     { "name": "Cappuccino", "category": "drinks", "price": 5, "file": "cappuccino.jpg" }
//   ]
// }
routes.post("/bulk", async (req, res) => {
  try {
    const { dishes } = req.body;

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Body must contain a non-empty 'dishes' array",
      });
    }

    const created = [];

    for (const d of dishes) {
      if (!d.name || !d.category || d.price == null) {
        // skip invalid entries
        continue;
      }

      const payload = {
        name: d.name,
        category: d.category,
        description: d.description || "",
        price: Number(d.price),
        dietary_flags: d.dietary_flags || "",
        file: d.file || "",
      };

      const docRef = await Dishes.add(payload);
      created.push({ id: docRef.id, ...payload });
    }

    return res.status(201).send({
      success: true,
      count: created.length,
      dishes: created,
      message: "Bulk dishes created successfully",
    });
  } catch (err) {
    console.error("Bulk dishes error:", err);
    return res.status(500).send({
      success: false,
      message: "Error creating dishes in bulk.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// UPDATE DISH
// ------------------------------------------------------
// supports optional new image upload
routes.put("/update/:dish_id", upload.single("file"), async (req, res) => {
  try {
    const id = req.params.dish_id;

    const { name, description, price, dietary_flags, category } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price != null) updateData.price = Number(price);
    if (dietary_flags) updateData.dietary_flags = dietary_flags;

    if (req.file) {
      updateData.file = req.file.filename;
    } else if (req.body.file) {
      updateData.file = req.body.file;
    }

    await Dishes.doc(id).update(updateData);

    return res.status(200).send({
      success: true,
      message: "Dish updated successfully",
    });
  } catch (err) {
    console.error("Update dish error:", err);
    return res.status(500).send({
      success: false,
      message: "Error updating dish.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// DELETE DISH
// ------------------------------------------------------
routes.delete("/delete/:dish_id", async (req, res) => {
  try {
    const id = req.params.dish_id;

    await Dishes.doc(id).delete();

    return res.status(200).send({
      success: true,
      message: "Dish deleted successfully",
    });
  } catch (err) {
    console.error("Delete dish error:", err);
    return res.status(500).send({
      success: false,
      message: "Error deleting dish.",
      error: err.message,
    });
  }
});

module.exports = routes;