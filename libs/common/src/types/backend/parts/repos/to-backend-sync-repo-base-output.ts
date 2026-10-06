import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/diagnostics/bml-error';
import {
  type DiskFileChange,
  zDiskFileChange
} from '#common/types/disk/parts/file/disk-file-change';
import {
  type SyncRepo,
  zSyncRepo
} from '#common/types/disk/parts/repo/sync-repo';

export type ToBackendSyncRepoBaseOutput = {
  orgId: string;
  repoId: string;
  validationErrorsTotal: number;
  validationErrors?: BmlError[];
  devChangesToCommit: DiskFileChange[];
  syncRepo?: SyncRepo;
  needValidate?: boolean;
  structId?: string;
};

export let zToBackendSyncRepoBaseOutput = z.object({
  orgId: z.string(),
  repoId: z.string(),
  validationErrorsTotal: z.number(),
  validationErrors: z.array(zBmlError).nullish(),
  devChangesToCommit: z.array(zDiskFileChange),
  syncRepo: zSyncRepo.nullish(),
  needValidate: z.boolean().nullish(),
  structId: z.string().nullish()
});

assertTypesEqual<
  ToBackendSyncRepoBaseOutput,
  z.infer<typeof zToBackendSyncRepoBaseOutput>
>({ value: true });
