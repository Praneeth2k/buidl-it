import express from "express";
import Cors from "cors";
import morgan from "morgan"
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron"
import updateData from "./updateData.js";
import path from "path"

import postRoutes from "./routes/postRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express();

dotenv.config({path: './config.env'})

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
)
const port = process.env.PORT || 8001;


app.use(express.json())
app.use(Cors())

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('DB connection successful!'))


app.use('/post', postRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res) => res.status(200).send('Is maths related to science?!!'))

app.use(express.static(path.join(__dirname, "client", "build")))

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", index.html))
})

app.listen(port, ()=>console.log(`listening on localhost: ${port}`))


cron.schedule('* * * * *', () => {
    console.log('running a task every minute')
    updateData();
})