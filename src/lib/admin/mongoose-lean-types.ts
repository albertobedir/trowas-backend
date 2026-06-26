import { Types } from "mongoose";

export interface AdminTeamLean {
  _id: Types.ObjectId;
  name: string;
  owner?: Types.ObjectId;
}

export interface AdminTeamDetailLean {
  _id: Types.ObjectId;
  name?: string;
  pendingUsers?: Types.ObjectId[];
  [key: string]: unknown;
}

export interface AdminLeadLean {
  _id: Types.ObjectId;
  teamId: Types.ObjectId;
  user: { id: Types.ObjectId; name: string; profileImage?: string };
  leadData: Record<string, unknown> | Map<string, unknown>;
  sendAfter?: Date;
  createdAt: Date;
  updatedAt: Date;
  type?: string;
}

export interface AdminSubTeamLean {
  _id: Types.ObjectId;
  parentTeam?:
    | Types.ObjectId
    | { _id: Types.ObjectId; name?: string };
  members?: Types.ObjectId[];
  [key: string]: unknown;
}

export interface AdminUserLean {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  username?: string;
  profileImage?: string;
  roles?: { teamRole?: string };
  createdAt?: Date;
}

export interface UserCardCoverLean {
  _id: Types.ObjectId;
  coverPhoto?: string;
}
