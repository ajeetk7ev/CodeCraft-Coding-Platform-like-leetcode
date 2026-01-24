import axios from "axios";
import { logger } from "./logger";
import dotenv from "dotenv";
dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_URL || "http://168.231.120.37:2358";

async function testJudge0() {
  logger.info(`Testing Judge0 at: ${JUDGE0_API_URL}`);
  try {
    const response = await axios.get(`${JUDGE0_API_URL}/about`);
    logger.info("Connection successful!");
    logger.info(`Response: ${JSON.stringify(response.data)}`);
  } catch (error: any) {
    logger.error("Connection failed!");
    if (error.response) {
      logger.error(`Status: ${error.response.status}`);
      logger.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else {
      logger.error(`Error: ${error.message}`);
    }
  }
}

testJudge0();
