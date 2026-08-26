export default function SourceBadge({ source }) {
  const isClaude = source === "claude";
  return (
    <span style={{
      fontSize: 11, fontFamily: "JetBrains Mono", padding: "3px 9px", borderRadius: 20,
      background: isClaude ? "rgba(217,119,87,0.15)" : "rgba(16,163,127,0.15)",
      color: isClaude ? "#E29B7F" : "#4FD9AE"
    }}>{source}</span>
  );
}