import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ArchiveReason,
  zArchiveReason
} from '#common/types/backend/parts/session/archive-reason';
import {
  type PauseReason,
  zPauseReason
} from '#common/types/backend/parts/session/pause-reason';
import {
  type SessionStatus,
  zSessionStatus
} from '#common/types/backend/parts/session/session-status';
import {
  type SessionType,
  zSessionType
} from '#common/types/backend/parts/session/session-type';

export type SessionApi = {
  sessionId: string;
  opencodeSessionId?: string;
  type: SessionType;
  providerId: string;
  agent: string;
  modelId: string;
  lastMessageVariant?: string;
  status: SessionStatus;
  archiveReason?: ArchiveReason;
  pauseReason?: PauseReason;
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
    type: zSessionType,
    providerId: z.string(),
    agent: z.string(),
    modelId: z.string(),
    lastMessageVariant: z.string().nullish(),
    status: zSessionStatus,
    archiveReason: zArchiveReason.nullish(),
    pauseReason: zPauseReason.nullish(),
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
