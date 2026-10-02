import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSyncRepoRepo,
  zToBackendSyncRepoRepo
} from '#common/types/backend/parts/repos/to-backend-sync-repo-repo';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/types/disk/parts/disk-file-change';

export type ToBackendSyncRepoBaseOutput = {
  orgId: string;
  repoId: string;
  validationErrorsTotal: number;
  validationErrors?: BmlError[];
  devChangesToCommit: DiskFileChange[];
  repo?: ToBackendSyncRepoRepo;
  needValidate?: boolean;
  structId?: string;
};

export let zToBackendSyncRepoBaseOutput = z.object({
  orgId: z.string(),
  repoId: z.string(),
  validationErrorsTotal: z.number(),
  validationErrors: z.array(zBmlError).nullish(),
  devChangesToCommit: z.array(zDiskFileChange),
  repo: zToBackendSyncRepoRepo.nullish(),
  needValidate: z.boolean().nullish(),
  structId: z.string().nullish()
});

assertTypesEqual<
  ToBackendSyncRepoBaseOutput,
  z.infer<typeof zToBackendSyncRepoBaseOutput>
>({ value: true });
