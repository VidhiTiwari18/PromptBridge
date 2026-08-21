import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.js";
import { conversationsRouter } from "./routes/conversations.js";
import { summarizeRouter } from "./routes/summarize.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "5mb" }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/conversations", conversationsRouter);
app.use("/summarize", summarizeRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "something broke on our end" });
});

app.listen(PORT, () => {
  console.log(`server up on port ${PORT}`);
});
