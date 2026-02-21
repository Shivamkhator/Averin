export const rpName = "Averin";
export const rpID =
  process.env.NODE_ENV === "production" ? "askaverin.vercel.app" : "localhost";

export const origin =
  process.env.NODE_ENV === "production"
    ? "https://askaverin.vercel.app"
    : "http://localhost:3000";
