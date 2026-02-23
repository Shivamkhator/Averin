export const rpName = "Ojas";
export const rpID =
  process.env.NODE_ENV === "production" ? "askojas.vercel.app" : "localhost";

export const origin =
  process.env.NODE_ENV === "production"
    ? "https://askojas.vercel.app"
    : "http://localhost:3000";
