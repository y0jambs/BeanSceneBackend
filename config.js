const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD5bv4TBolM7VttC7jUMaaaCNGJFiSqk6U",
  authDomain: "beansceneapp-79960.firebaseapp.com",
  projectId: "beansceneapp-79960",
  storageBucket: "beansceneapp-79960.firebasestorage.app",
  messagingSenderId: "159332291152",
  appId: "1:159332291152:web:4eba2af020b0f49496b755",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const User = db.collection("users");
const Category = db.collection("categories");
const Dishes = db.collection("dishes");
const Orders = db.collection("orders");

module.exports = { User, Category, Dishes, Orders };
