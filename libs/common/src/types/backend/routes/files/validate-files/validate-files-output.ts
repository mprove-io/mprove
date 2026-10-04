import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type StructX,
  zStructX
} from '#common/types/backend/parts/struct/struct-x';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';

export type ToBackendValidateFilesOutput = {
  repo: Repo;
  needValidate: boolean;
  struct: StructX;
};

export let zToBackendValidateFilesOutput = z
  .object({
    repo: zRepo,
    needValidate: z.boolean(),
    struct: zStructX
  })
  .meta({ id: 'ToBackendValidateFilesOutput' });

assertTypesEqual<
  ToBackendValidateFilesOutput,
  z.infer<typeof zToBackendValidateFilesOutput>
>({ value: true });
