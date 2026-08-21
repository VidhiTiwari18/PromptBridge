import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { summarizeConversation } from "../services/llm.js";

export const summarizeRouter = Router();
summarizeRouter.use(requireAuth);

summarizeRouter.post("/:conversationId", async (req, res) => {
  const { conversationId } = req.params;

  const convo = await query(
    "SELECT * FROM conversations WHERE id = $1 AND user_id = $2",
    [conversationId, req.userId]
  );

  if (convo.rows.length === 0) {
    return res.status(404).json({ error: "conversation not found" });
  }

  try {
    const summaryText = await summarizeConversation(
      convo.rows[0].raw_messages,
      convo.rows[0].source
    );

    const { rows } = await query(
      `INSERT INTO summaries (conversation_id, summary_text, token_estimate, model_used)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [conversationId, summaryText, Math.ceil(summaryText.length / 4), "claude-sonnet-4-6"]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "summarization failed" });
  }
});

summarizeRouter.post("/:summaryId/transfer", async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "target is required" });

  const { rows } = await query(
    "INSERT INTO transfers (summary_id, target) VALUES ($1, $2) RETURNING *",
    [req.params.summaryId, target]
  );
  res.status(201).json(rows[0]);
});
