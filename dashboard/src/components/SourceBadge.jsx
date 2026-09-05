import { MessageSquareText, Sparkles } from "lucide-react";

export default function SourceBadge({ source }) {
  const isClaude = source === "claude";
  const Icon = isClaude ? Sparkles : MessageSquareText;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontFamily: "JetBrains Mono",
      padding: "4px 10px",
      borderRadius: 20,
      background: isClaude ? "rgba(217,119,87,0.15)" : "rgba(16,163,127,0.15)",
      color: isClaude ? "#E29B7F" : "#4FD9AE"
    }}>
      <Icon size={11} strokeWidth={2.2} />
      {source}
    </span>
  );
}