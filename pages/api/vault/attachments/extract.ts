import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import formidable from "formidable";
import fs from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { createRequire } from "module";
import { embedAttachment } from "@/lib/embeddings";

const require = createRequire(import.meta.url);

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<formidable.Files> {
  const form = formidable();

  return new Promise((resolve, reject) => {
    form.parse(req, (err, _fields, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const files = await parseForm(req);
    const uploaded = files.files;

    if (!uploaded) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const fileArray = Array.isArray(uploaded) ? uploaded : [uploaded];
    const processedFiles: Prisma.AttachmentCreateManyInput[] = [];

    for (const file of fileArray) {
      console.log("➡️ Processing file:", {
        name: file.originalFilename,
        mimetype: file.mimetype,
        size: file.size,
        filepath: file.filepath,
      });

      let extractedContent = "";
      let contentType: Prisma.AttachmentCreateManyInput["contentType"] = "text";
      try {
        if (file.originalFilename?.match(/\.(png|jpg|jpeg|webp|gif)$/)) {
          console.log("📷 Detected image, running OCR...");
          const result = await Tesseract.recognize(file.filepath, "eng", {
            logger: (m) => console.log("Tesseract:", m.status, m.progress),
          });
          console.log("📄 OCR result:", {
            text: result.data.text,
            confidence: result.data.confidence,
          });
          extractedContent = result.data.text;
          contentType = "ocr";
        } else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const buffer = fs.readFileSync(file.filepath);
          const result = await mammoth.extractRawText({ buffer });
          extractedContent = result.value;
          contentType = "docx";
        } else if (
          file.mimetype?.includes("spreadsheet") ||
          file.mimetype === "application/vnd.ms-excel"
        ) {
          const buffer = fs.readFileSync(file.filepath);
          const workbook = XLSX.read(buffer);
          extractedContent = JSON.stringify(
            workbook.SheetNames.map((name) => ({
              name,
              data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
                header: 1,
              }),
            })),
          );
          contentType = "xlsx";
        } else {
          extractedContent = fs.readFileSync(file.filepath, "utf-8");
        }
        console.log(
          "🧾 Final DB payload preview:",
          processedFiles.map((f) => ({
            name: f.name,
            type: f.contentType,
            size: f.originalSize,
            contentLen: f.content.length,
          })),
        );
      } catch (err) {
        console.error("Extraction failed:", err);
      }
      processedFiles.push({
        id: uuid(),
        userId: session.user.id,
        name: file.originalFilename ?? "untitled",
        type: file.mimetype ?? "unknown",
        originalSize: file.size ?? 0,
        contentType,
        content: extractedContent,
      });
    }

    const result = await prisma.attachment.createMany({
      data: processedFiles,
    });

    for (const file of processedFiles) {
  await embedAttachment({
    id: file.id!,
    userId: file.userId,
    name: file.name,
    content: file.content,
    contentType: file.contentType,
  })}

    return res.status(200).json({
      success: true,
      count: processedFiles.length,
    });
  } catch (err) {
    console.error("Extraction handler failed:", err);
    return res.status(500).json({ error: "Extraction failed" });
  }
  }

