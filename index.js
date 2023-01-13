const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId=require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ibdox.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('camera_site');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users');

     // GET API
     app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
  });

 //order from user
    app.get('/order', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      console.log(query);
      const cursor = ordersCollection.find(query);
      const userorder = await cursor.toArray();
      res.json(userorder);
    });

    app.post('/order', async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      console.log(result);
      res.json(result);
    });

    //delete api
app.delete('/order/:id', async (req, res)=>{
  const id=req.params.id;
  const query= {_id: ObjectId(id) }
  const result=await ordersCollection.deleteOne(query);
  console.log("deleting id", result);
  res.json(result)
}) 

    //user data from client site
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
  });
    //user data by google sign in
  app.put('/users', async (req, res) => {
    const user = req.body;
    console.log(user)
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
});

//make admin
app.put('/users/admin',  async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
  })

  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
})


}
finally {
// await client.close();
}
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello customers!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
