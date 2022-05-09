const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()



const app = express()


// midleware 

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iyaea.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    console.log(uri)
    try {
        await client.connect();
        const serviceCollection = client.db('warehouse').collection('service')

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