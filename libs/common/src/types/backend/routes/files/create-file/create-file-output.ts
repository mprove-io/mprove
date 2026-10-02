import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToBackendCreateFileOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendCreateFileOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendCreateFileOutput' });

assertTypesEqual<
  ToBackendCreateFileOutput,
  z.infer<typeof zToBackendCreateFileOutput>
>({ value: true });
