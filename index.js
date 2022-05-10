const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()



const app = express()


// midleware 

app.use(cors());
app.use(express.json())

function verifyJWt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ messege: "unothorized" })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ messege: 'forbiden acces' })
        }
        console.log('decpde', decoded)
        res.decoded = decoded;
    })

    next()
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iyaea.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    console.log(uri)
    try {
        await client.connect();
        const serviceCollection = client.db('warehouse').collection('service')
        const orderCollection = client.db('warehouse').collection('order')

        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        // delete api 

        app.delete('/manage-inventory/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query)
            res.send(result)
        })

        // post api 

        app.post('/add-item', async (req, res) => {
            const newInventory = req.body;
            const result = await serviceCollection.insertOne(newInventory)
            res.send(result)
        })


        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const Updatedquantity = parseInt(req.body.quantity);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: Updatedquantity
                }
            }
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        // deleiverd 
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;

            const Updatedquantity = parseInt(req.body.quantity);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: Updatedquantity
                }
            }
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            res.send(result);

        })

        //order 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        // order api 

        app.get('/order', verifyJWt, async (req, res) => {
            const decodedEmail = req.decoded.email;

            if (email === decodedEmail) {
                const email = req.query.email;
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray();
                res.send(result)
            } else {
                res.status(403).send({ message: 'forbiden' })
            }
        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        // auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const acesstoken = jwt.sign(user, process.env.ACESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ acesstoken })
        })


    }

    finally {

    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('connected with node js')
})


app.listen(port, () => {
    console.log('listening the port 5000')
})