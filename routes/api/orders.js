const express = require("express");
const { Orders } = require("../../config"); // uses your Firestore collection
const routes = express.Router();

// POST /api/orders/create
routes.post("/create", async (req, res) => {
  try {
    // now accept tableRef + area as well
    const { order, customerName, orderDateTime, tableRef, area } = req.body;

    // basic validation
    if (!order || !customerName || !orderDateTime || !tableRef) {
      return res.status(400).send({
        success: false,
        message:
          "order, customerName, orderDateTime and tableRef are required",
      });
    }

    // create Firestore document
    const docRef = await Orders.add({
      order,           // JSON string of order items
      customerName,    // from AsyncStorage in the app
      orderDateTime,   // ISO string
      tableRef,        // e.g. "M3", "O5", "B2"
      area,            // "Main" / "Outside" / "Balcony"
      status: "inprogress",
      createdAt: new Date().toISOString(),
    });

    res.status(201).send({
      success: true,
      id: docRef.id,
      message: "Order created",
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send({
      success: false,
      message: "Error creating order",
      error: err.message,
    });
  }
});

// GET /api/orders
routes.get("/", async (req, res) => {
  try {
    const snapshot = await Orders.get();
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(list);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error fetching orders",
    });
  }
});

// PUT /api/orders/update/:order_id
routes.put("/update/:order_id", async (req, res) => {
  try {
    const id = req.params.order_id;
    delete req.body.id; // avoid overwriting ID field

    await Orders.doc(id).update(req.body);

    res.status(200).send({
      success: true,
      message: "Order updated",
    });
  } catch (err) {
    res.status(404).send({
      success: false,
      message: "Order not found",
    });
  }
});

// DELETE /api/orders/delete/:order_id
routes.delete("/delete/:order_id", async (req, res) => {
  try {
    const id = req.params.order_id;
    await Orders.doc(id).delete();

    res.status(200).send({
      success: true,
      message: "Order deleted",
    });
  } catch (err) {
    res.status(404).send({
      success: false,
      message: "Order not found",
    });
  }
});

module.exports = routes;
