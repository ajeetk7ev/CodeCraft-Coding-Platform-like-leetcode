import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_URL || "http://168.231.120.37:2358";

async function testJudge0() {
    console.log(`Testing Judge0 at: ${JUDGE0_API_URL}`);
    try {
        const response = await axios.get(`${JUDGE0_API_URL}/about`);
        console.log("Connection successful!");
        console.log("Response:", response.data);
    } catch (error: any) {
        console.error("Connection failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testJudge0();
