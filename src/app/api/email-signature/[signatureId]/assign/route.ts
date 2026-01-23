"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import EmailSignature from "@/schemas/mongoose/EmailSignature";
import User from "@/schemas/mongoose/User";
import { isValidObjectId } from "mongoose";
import { getUserIdFromToken } from "@/utils/decorators/id-decorator";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ signatureId: string }> }
) {
  try {
    await dbConnect();

    const currentUserId = await getUserIdFromToken(req);
    if (!currentUserId || !isValidObjectId(currentUserId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signatureId } = await params;
    if (!isValidObjectId(signatureId)) {
      return NextResponse.json(
        { error: "Invalid signatureId" },
        { status: 400 }
      );
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Yalnızca owner veya manager yetkili


    const signature = await EmailSignature.findById(signatureId);
    if (!signature) {
      return NextResponse.json(
        { error: "EmailSignature not found" },
        { status: 404 }
      );
    }

    // Kullanıcının takımı ile signature takımı aynı olmalı
    if (
      !currentUser.team ||
      signature.team.toString() !== currentUser.team.toString()
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Team mismatch" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const add: string[] = body.add || []; // Kullanıcı ID'leri
    const remove: string[] = body.remove || [];

    // add ve remove dizilerindeki ID'leri doğrula
    const validAdd = add.filter((id) => isValidObjectId(id));
    const validRemove = remove.filter((id) => isValidObjectId(id));

    // Kullanıcıları bulalım (hem add hem remove)
    const usersToAdd = await User.find({
      _id: { $in: validAdd },
      team: currentUser.team,
    });
    const usersToRemove = await User.find({
      _id: { $in: validRemove },
      team: currentUser.team,
    });

    for (const user of usersToRemove) {
      if (user.emailSignature?.toString() === signatureId) {
        user.emailSignature = undefined;
        await user.save();

        signature.users = signature.users.filter(
          (uId: string) => uId.toString() !== user._id.toString()
        );
      }
    }

    for (const user of usersToAdd) {
      if (
        user.emailSignature &&
        user.emailSignature.toString() !== signatureId
      ) {
        const oldSignature = await EmailSignature.findById(user.emailSignature);
        if (oldSignature) {
          oldSignature.users = oldSignature.users.filter(
            (uId: string) => uId.toString() !== user._id.toString()
          );
          await oldSignature.save();
        }
      }

      user.emailSignature = signature._id;
      await user.save();

      if (
        !signature.users.some(
          (uId: string) => uId.toString() === user._id.toString()
        )
      ) {
        signature.users.push(user._id);
      }
    }

    await signature.save();

    return NextResponse.json(
      { message: "Users assigned to EmailSignature successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning users to EmailSignature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
