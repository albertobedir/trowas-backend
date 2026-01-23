import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { Readable } from "stream";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    await dbConnect();

    const { teamId } = await params;

    if (!isValidObjectId(teamId)) {
      return NextResponse.json({ error: "Invalid teamId" }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file"); // 'csv' değil, genel 'file' olsun

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "CSV or XLS file is required" },
        { status: 400 }
      );
    }

    const filename = (file as File).name;
    const buffer = Buffer.from(await file.arrayBuffer());

    let results: any[] = [];

    if (filename.endsWith(".csv")) {
      // CSV olarak işle
      results = await new Promise((resolve, reject) => {
        const records: any[] = [];
        Readable.from(buffer)
          .pipe(csv())
          .on("data", (data) => records.push(data))
          .on("end", () => resolve(records))
          .on("error", (err) => reject(err));
      });
    } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
      // XLS veya XLSX olarak işle
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      results = XLSX.utils.sheet_to_json(sheet);
    } else {
      return NextResponse.json(
        { error: "Unsupported file format" },
        { status: 400 }
      );
    }

    for (const record of results) {
      const email = record.email?.toLowerCase().trim();
      const name = record.name?.trim();

      if (!email) continue;

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name: name || "Unnamed",
          password: "defaultpassword123",
          team: team._id,
          roles: { teamRole: "member" },
        });
        console.log("New user created:", user);
        await user.save();
      } else {
        user.team = team._id;
        user.roles.teamRole = "member";
        await user.save();

      }

      if (
        !team.members.some(
          (m: { toString: () => any }) => m.toString() === user._id.toString()
        )
      ) {
        team.members.push(user._id);
      }
    }

    await team.save();

    return NextResponse.json(
      {
        message: `Members added from ${filename.endsWith(".csv") ? "CSV" : "XLS/XLSX"} successfully`,
        added: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
