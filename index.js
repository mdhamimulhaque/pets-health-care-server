const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// ---> middle wares
app.use(cors());
app.use(express.json());


// ---> app testing
app.get('/', (req, res) => {
    res.send("pets care server running...")
})


// ---> mongodb setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.76zc9vk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        // ---> collections
        const servicesCollection = client.db("petsHealthCare").collection("services");

        //--->home page services 
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const query = {};
            const result3 = await servicesCollection.find(query).limit(limit).toArray();
            const result = await servicesCollection.find(query).toArray();
            res.send({ result, result3 })
        })

    } finally { }
}
run().catch(err => console.log(err))







app.listen(port, () => {
    console.log(`Server is running from port ${port}`)
})