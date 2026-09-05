import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { api } from "../api";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = mode === "login"
        ? await api.login(email, password)
        : await api.register(email, password);

      localStorage.setItem("pb_token", data.token);
      localStorage.setItem("pb_email", data.user.email);
      onAuth(data.token, data.user.email);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", width: 380, height: 380, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,140,255,0.18), transparent 70%)",
        filter: "blur(60px)", top: "10%", left: "12%", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(78,225,160,0.14), transparent 70%)",
        filter: "blur(60px)", bottom: "8%", right: "14%", pointerEvents: "none"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: 360, position: "relative", zIndex: 1 }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}><Logo /></div>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          padding: 32, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.35)"
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 12 : -12 }}
              transition={{ duration: 0.25 }}
            >
              <h1 style={{ fontFamily: "Space Grotesk", fontWeight: 600, fontSize: 20, marginBottom: 6 }}>
                {mode === "login" ? "Welcome back" : "Create an account"}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
                {mode === "login" ? "Log in to see your captured conversations." : "Takes a few seconds, no email verification needed."}
              </p>
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ color: "#F09595", fontSize: 13 }}
                  >{error}</motion.div>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "var(--green)", color: "#052B1D", fontWeight: 600, fontSize: 14,
                    padding: 12, borderRadius: 9, marginTop: 6, opacity: loading ? 0.6 : 1,
                    boxShadow: "0 8px 24px rgba(78,225,160,0.3)"
                  }}
                >
                  {loading ? "Please wait..." : (mode === "login" ? "Log in" : "Create account")}
                </motion.button>
              </form>
            </motion.div>
          </AnimatePresence>
          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--text-muted)" }}>
            {mode === "login" ? "Don't have an account? " : "Already have one? "}
            <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{ color: "var(--violet)" }}>
              {mode === "login" ? "Register" : "Log in"}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}