import { Request, Response } from "express";
import { logger } from "../utils/logger";
import { catchAsync } from "../utils/catchAsync";
import { OpenRouter } from "@openrouter/sdk";
import dotenv from "dotenv";

dotenv.config();

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export const chatWithArena = catchAsync(async (req: Request, res: Response) => {
  const { messages, problemContext, userCode, language } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      message: "Messages are required and must be an array.",
    });
  }

  const systemMessage = {
    role: "system",
    content: `You are Arena, a helpful AI coding assistant on CodeCraft. 
      Your goal is to help users solve coding problems by providing hints, identifying bugs, and explaining logic. 
      Do not give the full solution immediately unless asked. 
      Encourage the user to think through the problem.
      
      Problem Context:
      Title: ${problemContext?.title || "Unknown"}
      Description: ${problemContext?.description || "Not provided"}
      Difficulty: ${problemContext?.difficulty || "Not provided"}
      Tags: ${problemContext?.tags?.join(", ") || "None"}

      User's Current Code (${language || "unknown"}):
      \`\`\`${language || "text"}
      ${userCode || "// No code written yet"}
      \`\`\`
      `,
  };

  const fullMessages = [systemMessage, ...messages];

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await openrouter.chat.send({
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages: fullMessages,
    stream: true,
  });

  try {
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (streamError: any) {
    logger.error("Error during streaming:", streamError);
    res.write(
      `data: ${JSON.stringify({ error: "Stream error: " + streamError.message })}\n\n`,
    );
  }

  res.write("data: [DONE]\n\n");
  res.end();
});
