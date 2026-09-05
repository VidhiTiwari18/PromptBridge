import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, Layers, Sparkles as SparklesIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Logo from "../components/Logo";
import SourceBadge from "../components/SourceBadge";
import ConversationRow from "../components/ConversationRow";
import { api } from "../api";

export default function Dashboard({ email, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setLoading(true);
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function selectConvo(id) {
    setSelectedId(id);
    setDetail(null);
    try {
      const data = await api.getConversation(id);
      setDetail(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSummarize() {
    if (!selectedId) return;
    setSummarizing(true);
    try {
      const summary = await api.summarize(selectedId);
      setDetail((prev) => ({ ...prev, latest_summary: summary }));
    } catch (err) {
      console.error(err);
    }
    setSummarizing(false);
  }

  const platformCount = new Set(conversations.map((c) => c.source)).size;
  const summarizedCount = conversations.filter((c) => c.has_summary).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 32px", borderBottom: "1px solid var(--border)"
        }}
      >
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{email}</span>
          <button onClick={onLogout} style={{
            background: "transparent", border: "1px solid var(--border-strong)", color: "var(--text)",
            padding: "8px 14px", borderRadius: 8, fontSize: 13
          }}>Log out</button>
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{
          maxWidth: 1160, margin: "0 auto", width: "100%",
          display: "flex", gap: 12, padding: "20px 32px 0"
        }}
      >
        <StatPill icon={<Layers size={14} />} label="Conversations" value={conversations.length} />
        <StatPill icon={<MessagesSquare size={14} />} label="Platforms" value={platformCount} />
        <StatPill icon={<SparklesIcon size={14} />} label="Summarized" value={summarizedCount} />
      </motion.div>

      <div style={{ display: "flex", flex: 1, maxWidth: 1160, margin: "0 auto", width: "100%" }}>
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ width: 340, borderRight: "1px solid var(--border)", padding: 24 }}
        >
          <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Conversations
          </div>
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>}
          {!loading && conversations.length === 0 && (
            <div style={{
              color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6,
              background: "var(--surface)", border: "1px dashed var(--border-strong)",
              borderRadius: 12, padding: 18
            }}>
              Nothing captured yet. Open Claude or ChatGPT, click the PromptBridge extension icon, and capture a conversation.
            </div>
          )}
          {conversations.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            >
              <ConversationRow convo={c} active={selectedId === c.id} onClick={() => selectConvo(c.id)} />
            </motion.div>
          ))}
        </motion.div>

        <div style={{ flex: 1, padding: 32 }}>
          {!selectedId && (
            <div style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 80, textAlign: "center" }}>
              Select a conversation to view its details.
            </div>
          )}
          {selectedId && !detail && (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          )}
          <AnimatePresence mode="wait">
          {detail && (
            <motion.div
              key={detail.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 22, marginBottom: 8 }}>
                    {detail.title || "Untitled conversation"}
                  </h2>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <SourceBadge source={detail.source} />
                    <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "JetBrains Mono" }}>
                      {detail.message_count} messages
                    </span>
                  </div>
                </div>
                {!detail.latest_summary && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSummarize}
                    disabled={summarizing}
                    animate={summarizing ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                    transition={summarizing ? { repeat: Infinity, duration: 1.1 } : {}}
                    style={{
                      background: "var(--green)", color: "#052B1D", fontWeight: 600, fontSize: 13,
                      padding: "10px 18px", borderRadius: 8,
                      boxShadow: "0 4px 16px rgba(78,225,160,0.25)"
                    }}
                  >{summarizing ? "Summarizing..." : "Summarize"}</motion.button>
                )}
              </div>

              <AnimatePresence>
              {detail.latest_summary && (
                <motion.div
                  className="summary-markdown"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14,
                    padding: 20, marginBottom: 24, fontSize: 13.5, lineHeight: 1.7, overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                  }}
                >
                  <ReactMarkdown>{detail.latest_summary.summary_text}</ReactMarkdown>
                </motion.div>
              )}
              </AnimatePresence>

              <div style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 14, marginBottom: 14, color: "var(--text-muted)" }}>
                Raw messages
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {detail.raw_messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    style={{
                      display: "flex", gap: 12,
                      background: m.role === "user" ? "var(--surface-2)" : "var(--surface)",
                      borderLeft: `3px solid ${m.role === "user" ? "var(--violet)" : "var(--green)"}`,
                      borderRadius: 10, padding: "16px 18px", fontSize: 13.5, lineHeight: 1.7
                    }}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: m.role === "user" ? "rgba(124,140,255,0.15)" : "rgba(78,225,160,0.15)",
                      color: m.role === "user" ? "var(--violet)" : "var(--green)",
                      fontSize: 11, fontFamily: "Space Grotesk", fontWeight: 700
                    }}>
                      {m.role === "user" ? "U" : "A"}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "JetBrains Mono", marginBottom: 4, textTransform: "uppercase" }}>
                        {m.role}
                      </div>
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px"
    }}>
      <span style={{ color: "var(--violet)" }}>{icon}</span>
      <span style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 15 }}>{value}</span>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}