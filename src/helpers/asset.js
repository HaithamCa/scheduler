export default function asset(path) {
  const base = process.env.PUBLIC_URL || "";
  const file = String(path).replace(/^\//, "");
  return `${base}/${file}`;
}
