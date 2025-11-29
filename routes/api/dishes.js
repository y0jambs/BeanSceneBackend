const express = require("express");
const { Dishes } = require("../../config"); // <- remove db
const routes = express.Router();

// GET /api/dishes
routes.get("/", async (req, res) => {
  try {
    const snapshot = await Dishes.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(list);
  } catch (err) {
    console.error("Error fetching dishes:", err);
    res.status(500).send({
      success: false,
      message: "Error fetching dishes",
      error: err.message,
    });
  }
});

// POST /api/dishes/create
routes.post("/create", async (req, res) => {
  try {
    const data = req.body;
    const docRef = await Dishes.add(data);

    res.status(201).send({
      success: true,
      id: docRef.id,
      msg: "Dish added successfully.",
    });
  } catch (err) {
    console.error("Error creating dish:", err);
    res.status(500).send({
      success: false,
      message: "Error creating dish",
      error: err.message,
    });
  }
});

// POST /api/dishes/bulk
routes.post("/bulk", async (req, res) => {
  try {
    const dishes = req.body; // expects an array

    if (!Array.isArray(dishes)) {
      return res.status(400).send({
        success: false,
        message: "Expected an array of dishes",
      });
    }

    const createdIds = [];

    for (const dish of dishes) {
      const docRef = await Dishes.add(dish);
      createdIds.push(docRef.id);
    }

    res.status(201).send({
      success: true,
      count: createdIds.length,
      ids: createdIds,
      message: "Dishes added successfully",
    });
  } catch (err) {
    console.error("Bulk insert error:", err);
    res.status(500).send({
      success: false,
      message: "Error adding bulk dishes",
      error: err.message,
    });
  }
});


// PUT /api/dishes/update/:dish_id
routes.put("/update/:dish_id", async (req, res) => {
  try {
    const id = req.params.dish_id;
    delete req.body.id;

    await Dishes.doc(id).update(req.body);

    res.status(200).send({
      success: true,
      msg: "Dish updated successfully.",
    });
  } catch (err) {
    console.error("Error updating dish:", err);
    res.status(500).send({
      success: false,
      message: "Error updating dish",
      error: err.message,
    });
  }
});

// DELETE /api/dishes/delete/:dish_id
routes.delete("/delete/:dish_id", async (req, res) => {
  try {
    const id = req.params.dish_id;
    await Dishes.doc(id).delete();

    res.status(200).send({
      success: true,
      msg: "Dish deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting dish:", err);
    res.status(500).send({
      success: false,
      message: "Error deleting dish",
      error: err.message,
    });
  }
});

module.exports = routes;
