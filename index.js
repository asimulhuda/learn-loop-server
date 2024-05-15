const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 9000;

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://learn-loop-1fe5d.web.app",
    "https://learn-loop-1fe5d.firebaseapp.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@practice.acya2n0.mongodb.net/?retryWrites=true&w=majority&appName=Practice`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const assignmentsCollection = client
      .db("learnLoop")
      .collection("assignments");
    const submitsCollection = client.db("learnLoop").collection("submits");

    // Get all assignments data from db

    app.get("/assignments", async (req, res) => {
      const result = await assignmentsCollection.find().toArray();
      res.send(result);
    });

    // Get a single assignments data from db using assignment id

    app.get("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.findOne(query);
      res.send(result);
    });

    // Save submit data in bd

    app.post("/submit", async (req, res) => {
      const submitData = req.body;
      const result = await submitsCollection.insertOne(submitData);
      res.send(result);
    });

    // Save assignment data in bd

    app.post("/assignment", async (req, res) => {
      const assignmentData = req.body;
      const result = await assignmentsCollection.insertOne(assignmentData);
      res.send(result);
    });

    // Get all posted assignments used by specific user

    app.get("/assignments/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user_email: email };
      const result = await assignmentsCollection.find(query).toArray();
      res.send(result);
    });

    // Delete a Assignment data

    app.delete("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentsCollection.deleteOne(query);
      res.send(result);
    });

    // Update assignment in db

    app.put("/assignment/:id", async (req, res) => {
      const id = req.params;
      const assignmentData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...assignmentData,
        },
      };
      const result = await assignmentsCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Get all submission used by specific user from db

    app.get("/my-submissions/:email", async (req, res) => {
      const email = req.params.email;
      const query = { studentEmail: email };
      const result = await submitsCollection.find(query).toArray();
      res.send(result);
    });

    // Get all pending assignment used by specific user from db

    app.get("/pending-assignments/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await submitsCollection.find(query).toArray();
      res.send(result);
    });

    // Update assignment pending status in db

    // app.put("/pending-assignments/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const assignmentData = req.body;
    //   const query = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       ...assignmentData,
    //     },
    //   };
    //   const result = await submitsCollection.updateOne(
    //     query,
    //     updateDoc,
    //     options
    //   );
    //   res.send(result);
    // });

    app.put("/pending-assignments/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const assignmentData = req.body;
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: { ...assignmentData },
        };

        const result = await submitsCollection.updateOne(query, updateDoc);

        res.send(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Learn Loop......");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
