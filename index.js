const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()
require('dotenv').config()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const uploadImage = require("./src/utils/uploadImage");

const port = process.env.PORT || 5000

//middlewares
app.use(express.json({ limit: "25mb" }))
// app.use(express.urlencoded({ limit: "25mb" }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

//all routes
const authRoutes = require('./src/users/user.route')
const productRoutes = require('./src/products/products.route')

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

main().then(() => console.log("Mongodb successfully connected")).catch(err => console.log(err));

// mongo - pass : admin123
// username : admin

async function main() {
    await mongoose.connect(process.env.DB_URL);

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
}


// upload image routes
app.post("/uploadImage", (req, res) => {
    uploadImage(req.body.image)
        .then((url) => res.send(url))
        .catch((err) => res.status(500).send(err));
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})