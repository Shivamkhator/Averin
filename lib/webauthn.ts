export const rpName = "Averin"
export const rpID =
  process.env.NODE_ENV === "production"
    ? "averin.vercel.app"
    : "localhost"

export const origin =
  process.env.NODE_ENV === "production"
    ? "https://averin.vercel.app"
    : "http://localhost:3000"
