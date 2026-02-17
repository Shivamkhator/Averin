export const rpName = "Averin"
export const rpID =
  process.env.NODE_ENV === "production"
    ? "averin-skybee.vercel.app"
    : "localhost"

export const origin =
  process.env.NODE_ENV === "production"
    ? "https://averin-skybee.vercel.app"
    : "http://localhost:3000"
