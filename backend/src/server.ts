import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { dbConnect } from './config/db';

const app = express();

const PORT = process.env.PORT || 5000;
app.get("/", (_, res) => {
      res.send("I am working fine")
})

app.listen(PORT, async() => {
    await dbConnect();
    console.log(`Server is running at port ${PORT}`)
})