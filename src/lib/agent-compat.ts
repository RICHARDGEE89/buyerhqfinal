import type { AgentRow } from "@/lib/database.types";

type AgentLike = Partial<AgentRow> & Pick<AgentRow, "id" | "name" | "email" | "created_at">;

export function normalizeAgent(agent: AgentRow): AgentRow {
  const cast = agent as AgentLike;
  return {
    ...agent,
    is_active: typeof cast.is_active === "boolean" ? cast.is_active : true,
    is_verified: typeof cast.is_verified === "boolean" ? cast.is_verified : true,
    suburbs: Array.isArray(cast.suburbs) ? cast.suburbs : [],
    specializations: Array.isArray(cast.specializations) ? cast.specializations : [],
  };
}

export function normalizeAgents(agents: AgentRow[]) {
  return agents.map(normalizeAgent);
}

export function agentIsActive(agent: AgentRow) {
  return normalizeAgent(agent).is_active;
}

export function agentIsVerified(agent: AgentRow) {
  return normalizeAgent(agent).is_verified;
}

export function agentSuburbs(agent: AgentRow) {
  return normalizeAgent(agent).suburbs ?? [];
}
