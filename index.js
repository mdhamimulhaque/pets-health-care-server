const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewsCollection = client.db("petsHealthCare").collection("reviews");
        const blogsCollection = client.db("petsHealthCare").collection("blogs");
        const faqCollection = client.db("petsHealthCare").collection("faq");

        // ---> jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            var token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '1d' });
            res.send({ token })
        })

        // ---> jsn token verify
        const verifyToken = (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            const token = authHeader.split(' ')[1];
            // ---.(token verify)
            jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next()
            })

        }

        //---> services 
        app.get('/services', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const query = {};
            const service3 = await servicesCollection.find(query).limit(limit).toArray();
            const services = await servicesCollection.find(query).toArray();
            res.send({ services, service3 })
        })
        //---> blogs 
        app.get('/blogs', async (req, res) => {
            const query = {};
            const blogs = await blogsCollection.find(query).toArray();
            res.send(blogs)
        })
        //---> faq 
        app.get('/faq', async (req, res) => {
            const query = {};
            const faq = await faqCollection.find(query).toArray();
            res.send(faq)
        })

        // ---> create || add services
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result)
        })

        // single-services
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })

        // ---> post || create review
        app.post('/review', async (req, res) => {
            const reviewItem = req.body;
            const result = await reviewsCollection.insertOne(reviewItem);
            res.send(result)
        })

        // ---> read || show service based review
        app.get('/reviews/:title', async (req, res) => {
            const title = req.params.title;
            const query = { serviceTitle: title };
            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result.reverse())
        })

        // ---> my reviews
        app.get('/my-reviews', verifyToken, async (req, res) => {
            const decoded = req.decoded;
            const email = req.query.email;
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {};

            if (email) {
                query = {
                    userEmail: email
                }
            }

            const cursor = reviewsCollection.find(query);
            const result = await cursor.toArray()
            res.send(result.reverse())
        })

        //---> read single review
        app.get('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.findOne(query);
            res.send(result)
        })

        // ---> update review
        app.put(`/my-reviews/:id`, async (req, res) => {
            const id = req.params.id;
            const reviewItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateReview = {
                $set: {
                    review: reviewItem.review,
                    serviceImg: reviewItem.serviceImg,
                    userName: reviewItem.userName,
                    photoURL: reviewItem.photoURL,
                    serviceTitle: reviewItem.serviceTitle,
                    userEmail: reviewItem.userEmail
                },
            };

            const result = await reviewsCollection.updateOne(filter, updateReview, options);
            res.send(result)
        })



        // ---> delete review
        app.delete('/my-reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result)
        })



    } finally { }
}
run().catch(err => console.log(err))







app.listen(port, () => {
    console.log(`Server is running from port ${port}`)
})