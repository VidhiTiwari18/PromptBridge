import { motion } from "framer-motion";
import SourceBadge from "./SourceBadge";

export default function ConversationRow({ convo, active, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2, borderColor: "var(--border-strong)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: "14px 16px", borderRadius: 10, cursor: "pointer", marginBottom: 6,
        background: active ? "var(--surface-2)" : "transparent",
        border: active ? "1px solid var(--border-strong)" : "1px solid transparent",
      }}
    >      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{convo.title || "Untitled conversation"}</span>
        <SourceBadge source={convo.source} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "JetBrains Mono" }}>
        {convo.message_count} messages - {new Date(convo.captured_at).toLocaleDateString()}
      </div>
    </motion.div>
  );
}