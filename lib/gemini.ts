// lib/gemini.ts
import "server-only"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const getDefaultModel = () =>
  genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  })
