import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/types/backend/struct-x';
import { type Repo, zRepo } from '#common/types/disk/repo';

export type ToBackendDeleteFileOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export let zToBackendDeleteFileOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendDeleteFileOutput' });

assertTypesEqual<
  ToBackendDeleteFileOutput,
  z.infer<typeof zToBackendDeleteFileOutput>
>({ value: true });
