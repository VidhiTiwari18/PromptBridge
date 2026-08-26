export default function Logo() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 16
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        background: "linear-gradient(135deg,#7C8CFF,#4EE1A0)",
        display: "inline-block"
      }}></span>
      PromptBridge
    </div>
  );
}