export function logToolUsage(toolName: string) {
  if (typeof window === "undefined") return;
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolName })
  }).catch((err) => console.error("Failed to log tool usage:", err));
}
