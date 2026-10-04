import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionApi,
  zSessionApi
} from '#common/types/backend/parts/session/session-api';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

export type ToBackendCommitRepoOutput = {
  repo: Repo;
  session?: SessionApi;
};

export let zToBackendCommitRepoOutput = z
  .object({
    repo: zRepo,
    session: zSessionApi.nullish()
  })
  .meta({ id: 'ToBackendCommitRepoOutput' });

assertTypesEqual<
  ToBackendCommitRepoOutput,
  z.infer<typeof zToBackendCommitRepoOutput>
>({ value: true });
