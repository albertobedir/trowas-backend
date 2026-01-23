import { NextResponse } from "next/server";
import { saveFile } from "@/utils/upload";
import { createFilePath } from "@/utils/upload";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Missing file or identifiers" },
      { status: 400 }
    );
  }

  const fileType = file.type.split("/")[1] || "bin";

  try {
    const filePath = await saveFile(file, userId, {}, fileType);
    return NextResponse.json({ path: filePath });
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
