export type UserRole = "ADMIN" | "JURY" | "COORDINATOR";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  roomId?: string | IRoom;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRoom {
  _id: string;
  name: string;
  roomNumber: string;
  description?: string;
  capacity?: number;
  isLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITeam {
  _id: string;
  name: string;
  college: string;
  leaderName: string;
  members: string[];
  problemStatement: string;
  phone: string;
  email: string;
  submissionLink?: string;
  roomId: string | IRoom;
  isPresent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEvaluation {
  _id: string;
  teamId: string | ITeam;
  roomId: string | IRoom;
  juryId: string | IUser;
  innovation: number; // Max 20
  technicalExcellence: number; // Max 20
  presentation: number; // Max 20
  feasibility: number; // Max 20
  impact: number; // Max 20
  totalScore: number; // Max 100
  remarks?: string;
  isLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IRequest {
  _id: string;
  roomId: string | IRoom;
  juryId: string | IUser;
  teamId: string | ITeam;
  reason: string;
  status: RequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationType =
  | "TEAM_ADDED"
  | "EVALUATION_SUBMITTED"
  | "REQUEST_CREATED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "ROOM_LOCKED"
  | "ROOM_UNLOCKED";

export interface INotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRole?: UserRole | "ALL";
  targetRoomId?: string;
  readBy: string[];
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface IRoomLeaderboardItem {
  team: ITeam;
  evaluation?: IEvaluation;
  rank: number;
  isTop2: boolean;
  isApprovedExtra: boolean;
  totalScore: number;
}
