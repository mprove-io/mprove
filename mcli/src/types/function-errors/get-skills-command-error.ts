import type { ToBackendGetSkillsResponse } from '#common/types/backend/routes/skills/get-skills/get-skills-response';
import type { MreqError } from '#mcli/types/function-errors/mreq-error';

export type GetSkillsCommandError = MreqError<ToBackendGetSkillsResponse>;
