const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = 5000;

app.use(cors());
app.use(express.json());

// json web token create
function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

// json web token verifyToken
function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorization");
  }
  req.user = verify.email;
  next();
}

const uri = `mongodb+srv://sanaullahsaber:DjiTyINUY9IqVZzG@cluster0.l1excwt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsInsecure: true, // Use with caution. Use for testing if needed.
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});;

async function run() {
  try {
    await client.connect();
    const ecoMartUserDB = client.db("ecoMartUserDB");
    const ecoMartUserCollection = ecoMartUserDB.collection(
      "ecoMartUserCollection"
    );
    const ecoMartProductDB = client.db("ecoMartProductDB");
    const ecoMartProductCollection = ecoMartProductDB.collection(
      "ecoMartProductCollection"
    );

    //? product
    // add products form dashboard add Product page;
    app.post("/grocers", verifyToken, async (req, res) => {
      const grocersData = req.body;
      const result = await ecoMartProductCollection.insertOne(grocersData);
      res.send(result);
    });

    // product get for all data page
    app.get("/grocers", async (req, res) => {
      const grocersData = ecoMartProductCollection.find();
      const result = await grocersData.toArray();
      res.send(result);
    });

    // product get for all product page
    app.get("/grocers/:email", async (req, res) => {
      const email = req.params.email;
      const grocers = ecoMartProductCollection.find({ email });
      const result = await grocers.toArray();
      res.send(result);
    });

    // product get for my product page show single product
    app.get("/grocers/get/:id", async (req, res) => {
      const id = req.params.id;
      const grocersData = await ecoMartProductCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(grocersData);
      console.log(grocersData);
    });

    // product patch for my product page show single product edit
    app.patch("/grocers/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await ecoMartProductCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    // product delete for all data page show single product delete
    app.delete("/grocers/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await ecoMartProductCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    /* ===============================================================*/

    //?user
    // save user information when google login
    app.post("/user", async (req, res) => {
      const user = req.body;
      const token = createToken(user);
      const isUserExist = await ecoMartUserCollection.findOne({
        email: user?.email,
      });
      if (isUserExist?._id) {
        return res.send({
          status: "success",
          message: "login success",
          token,
        });
      }
      await ecoMartUserCollection.insertOne(user);
      res.send(token);
    });

    // user get from with id and show this dashboard profile management for edit user profile
    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      const result = await ecoMartUserCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // user get from with email and show this dashboard profile management page for user profile
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ecoMartUserCollection.findOne({ email });
      res.send(result);
    });

    // user update with email and show this dashboard profile management page for user profile
    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const userData = req.body;
      const result = await ecoMartUserCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });

    console.log("Database is connected");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Route is working");
});

app.listen(port, (req, res) => {
  console.log("App is listening on port :", port);
});
