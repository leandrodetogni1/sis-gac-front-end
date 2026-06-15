type AuditGender = "f" | "m";

const AUDIT_ENTITY_LABELS: Record<string, { label: string; gender: AuditGender }> = {
  activity: { label: "Atividade", gender: "f" },
  activity_type: { label: "Tipo de atividade", gender: "m" },
  user: { label: "Usuário", gender: "m" },
  invitation: { label: "Convite", gender: "m" },
  curriculum: { label: "Currículo", gender: "m" },
  curriculum_course_rule: { label: "Regra de curso", gender: "f" },
  curriculum_activity_type_rule: { label: "Regra de tipo de atividade", gender: "f" },
};

const AUDIT_VERB_LABELS: Record<string, { f: string; m: string }> = {
  created: { f: "Criada", m: "Criado" },
  updated: { f: "Atualizada", m: "Atualizado" },
  deleted: { f: "Excluída", m: "Excluído" },
  removed: { f: "Removida", m: "Removido" },
  restored: { f: "Restaurada", m: "Restaurado" },
  approved: { f: "Aprovada", m: "Aprovado" },
  rejected: { f: "Rejeitada", m: "Rejeitado" },
  submitted: { f: "Enviada", m: "Enviado" },
  sent: { f: "Enviada", m: "Enviado" },
  accepted: { f: "Aceita", m: "Aceito" },
  declined: { f: "Recusada", m: "Recusado" },
  revoked: { f: "Revogada", m: "Revogado" },
};

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.register": "Cadastro",
  "auth.password_reset": "Redefinição de senha",
};

const humanizeAction = (action: string): string =>
  action
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatAuditAction = (action: string | null | undefined): string => {
  if (!action) return "—";

  const known = AUDIT_ACTION_LABELS[action];
  if (known) return known;

  const parts = action.split(".");
  const verb = parts.pop() ?? "";
  const entity = parts.join(".");

  const entityInfo = AUDIT_ENTITY_LABELS[entity];
  const verbInfo = AUDIT_VERB_LABELS[verb];

  if (entityInfo && verbInfo) return `${entityInfo.label} ${verbInfo[entityInfo.gender]}`;
  if (entityInfo) return entityInfo.label;

  return humanizeAction(action);
};
