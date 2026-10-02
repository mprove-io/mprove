import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSyncRepoBaseInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  lastCommit: string;
  envId: string;
  getRepo?: boolean;
  getRepoNodes?: boolean;
  getErrors?: boolean;
  debug?: boolean;
};

export let zToBackendSyncRepoBaseInput = z.object({
  projectId: z.string(),
  repoId: z.string(),
  branchId: z.string(),
  lastCommit: z.string(),
  envId: z.string(),
  getRepo: z.boolean().nullish(),
  getRepoNodes: z.boolean().nullish(),
  getErrors: z.boolean().nullish(),
  debug: z.boolean().nullish()
});

assertTypesEqual<
  ToBackendSyncRepoBaseInput,
  z.infer<typeof zToBackendSyncRepoBaseInput>
>({ value: true });
