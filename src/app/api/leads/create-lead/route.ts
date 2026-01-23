import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/schemas/mongoose/User";
import Team from "@/schemas/mongoose/Team";
import Lead from "@/schemas/mongoose/Lead";
import { isValidObjectId } from "mongoose";
import nodemailer from "nodemailer";
import cron from "node-cron";

const smtpTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT!, 10),
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

interface EmailJob {
  to: string[];
  subject: string;
  message: string;
  sendAt: Date;
}

const emailJobs: EmailJob[] = [];

cron.schedule("* * * * *", () => {
  const now = new Date();
  const dueEmails = emailJobs.filter((job) => job.sendAt <= now);
  emailJobs.splice(0, dueEmails.length); // Gönderilenleri kaldır

  for (const job of dueEmails) {
    const htmlContent = `<p>${job.message.replace(/\n/g, "<br>")}</p>`;
    smtpTransport.sendMail(
      {
        from: process.env.MAIL_USERNAME,
        to: job.to.join(","),
        subject: job.subject,
        html: htmlContent,
      },
      (error, info) => {
        if (error) {
          console.error("Zamanlı e-posta gönderim hatası:", error);
        } else {
          console.log("Zamanlı e-posta gönderildi:", info.response);
        }
      }
    );
  }
});

function fillTemplate(template: string, leadData: any): string {
  return template
    .replace(/Lead's First Name/g, leadData.firstName || "")
    .replace(/New Lead's Email/g, leadData.email || "");
}

function parseTimeDelay(timeString: string): number {
  const regex = /(\d+)\s*hour[s]?\s*(\d+)?\s*minute[s]?/i;
  const match = regex.exec(timeString);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  return (hours * 60 + minutes) * 60 * 1000;
}

export async function POST(req: Request) {
  try {
    const { leadData, userId, emailData } = await req.json();

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isValidObjectId(user.team)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const team = await Team.findById(user.team);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const newLead = new Lead({
      teamId: user.team,
      user: {
        id: user._id,
        name: user.name,
        profileImage: user.profileImage,
      },
      type: "Lead Capture",
      leadData,
    });

    await newLead.save();

    team.leads.push(newLead._id);
    team.teamPerformance.leadsCaptured += 1;
    await team.save();

    user.notifications.push({
      type: "lead_created",
      message: `Yeni bir lead oluşturuldu: ${leadData.firstName || "Ad belirtilmedi"}`,
      read: false,
      createdAt: new Date(),
    });
    await user.save();

    if (emailData && emailData.to && Array.isArray(emailData.to)) {
      const subject = fillTemplate(emailData.subject || "", leadData);
      const message = fillTemplate(emailData.message || "", leadData);
      const delay = emailData.sendAfter
        ? parseTimeDelay(emailData.sendAfter)
        : 0;

      if (delay > 0) {
        const sendAt = new Date(Date.now() + delay);
        emailJobs.push({ to: emailData.to, subject, message, sendAt });
        console.log("Zamanlı e-posta eklendi:", sendAt);
      } else {
        const htmlContent = `<p>${message.replace(/\n/g, "<br>")}</p>`;
        smtpTransport.sendMail(
          {
            from: process.env.MAIL_USERNAME,
            to: emailData.to.join(","),
            subject,
            html: htmlContent,
          },
          (error, info) => {
            if (error) {
              console.error("Anlık e-posta gönderim hatası:", error);
            } else {
              console.log("Anlık e-posta gönderildi:", info.response);
            }
          }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Lead başarıyla oluşturuldu",
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Lead oluşturulurken hata:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
