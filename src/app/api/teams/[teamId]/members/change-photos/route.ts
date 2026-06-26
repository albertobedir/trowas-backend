import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Team from "@/schemas/mongoose/Team";
import UserCard from "@/schemas/mongoose/UserCard";
import { isValidObjectId } from "mongoose";
import { getUserIfTeamRoleAllowed } from "@/utils/decorators/team-role.decorator";
import { saveFile } from "@/utils/upload";
import User from "@/schemas/mongoose/User";

interface TeamType {
  members: string[];
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await dbConnect();

    const formData = await req.formData();

    const memberIdsRaw = formData.get("memberIds");
    let memberIds: string[] = [];

    if (typeof memberIdsRaw === "string") {
      memberIds = JSON.parse(memberIdsRaw);
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds array is required" },
        { status: 400 },
      );
    }

    const { teamId } = await params;

    const user = await getUserIfTeamRoleAllowed(req, ["owner", "manager"]);
    if (!user || !isValidObjectId(user._id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = (await Team.findById(teamId)
      .select("members")
      .lean()) as TeamType | null;

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const validMemberIds = memberIds.filter((id) =>
      team.members.some((memberId) => memberId.toString() === id),
    );

    if (validMemberIds.length === 0) {
      return NextResponse.json(
        { error: "No valid team members found" },
        { status: 400 },
      );
    }

    const coverPhotoFile = formData.get("coverPhoto") as File | null;
    const companyLogoFile = formData.get("companyLogo") as File | null;
    const profilePictureFile = formData.get("profilePicture") as File | null;

    if (!coverPhotoFile && !companyLogoFile && !profilePictureFile) {
      return NextResponse.json(
        { error: "No files uploaded for update" },
        { status: 400 },
      );
    }

    const updateData: { [key: string]: string } = {};

    if (coverPhotoFile) {
      const ext = coverPhotoFile.name.split(".").pop() || "jpg";
      updateData.coverPhoto = await saveFile(
        coverPhotoFile,
        user._id.toString(),
        {},
        ext,
      );
    }

    if (companyLogoFile) {
      const ext = companyLogoFile.name.split(".").pop() || "jpg";
      updateData.companyLogo = await saveFile(
        companyLogoFile,
        user._id.toString(),
        {},
        ext,
      );
    }

    if (profilePictureFile) {
      const ext = profilePictureFile.name.split(".").pop() || "jpg";
      updateData.profilePicture = await saveFile(
        profilePictureFile,
        user._id.toString(),
        {},
        ext,
      );
    }

    const updatePromises = validMemberIds.map(async (memberId) => {
      const firstUserCard = await UserCard.findOne({ user: memberId }).sort({
        createdAt: 1,
      });

      const user = await User.findById(memberId);

      if (!firstUserCard || !user) return null;

      // 1. UserCard update
      if (updateData.coverPhoto)
        firstUserCard.coverPhoto = updateData.coverPhoto;

      if (updateData.companyLogo)
        firstUserCard.companyLogo = updateData.companyLogo;

      if (updateData.profilePicture)
        firstUserCard.profilePicture = updateData.profilePicture;

      await firstUserCard.save();

      // 2. User profileImage update
      if (updateData.profilePicture) {
        user.profileImage = updateData.profilePicture;
      }

      // 3. User.userCard array update
      if (updateData.profilePicture && Array.isArray(user.userCard)) {
        user.userCard = user.userCard.map((card: any) => {
          if (card.cardId.toString() === firstUserCard._id.toString()) {
            return {
              ...(card.toObject?.() ?? card),
              cardProfileImage: updateData.profilePicture,
            };
          }
          return card;
        });
      }

      await user.save();

      return firstUserCard;
    });

    const results = await Promise.all(updatePromises);

    const updatedCount = results.filter((r) => r !== null).length;

    return NextResponse.json(
      { message: `${updatedCount} user cards updated.` },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
