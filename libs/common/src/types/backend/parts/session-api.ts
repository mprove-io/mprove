import { z } from 'zod';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type SessionApi = {
  sessionId: string;
  opencodeSessionId?: string;
  type: EnumValues<typeof SessionTypeEnum>;
  providerId: string;
  agent: string;
  modelId: string;
  lastMessageVariant?: string;
  status: string;
  archiveReason?: EnumValues<typeof ArchiveReasonEnum>;
  pauseReason?: EnumValues<typeof PauseReasonEnum>;
  repoId: string;
  branchId: string;
  initialBranch?: string;
  envId?: string;
  initialCommit?: string;
  createdTs: number;
  lastActivityTs: number;
  firstMessage?: string;
  title?: string;
  closedExplorerTabIds?: string[];
};

export let zSessionApi = z
  .object({
    sessionId: z.string(),
    opencodeSessionId: z.string().nullish(),
    type: z.enum(SessionTypeEnum),
    providerId: z.string(),
    agent: z.string(),
    modelId: z.string(),
    lastMessageVariant: z.string().nullish(),
    status: z.string(),
    archiveReason: z.enum(ArchiveReasonEnum).nullish(),
    pauseReason: z.enum(PauseReasonEnum).nullish(),
    repoId: z.string(),
    branchId: z.string(),
    initialBranch: z.string().nullish(),
    envId: z.string().nullish(),
    initialCommit: z.string().nullish(),
    createdTs: z.number().int(),
    lastActivityTs: z.number().int(),
    firstMessage: z.string().nullish(),
    title: z.string().nullish(),
    closedExplorerTabIds: z.array(z.string()).nullish()
  })
  .meta({ id: 'SessionApi' });

assertTypesEqual<SessionApi, z.infer<typeof zSessionApi>>({ value: true });
