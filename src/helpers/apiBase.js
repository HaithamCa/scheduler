const DEFAULT_DEV_API = "http://localhost:8003";

export default function apiBase() {
  const configured = process.env.REACT_APP_API_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return DEFAULT_DEV_API;
}
