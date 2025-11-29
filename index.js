const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const auth_routes = require("./routes/api/auth");
const users_routes = require("./routes/api/users");
const category_routes = require("./routes/api/categories");
const dishes_routes = require("./routes/api/dishes");
const orders_routes = require("./routes/api/orders");

app.use("/api/auth", auth_routes);
app.use("/api/users", users_routes);               
app.use("/api/category", category_routes);
app.use("/api/dishes", dishes_routes);
app.use("/api/orders", orders_routes);

app.use("/static", express.static("images"));

app.listen(process.env.PORT || 5000);
