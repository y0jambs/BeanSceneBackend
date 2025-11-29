// routes/api/categories.js

const express = require("express");
const { Category } = require("../../config");
const routes = express.Router();

// ------------------------------------------------------
// GET ALL CATEGORIES
// ------------------------------------------------------
routes.get("/", async (req, res) => {
  try {
    const result = await Category.get();
    const list = result.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).send(list);
  } catch (err) {
    console.error("Get categories error:", err);
    return res.status(500).send({
      success: false,
      message: "Error fetching categories.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// CREATE SINGLE CATEGORY
// ------------------------------------------------------
routes.post("/create", async (req, res) => {
  try {
    const { category } = req.body;

    if (!category || typeof category !== "string") {
      return res.status(400).send({
        success: false,
        message: "Field 'category' is required.",
      });
    }

    const payload = { category };
    const docRef = await Category.add(payload);

    return res.status(201).send({
      success: true,
      id: docRef.id,
      data: payload,
      message: "Category added successfully.",
    });
  } catch (err) {
    console.error("Create category error:", err);
    return res.status(500).send({
      success: false,
      message: "Error adding category.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// BULK CREATE CATEGORIES
// ------------------------------------------------------
// POST /api/category/bulk
// Body example:
// {
//   "categories": [
//     { "category": "entrees" },
//     { "category": "mains" },
//     { "category": "desserts" },
//     { "category": "drinks" },
//     { "category": "sides" },
//     { "category": "specials" }
//   ]
// }
routes.post("/bulk", async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Body must contain a non-empty 'categories' array.",
      });
    }

    const created = [];

    for (const c of categories) {
      if (!c || !c.category || typeof c.category !== "string") {
        // skip invalid entries
        continue;
      }

      const payload = { category: c.category };
      const docRef = await Category.add(payload);
      created.push({ id: docRef.id, ...payload });
    }

    return res.status(201).send({
      success: true,
      count: created.length,
      categories: created,
      message: "Bulk categories created successfully.",
    });
  } catch (err) {
    console.error("Bulk categories error:", err);
    return res.status(500).send({
      success: false,
      message: "Error creating categories in bulk.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// UPDATE CATEGORY
// ------------------------------------------------------
routes.put("/update/:category_id", async (req, res) => {
  try {
    const id = req.params.category_id;
    const { category } = req.body;

    if (!category || typeof category !== "string") {
      return res.status(400).send({
        success: false,
        message: "Field 'category' is required.",
      });
    }

    await Category.doc(id).update({ category });

    return res.status(200).send({
      success: true,
      message: "Category updated successfully.",
    });
  } catch (err) {
    console.error("Update category error:", err);
    return res.status(500).send({
      success: false,
      message: "Error updating category.",
      error: err.message,
    });
  }
});

// ------------------------------------------------------
// DELETE CATEGORY
// ------------------------------------------------------
routes.delete("/delete/:category_id", async (req, res) => {
  try {
    const id = req.params.category_id;
    await Category.doc(id).delete();

    return res.status(200).send({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).send({
      success: false,
      message: "Error deleting category.",
      error: err.message,
    });
  }
});

module.exports = routes;
