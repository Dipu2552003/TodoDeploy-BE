require("dotenv").config(); // Ensure this is at the top to load environment variables

const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 8000;
const app = express();

// MongoDB Connection URI
const uri = process.env.DATABASE_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Test MongoDB Connection
async function testMongoDBConnection() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  } finally {
    await client.close();
  }
}
testMongoDBConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection for Mongoose
mongoose.set("strictQuery", false);
mongoose
  .connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  })
  .then(() => {
    console.log("Database connected!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Database connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new todo
app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;
    const newTodo = await Todo.create({ title });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
