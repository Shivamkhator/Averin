// lib/embeddings.ts
import "server-only";
import { prisma } from "./prisma";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function createEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-embedding-001",
  });

  const result = await model.embedContent(text);

  return result.embedding.values;
}

// ---------- NOTE EMBEDDING ----------

export async function embedNote(note: {
  id: string;
  userId: string;
  title?: string | null;
  content: string;
}) {
  const content = `Note: ${note.title ?? "Untitled"} — ${note.content}`;

  const vector = await createEmbedding(content);
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding"
      ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())
     ON CONFLICT DO NOTHING`,
    note.userId,
    "note",
    note.id,
    content,
    vectorString,
  );
}

// ---------- ATTACHMENT EMBEDDING ----------

export async function embedAttachment(attachment: {
  id: string;
  userId: string;
  name: string;
  content: string;
  contentType: string;
}) {
  const content = `Attachment: ${attachment.name}
Type: ${attachment.contentType}
Content: ${attachment.content}`;

  const vector = await createEmbedding(content);
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding"
      ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())`,
    attachment.userId,
    "attachment",
    attachment.id,
    content,
    vectorString,
  );
}

// ---------- LINK EMBEDDING ----------

export async function embedLink(link: {
  id: string;
  userId: string;
  url: string;
  title?: string | null;
}) {
  const content = `Link: ${link.title ?? "Untitled"} — ${link.url}`;

  const vector = await createEmbedding(content);
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding"
      ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())`,
    link.userId,
    "link",
    link.id,
    content,
    vectorString,
  );
}

// ---------- ACTIONS EMBEDDING ----------
export async function embedAction(action: {
  id: string;
  userId: string;
  title: string;
  isRecurring: boolean;
  isCompleted: boolean;
}) {
  const content = `Action: ${action.title} — ${action.isRecurring ? "Recurring" : "One-time"} — ${action.isCompleted ? "Completed" : "Not completed"}`;

  const vector = await createEmbedding(content);
  const vectorString = `[${vector.join(",")}]`;

  await prisma.$queryRawUnsafe(
    `INSERT INTO "Embedding"
      ("id", "userId", "source", "sourceId", "content", "vector", "createdAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::vector, NOW())`,
    action.userId,
    "action",
    action.id,
    content,
    vectorString,
  );
}

// ---------- DELETE EMBEDDINGS ----------
export async function deleteEmbeddingsBySource(
  userId: string,
  source: string,
  sourceId: string
) {
  await prisma.$executeRawUnsafe(
    `DELETE FROM "Embedding"
      WHERE "userId" = $1
        AND "source" = $2
        AND "sourceId" = $3`,
    userId,
    source,
    sourceId,
  );
}

// ---------- SEMANTIC SEARCH ----------

export async function searchVault(userId: string, query: string, limit = 5) {
  const vector = await createEmbedding(query);
  const vectorString = `[${vector.join(",")}]`;

  return prisma.$queryRawUnsafe<
    {
      id: string;
      content: string;
      source: string;
      sourceId: string;
      similarity: number;
    }[]
  >(
    `SELECT
        id,
        content,
        source,
        "sourceId",
        1 - (vector <=> $1::vector) AS similarity
     FROM "Embedding"
     WHERE "userId" = $2
     ORDER BY vector <=> $1::vector
     LIMIT $3`,
    vectorString,
    userId,
    limit,
  );
}
