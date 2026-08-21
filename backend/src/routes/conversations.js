import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

conversationsRouter.post("/", async (req, res) => {
  const { source, title, messages } = req.body;

  if (!source || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "need source and a non-empty messages array" });
  }

  try {
    const { rows } = await query(
      `INSERT INTO conversations (user_id, source, title, raw_messages, message_count)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, source, title, message_count, captured_at`,
      [req.userId, source, title || null, JSON.stringify(messages), messages.length]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "couldn't save that conversation" });
  }
});

conversationsRouter.get("/", async (req, res) => {
  const { rows } = await query(
    `SELECT id, source, title, message_count, captured_at
     FROM conversations
     WHERE user_id = $1
     ORDER BY captured_at DESC
     LIMIT 50`,
    [req.userId]
  );
  res.json(rows);
});

conversationsRouter.get("/:id", async (req, res) => {
  const convo = await query(
    "SELECT * FROM conversations WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );

  if (convo.rows.length === 0) {
    return res.status(404).json({ error: "not found" });
  }

  const summary = await query(
    "SELECT * FROM summaries WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1",
    [req.params.id]
  );

  res.json({ ...convo.rows[0], latest_summary: summary.rows[0] || null });
});
