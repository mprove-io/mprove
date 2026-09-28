import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';

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
