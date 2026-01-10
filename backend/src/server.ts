import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { dbConnect } from './config/db';
import authRoutes from './routes/auth.routes'
import problemRoutes from './routes/problem.routes'
import submissionRoutes from './routes/submission.routes'
import userRoutes from './routes/user.routes'
import adminRoutes from './routes/admin.routes'
import leaderboardRoutes from './routes/leaderboard.routes'
import './workers/submit.worker';// Start the submit worker
import './workers/run.worker'; // Start the run worker


const app = express();

const PORT = process.env.PORT || 5000;

console.log("PORT:", PORT);

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
    console.log("hi")
    res.send("Server is working fine")
})

app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`Server is running at port ${PORT}`)
})