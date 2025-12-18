import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { dbConnect } from './config/db';
import authRoutes from './routes/auth.routes'
import problemRoutes from './routes/problem.routes'
import submissionRoutes from './routes/submission.routes'
import { runWorker } from './workers/run.worker';
import { submitWorker } from './workers/submit.worker';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.get("/", (_, res) => {
      res.send("I am working fine")
})

app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/submissions", submissionRoutes)

app.listen(PORT, async() => {
    await dbConnect();
    console.log(`Server is running at port ${PORT}`)
    console.log('Workers initialized')
})