export function extractKeywordSignals(readme: string): string[] {
  const text = readme.toLowerCase();
  const signals = new Set<string>();

  if (text.includes("next.js")) signals.add("Next.js");
  if (text.includes("react")) signals.add("React");
  if (text.includes("typescript")) signals.add("TypeScript");
  if (text.includes("cli")) signals.add("CLI");
  if (text.includes("agent")) signals.add("Agent");
  if (text.includes("dashboard")) signals.add("dashboard");
  if (text.includes("api")) signals.add("API");

  return Array.from(signals);
}
