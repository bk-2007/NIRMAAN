import { supabaseAdmin as supabase } from "./supabase";
import mongoose from "mongoose";
import User from "@/models/User";
import Room from "@/models/Room";
import Team from "@/models/Team";
import Evaluation from "@/models/Evaluation";
import RequestModel from "@/models/Request";
import Notification from "@/models/Notification";
import AuditLog from "@/models/AuditLog";
import { connectToDatabase } from "./db";

// Helper to check if Supabase is active
export function isSupabaseActive(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xyzcompany")
  );
}

// Normalized output mappers to match Mongoose shape
export function mapRoom(r: any): any {
  if (!r) return null;
  return {
    _id: r.id || r._id?.toString(),
    id: r.id || r._id?.toString(),
    name: r.name,
    roomNumber: r.room_number || r.roomNumber,
    description: r.description || "",
    capacity: r.capacity,
    isLocked: r.is_locked !== undefined ? r.is_locked : r.isLocked,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export function mapUser(u: any): any {
  if (!u) return null;
  return {
    _id: u.id || u._id?.toString(),
    id: u.id || u._id?.toString(),
    name: u.name,
    email: u.email,
    password: u.password,
    role: u.role,
    roomId: u.rooms ? mapRoom(u.rooms) : (u.room_id || u.roomId || null),
    createdAt: u.created_at || u.createdAt,
    updatedAt: u.updated_at || u.updatedAt,
  };
}

export function mapTeam(t: any): any {
  if (!t) return null;
  return {
    _id: t.id || t._id?.toString(),
    id: t.id || t._id?.toString(),
    name: t.name,
    college: t.college,
    leaderName: t.leader_name || t.leaderName,
    members: t.members || [],
    problemStatement: t.problem_statement || t.problemStatement,
    phone: t.phone,
    email: t.email,
    submissionLink: t.submission_link || t.submissionLink || "",
    roomId: t.rooms ? mapRoom(t.rooms) : (t.room_id || t.roomId),
    isPresent: t.is_present !== undefined ? t.is_present : t.isPresent,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
  };
}

export function mapEvaluation(e: any): any {
  if (!e) return null;
  return {
    _id: e.id || e._id?.toString(),
    id: e.id || e._id?.toString(),
    teamId: e.teams ? mapTeam(e.teams) : (e.team_id || e.teamId),
    roomId: e.rooms ? mapRoom(e.rooms) : (e.room_id || e.roomId),
    juryId: e.users ? mapUser(e.users) : (e.jury_id || e.juryId),
    innovation: e.innovation,
    technicalExcellence: e.technical_excellence || e.technicalExcellence,
    presentation: e.presentation,
    feasibility: e.feasibility,
    impact: e.impact,
    totalScore: e.total_score || e.totalScore,
    remarks: e.remarks || "",
    isLocked: e.is_locked !== undefined ? e.is_locked : e.isLocked,
    createdAt: e.created_at || e.createdAt,
    updatedAt: e.updated_at || e.updatedAt,
  };
}

export function mapRequest(r: any): any {
  if (!r) return null;
  return {
    _id: r.id || r._id?.toString(),
    id: r.id || r._id?.toString(),
    roomId: r.rooms ? mapRoom(r.rooms) : (r.room_id || r.roomId),
    juryId: r.users ? mapUser(r.users) : (r.jury_id || r.juryId),
    teamId: r.teams ? mapTeam(r.teams) : (r.team_id || r.teamId),
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export function mapNotification(n: any): any {
  if (!n) return null;
  return {
    _id: n.id || n._id?.toString(),
    id: n.id || n._id?.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    targetRole: n.target_role || n.targetRole || "ALL",
    targetRoomId: n.rooms ? mapRoom(n.rooms) : (n.target_room_id || n.targetRoomId || null),
    readBy: n.read_by || n.readBy || [],
    createdAt: n.created_at || n.createdAt,
    updatedAt: n.updated_at || n.updatedAt,
  };
}

export function mapAuditLog(a: any): any {
  if (!a) return null;
  return {
    _id: a.id || a._id?.toString(),
    id: a.id || a._id?.toString(),
    userId: a.user_id || a.userId || null,
    userName: a.user_name || a.userName || "System",
    action: a.action,
    details: a.details,
    timestamp: a.timestamp || a.created_at,
  };
}

// -------------------------------------------------------------
// USER REPOSITORY
// -------------------------------------------------------------
export const UserRepository = {
  async countUsers(): Promise<number> {
    if (isSupabaseActive()) {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    } else {
      await connectToDatabase();
      return User.countDocuments();
    }
  },

  async getUserByEmail(email: string): Promise<any> {
    const cleanEmail = email.toLowerCase();
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("users")
        .select("*, rooms(*)")
        .eq("email", cleanEmail)
        .maybeSingle();
      if (error) throw error;
      return mapUser(data);
    } else {
      await connectToDatabase();
      const user = await User.findOne({ email: cleanEmail }).populate("roomId");
      return user ? mapUser(user.toObject({ virtuals: true })) : null;
    }
  },

  async getUserById(id: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("users")
        .select("*, rooms(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return mapUser(data);
    } else {
      await connectToDatabase();
      const user = await User.findById(id).populate("roomId");
      return user ? mapUser(user.toObject({ virtuals: true })) : null;
    }
  },

  async getUsers(): Promise<any[]> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("users")
        .select("*, rooms(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapUser);
    } else {
      await connectToDatabase();
      const users = await User.find().select("-password").populate("roomId").sort({ createdAt: -1 });
      return users.map(u => mapUser(u.toObject({ virtuals: true })));
    }
  },

  async createUser(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          role: data.role,
          room_id: data.roomId || null,
        })
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapUser(newUser);
    } else {
      await connectToDatabase();
      const user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role,
        roomId: data.roomId || null,
      });
      const populated = await User.findById(user._id).populate("roomId");
      return mapUser(populated?.toObject({ virtuals: true }));
    }
  },

  async checkAssignmentExists(roomId: string, role: string): Promise<boolean> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("room_id", roomId)
        .eq("role", role)
        .limit(1);
      if (error) throw error;
      return (data && data.length > 0);
    } else {
      await connectToDatabase();
      const count = await User.countDocuments({ roomId, role });
      return count > 0;
    }
  },

  async resetPassword(id: string, passwordHash: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("users")
        .update({ password: passwordHash })
        .eq("id", id)
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapUser(data);
    } else {
      await connectToDatabase();
      const user = await User.findByIdAndUpdate(
        id,
        { password: passwordHash },
        { new: true }
      ).select("-password").populate("roomId");
      return mapUser(user?.toObject({ virtuals: true }));
    }
  }
};

// -------------------------------------------------------------
// ROOM REPOSITORY
// -------------------------------------------------------------
export const RoomRepository = {
  async countRooms(): Promise<number> {
    if (isSupabaseActive()) {
      const { count, error } = await supabase
        .from("rooms")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    } else {
      await connectToDatabase();
      return Room.countDocuments();
    }
  },

  async findRooms(filter: any = {}): Promise<any[]> {
    if (isSupabaseActive()) {
      let query = supabase.from("rooms").select("*");
      if (filter._id) {
        query = query.eq("id", filter._id);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      // Enhance with counts
      const enriched = await Promise.all(
        (data || []).map(async (room: any) => {
          const teamsCount = await TeamRepository.countTeams({ roomId: room.id });
          const evaluationsCount = await EvaluationRepository.countEvaluations({ roomId: room.id });
          
          // Get Jury and Coordinator
          const { data: juryData } = await supabase
            .from("users")
            .select("name, email")
            .eq("room_id", room.id)
            .eq("role", "JURY")
            .maybeSingle();
            
          const { data: coordData } = await supabase
            .from("users")
            .select("name, email")
            .eq("room_id", room.id)
            .eq("role", "COORDINATOR")
            .maybeSingle();

          return {
            ...mapRoom(room),
            teamsCount,
            evaluationsCount,
            jury: juryData || null,
            coordinator: coordData || null,
          };
        })
      );
      return enriched;
    } else {
      await connectToDatabase();
      const rooms = await Room.find(filter).sort({ createdAt: -1 });
      const enrichedRooms = await Promise.all(
        rooms.map(async (room) => {
          const teamsCount = await Team.countDocuments({ roomId: room._id });
          const evaluationsCount = await Evaluation.countDocuments({ roomId: room._id });
          const juryUser = await User.findOne({ roomId: room._id, role: "JURY" }).select("name email");
          const coordUser = await User.findOne({ roomId: room._id, role: "COORDINATOR" }).select("name email");

          return {
            ...mapRoom(room.toObject({ virtuals: true })),
            teamsCount,
            evaluationsCount,
            jury: juryUser || null,
            coordinator: coordUser || null,
          };
        })
      );
      return enrichedRooms;
    }
  },

  async getRoomById(id: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return mapRoom(data);
    } else {
      await connectToDatabase();
      const room = await Room.findById(id);
      return room ? mapRoom(room.toObject({ virtuals: true })) : null;
    }
  },

  async getRoomByNumber(roomNumber: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_number", roomNumber)
        .maybeSingle();
      if (error) throw error;
      return mapRoom(data);
    } else {
      await connectToDatabase();
      const room = await Room.findOne({ roomNumber });
      return room ? mapRoom(room.toObject({ virtuals: true })) : null;
    }
  },

  async createRoom(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: newRoom, error } = await supabase
        .from("rooms")
        .insert({
          name: data.name,
          room_number: data.roomNumber,
          description: data.description || "",
          capacity: data.capacity,
          is_locked: false,
        })
        .select()
        .single();
      if (error) throw error;
      return mapRoom(newRoom);
    } else {
      await connectToDatabase();
      const room = await Room.create({
        name: data.name,
        roomNumber: data.roomNumber,
        description: data.description || "",
        capacity: data.capacity,
        isLocked: false,
      });
      return mapRoom(room.toObject({ virtuals: true }));
    }
  },

  async updateRoomLock(id: string, isLocked: boolean): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("rooms")
        .update({ is_locked: isLocked })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapRoom(data);
    } else {
      await connectToDatabase();
      const room = await Room.findByIdAndUpdate(
        id,
        { isLocked },
        { new: true }
      );
      return mapRoom(room?.toObject({ virtuals: true }));
    }
  }
};

// -------------------------------------------------------------
// TEAM REPOSITORY
// -------------------------------------------------------------
export const TeamRepository = {
  async countTeams(filter: any = {}): Promise<number> {
    if (isSupabaseActive()) {
      let query = supabase.from("teams").select("*", { count: "exact", head: true });
      if (filter.roomId) {
        query = query.eq("room_id", filter.roomId);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } else {
      await connectToDatabase();
      return Team.countDocuments(filter);
    }
  },

  async getTeams(filter: any = {}): Promise<any[]> {
    if (isSupabaseActive()) {
      let query = supabase.from("teams").select("*, rooms(*)");
      if (filter.roomId) {
        query = query.eq("room_id", filter.roomId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapTeam);
    } else {
      await connectToDatabase();
      const teams = await Team.find(filter).populate("roomId").sort({ createdAt: -1 });
      return teams.map(t => mapTeam(t.toObject({ virtuals: true })));
    }
  },

  async getTeamById(id: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("teams")
        .select("*, rooms(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return mapTeam(data);
    } else {
      await connectToDatabase();
      const team = await Team.findById(id).populate("roomId");
      return team ? mapTeam(team.toObject({ virtuals: true })) : null;
    }
  },

  async createTeam(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: newTeam, error } = await supabase
        .from("teams")
        .insert({
          name: data.name,
          college: data.college,
          leader_name: data.leaderName,
          members: data.members || [],
          problem_statement: data.problemStatement,
          phone: data.phone,
          email: data.email,
          submission_link: data.submissionLink || "",
          room_id: data.roomId,
          is_present: true,
        })
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapTeam(newTeam);
    } else {
      await connectToDatabase();
      const team = await Team.create({
        name: data.name,
        college: data.college,
        leaderName: data.leaderName,
        members: data.members,
        problemStatement: data.problemStatement,
        phone: data.phone,
        email: data.email,
        submissionLink: data.submissionLink || "",
        roomId: data.roomId,
        isPresent: true,
      });
      const populated = await Team.findById(team._id).populate("roomId");
      return mapTeam(populated?.toObject({ virtuals: true }));
    }
  },

  async updateTeam(id: string, body: any): Promise<any> {
    if (isSupabaseActive()) {
      const payload: any = {};
      if (body.name !== undefined) payload.name = body.name;
      if (body.college !== undefined) payload.college = body.college;
      if (body.leaderName !== undefined) payload.leader_name = body.leaderName;
      if (body.members !== undefined) payload.members = body.members;
      if (body.problemStatement !== undefined) payload.problem_statement = body.problemStatement;
      if (body.phone !== undefined) payload.phone = body.phone;
      if (body.email !== undefined) payload.email = body.email;
      if (body.submissionLink !== undefined) payload.submission_link = body.submissionLink;
      if (body.roomId !== undefined) payload.room_id = body.roomId;
      if (body.isPresent !== undefined) payload.is_present = body.isPresent;

      const { data, error } = await supabase
        .from("teams")
        .update(payload)
        .eq("id", id)
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapTeam(data);
    } else {
      await connectToDatabase();
      const team = await Team.findByIdAndUpdate(id, body, { new: true }).populate("roomId");
      return mapTeam(team?.toObject({ virtuals: true }));
    }
  },

  async deleteTeam(id: string): Promise<boolean> {
    if (isSupabaseActive()) {
      await supabase.from("evaluations").delete().eq("team_id", id);
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    } else {
      await connectToDatabase();
      await Team.findByIdAndDelete(id);
      await Evaluation.deleteMany({ teamId: id });
      return true;
    }
  },

  async updateAttendance(id: string, isPresent: boolean): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("teams")
        .update({ is_present: isPresent })
        .eq("id", id)
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapTeam(data);
    } else {
      await connectToDatabase();
      const team = await Team.findById(id);
      if (!team) return null;
      team.isPresent = isPresent;
      await team.save();
      return mapTeam(team.toObject({ virtuals: true }));
    }
  },

  async searchTeamsAndRooms(queryText: string): Promise<{ teams: any[], rooms: any[] }> {
    if (isSupabaseActive()) {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*, rooms(*)")
        .or(`name.ilike.%${queryText}%,college.ilike.%${queryText}%,leader_name.ilike.%${queryText}%,problem_statement.ilike.%${queryText}%`)
        .limit(10);
      
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .or(`name.ilike.%${queryText}%,room_number.ilike.%${queryText}%,description.ilike.%${queryText}%`)
        .limit(10);

      if (teamsError) throw teamsError;
      if (roomsError) throw roomsError;

      return {
        teams: (teamsData || []).map(mapTeam),
        rooms: (roomsData || []).map(mapRoom)
      };
    } else {
      await connectToDatabase();
      const regex = new RegExp(queryText.trim(), "i");
      const teams = await Team.find({
        $or: [
          { name: regex },
          { college: regex },
          { leaderName: regex },
          { problemStatement: regex },
        ],
      })
        .populate("roomId")
        .limit(10);

      const rooms = await Room.find({
        $or: [{ name: regex }, { roomNumber: regex }, { description: regex }],
      }).limit(10);

      return {
        teams: teams.map(t => mapTeam(t.toObject({ virtuals: true }))),
        rooms: rooms.map(r => mapRoom(r.toObject({ virtuals: true })))
      };
    }
  }
};

// -------------------------------------------------------------
// EVALUATION REPOSITORY
// -------------------------------------------------------------
export const EvaluationRepository = {
  async countEvaluations(filter: any = {}): Promise<number> {
    if (isSupabaseActive()) {
      let query = supabase.from("evaluations").select("*", { count: "exact", head: true });
      if (filter.roomId) {
        query = query.eq("room_id", filter.roomId);
      }
      if (filter.teamId) {
        query = query.eq("team_id", filter.teamId);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } else {
      await connectToDatabase();
      return Evaluation.countDocuments(filter);
    }
  },

  async getEvaluations(filter: any = {}): Promise<any[]> {
    if (isSupabaseActive()) {
      let query = supabase.from("evaluations").select("*, teams(*), rooms(*), users(name, email)");
      if (filter.roomId) {
        query = query.eq("room_id", filter.roomId);
      }
      if (filter.teamId) {
        query = query.eq("team_id", filter.teamId);
      }
      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapEvaluation);
    } else {
      await connectToDatabase();
      const evaluations = await Evaluation.find(filter)
        .populate("teamId")
        .populate("juryId", "name email")
        .sort({ updatedAt: -1 });
      return evaluations.map(e => mapEvaluation(e.toObject({ virtuals: true })));
    }
  },

  async getEvaluationByTeamId(teamId: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, teams(*), rooms(*), users(name, email)")
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) throw error;
      return mapEvaluation(data);
    } else {
      await connectToDatabase();
      const ev = await Evaluation.findOne({ teamId });
      return ev ? mapEvaluation(ev.toObject({ virtuals: true })) : null;
    }
  },

  async saveEvaluation(data: any): Promise<any> {
    const totalScore =
      data.innovation +
      data.technicalExcellence +
      data.presentation +
      data.feasibility +
      data.impact;

    if (isSupabaseActive()) {
      // Find existing
      const existing = await this.getEvaluationByTeamId(data.teamId);

      const payload = {
        team_id: data.teamId,
        room_id: data.roomId,
        jury_id: data.juryId,
        innovation: data.innovation,
        technical_excellence: data.technicalExcellence,
        presentation: data.presentation,
        feasibility: data.feasibility,
        impact: data.impact,
        total_score: totalScore,
        remarks: data.remarks || "",
        is_locked: true,
      };

      let result;
      if (existing) {
        const { data: updated, error } = await supabase
          .from("evaluations")
          .update(payload)
          .eq("id", existing.id)
          .select("*, teams(*), rooms(*), users(name, email)")
          .single();
        if (error) throw error;
        result = updated;
      } else {
        const { data: created, error } = await supabase
          .from("evaluations")
          .insert(payload)
          .select("*, teams(*), rooms(*), users(name, email)")
          .single();
        if (error) throw error;
        result = created;
      }
      return mapEvaluation(result);
    } else {
      await connectToDatabase();
      const existingEval = await Evaluation.findOne({ teamId: data.teamId });
      let evaluation;

      if (existingEval) {
        existingEval.innovation = data.innovation;
        existingEval.technicalExcellence = data.technicalExcellence;
        existingEval.presentation = data.presentation;
        existingEval.feasibility = data.feasibility;
        existingEval.impact = data.impact;
        existingEval.totalScore = totalScore;
        existingEval.remarks = data.remarks || "";
        existingEval.isLocked = true;
        evaluation = await existingEval.save();
      } else {
        evaluation = await Evaluation.create({
          teamId: data.teamId,
          roomId: data.roomId,
          juryId: data.juryId,
          innovation: data.innovation,
          technicalExcellence: data.technicalExcellence,
          presentation: data.presentation,
          feasibility: data.feasibility,
          impact: data.impact,
          totalScore,
          remarks: data.remarks || "",
          isLocked: true,
        });
      }

      const populated = await Evaluation.findById(evaluation._id)
        .populate("teamId")
        .populate("juryId", "name email");
      return mapEvaluation(populated?.toObject({ virtuals: true }));
    }
  },

  async updateManyEvaluationLocks(roomId: string, isLocked: boolean): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("evaluations")
        .update({ is_locked: isLocked })
        .eq("room_id", roomId);
      if (error) throw error;
      return true;
    } else {
      await connectToDatabase();
      await Evaluation.updateMany({ roomId }, { isLocked });
      return true;
    }
  }
};

// -------------------------------------------------------------
// REQUEST REPOSITORY
// -------------------------------------------------------------
export const RequestRepository = {
  async countRequests(filter: any = {}): Promise<number> {
    if (isSupabaseActive()) {
      let query = supabase.from("requests").select("*", { count: "exact", head: true });
      if (filter.status) {
        query = query.eq("status", filter.status);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    } else {
      await connectToDatabase();
      return RequestModel.countDocuments(filter);
    }
  },

  async getRequests(filter: any = {}): Promise<any[]> {
    if (isSupabaseActive()) {
      let query = supabase.from("requests").select("*, teams(*), rooms(*), users(name, email)");
      if (filter.roomId) {
        query = query.eq("room_id", filter.roomId);
      }
      if (filter.teamId) {
        query = query.eq("team_id", filter.teamId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapRequest);
    } else {
      await connectToDatabase();
      const requests = await RequestModel.find(filter)
        .populate("teamId")
        .populate("roomId")
        .populate("juryId", "name email")
        .sort({ createdAt: -1 });
      return requests.map(r => mapRequest(r.toObject({ virtuals: true })));
    }
  },

  async checkRequestExists(roomId: string, teamId: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("room_id", roomId)
        .eq("team_id", teamId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRequest(data) : null;
    } else {
      await connectToDatabase();
      const req = await RequestModel.findOne({ roomId, teamId });
      return req ? mapRequest(req.toObject({ virtuals: true })) : null;
    }
  },

  async getRequestById(id: string): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("requests")
        .select("*, teams(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return mapRequest(data);
    } else {
      await connectToDatabase();
      const req = await RequestModel.findById(id).populate("teamId");
      return req ? mapRequest(req.toObject({ virtuals: true })) : null;
    }
  },

  async createRequest(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: newRequest, error } = await supabase
        .from("requests")
        .insert({
          room_id: data.roomId,
          jury_id: data.juryId,
          team_id: data.teamId,
          reason: data.reason,
          status: "PENDING",
        })
        .select("*, teams(*), rooms(*), users(name, email)")
        .single();
      if (error) throw error;
      return mapRequest(newRequest);
    } else {
      await connectToDatabase();
      const newRequest = await RequestModel.create({
        roomId: data.roomId,
        juryId: data.juryId,
        teamId: data.teamId,
        reason: data.reason,
        status: "PENDING",
      });
      const populated = await RequestModel.findById(newRequest._id)
        .populate("teamId")
        .populate("roomId")
        .populate("juryId", "name email");
      return mapRequest(populated?.toObject({ virtuals: true }));
    }
  },

  async updateRequestStatus(id: string, status: "APPROVED" | "REJECTED"): Promise<any> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from("requests")
        .update({ status })
        .eq("id", id)
        .select("*, teams(*), rooms(*), users(name, email)")
        .single();
      if (error) throw error;
      return mapRequest(data);
    } else {
      await connectToDatabase();
      const req = await RequestModel.findById(id);
      if (!req) return null;
      req.status = status;
      await req.save();
      const populated = await RequestModel.findById(req._id).populate("teamId");
      return mapRequest(populated?.toObject({ virtuals: true }));
    }
  }
};

// -------------------------------------------------------------
// NOTIFICATION REPOSITORY
// -------------------------------------------------------------
export const NotificationRepository = {
  async getNotifications(role: string, roomId?: string): Promise<any[]> {
    if (isSupabaseActive()) {
      // Build conditions equivalent to $or in MongoDB
      let query = supabase.from("notifications").select("*, rooms(*)");
      
      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;

      // Filter in memory to replicate complex OR match
      const filtered = (data || []).filter((notif: any) => {
        return (
          notif.target_role === "ALL" ||
          notif.target_role === role ||
          (roomId && notif.target_room_id === roomId)
        );
      });

      return filtered.map(mapNotification);
    } else {
      await connectToDatabase();
      const notifications = await Notification.find({
        $or: [
          { targetRole: "ALL" },
          { targetRole: role },
          { targetRoomId: roomId || null },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(30);
      return notifications.map(n => mapNotification(n.toObject({ virtuals: true })));
    }
  },

  async createNotification(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: newNotif, error } = await supabase
        .from("notifications")
        .insert({
          title: data.title,
          message: data.message,
          type: data.type,
          target_role: data.targetRole || "ALL",
          target_room_id: data.targetRoomId || null,
          read_by: [],
        })
        .select("*, rooms(*)")
        .single();
      if (error) throw error;
      return mapNotification(newNotif);
    } else {
      await connectToDatabase();
      const notif = await Notification.create({
        title: data.title,
        message: data.message,
        type: data.type,
        targetRole: data.targetRole || "ALL",
        targetRoomId: data.targetRoomId || null,
      });
      return mapNotification(notif.toObject({ virtuals: true }));
    }
  },

  async markAsRead(id: string, userId: string): Promise<boolean> {
    if (isSupabaseActive()) {
      // Retrieve first
      const { data, error: fetchErr } = await supabase
        .from("notifications")
        .select("read_by")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!data) return false;

      const readByList: string[] = data.read_by || [];
      if (!readByList.includes(userId)) {
        readByList.push(userId);
        const { error: updateErr } = await supabase
          .from("notifications")
          .update({ read_by: readByList })
          .eq("id", id);
        if (updateErr) throw updateErr;
      }
      return true;
    } else {
      await connectToDatabase();
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { readBy: userId },
      });
      return true;
    }
  }
};

// -------------------------------------------------------------
// AUDIT LOG REPOSITORY
// -------------------------------------------------------------
export const AuditLogRepository = {
  async createAuditLog(data: any): Promise<any> {
    if (isSupabaseActive()) {
      const { data: log, error } = await supabase
        .from("audit_logs")
        .insert({
          user_id: data.userId || null,
          user_name: data.userName || "System",
          action: data.action,
          details: data.details,
        })
        .select()
        .single();
      if (error) throw error;
      return mapAuditLog(log);
    } else {
      await connectToDatabase();
      const log = await AuditLog.create({
        userId: data.userId || null,
        userName: data.userName || "System",
        action: data.action,
        details: data.details,
      });
      return mapAuditLog(log.toObject({ virtuals: true }));
    }
  }
};
