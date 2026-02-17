import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchVault } from "@/lib/embeddings";
import { genAI } from "@/lib/gemini";
import { hashEmail } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { emailHash: hashEmail(session.user.email!) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { question, conversationHistory } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }

    if (conversationHistory && conversationHistory.length >= 10) {
      return NextResponse.json(
        {
          error: "Maximum conversation limit reached (5 questions)",
          limitReached: true,
        },
        { status: 400 },
      );
    }

    // Search for relevant data
    const results = await searchVault(user.id, question, 7);

    const context =
      results.length > 0
        ? results.map((r:{content: string, source: string}) => `- ${r.content} (${r.source})`).join("\n")
        : "No relevant data found.";

    if (results.length === 0) {
      return NextResponse.json({
        answer:
          "I don’t have enough of your data yet to answer that. Try adding more data in your vault.",
        sources: [],
      });
    }

    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext =
        "\n\nPrevious Conversation:\n" +
        conversationHistory
          .map(
            (msg: any) =>
              `${msg.role === "user" ? "User" : "Averin"}: ${msg.content}`,
          )
          .join("\n");
    }

    // Generate answer with Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
You are Averin, a smart, helpful, and human-like personal assistant and also a general guide ensuring effective living. You have access to the user's personal data and information that they have stored in their vault, which may include notes, attachments, links, and other relevant content. Your task is to provide accurate and helpful answers to the user's questions based on the information available in their vault.


STRICT OUTPUT RULES (VERY IMPORTANT):
- Write in natural conversational sentences, like a genius would
- Keep the tone clear and concise, but also warm and friendly
- When useful, use simple Markdown bullet points or numbered lists
- Short paragraphs or sentences are preferred
- Keep the answer concise and to the point

FORMAT RULES:
- If you list items, use "-" for bullet points
- Use "1.", "2.", "3." for numbered lists
- Do NOT use "•" symbols

BEHAVIOR RULES:
- Use ONLY the user's personal data provided below
- Reference previous questions and answers when relevant (from conversation history)
- If the data is insufficient, clearly say you do not have enough information but make sure to give general advice if possible
- Do NOT diagnose or give medical prescriptions unless you have very clear and specific information that justifies it, and even then, be very cautious and always encourage consulting a doctor
- You may suggest gentle next steps
- Write as if you are speaking to one person and use "you" to refer to the user
- Acknowledge the user's feelings and experiences when relevant
- Always encourage the user to seek professionals when it comes to health-related questions or serious issues


User's Personal Data:
${context}
${conversationContext}

User's Question:
${question}

Now reply in smart but, friendly human language.
`);

    const rawAnswer = result.response.text();
    const answer = rawAnswer.trim();

    const groundingMetadata =
      result.response.candidates?.[0]?.groundingMetadata;

    return NextResponse.json({
      answer,
      sources: results.map((r) => ({
        source: r.source,
        content: r.content,
        similarity: Number(r.similarity.toFixed(4)),
      })),
      searchMetadata: {
        searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent,
        groundingChunks: groundingMetadata?.groundingChunks?.map((chunk) => ({
          title: chunk.web?.title,
          url: chunk.web?.uri,
        })),
      },
    });
  } catch (error: any) {
    console.error("=== AI Chat Error ===");
    console.error(error);

    if (error?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        {
          answer:
            "I’m getting a little too many questions right now. Please wait a moment and try again.",
          retryAfter: 40,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process question",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
