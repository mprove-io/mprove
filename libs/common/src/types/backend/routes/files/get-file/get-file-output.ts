import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type StructX, zStructX } from '#common/types/backend/parts/struct-x';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToBackendGetFileOutput = {
  repo: Repo;
  originalContent: string;
  content: string;
  struct: StructX;
  needValidate: boolean;
  isExist: boolean;
};

export let zToBackendGetFileOutput = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    struct: zStructX,
    needValidate: z.boolean(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToBackendGetFileOutput' });

assertTypesEqual<
  ToBackendGetFileOutput,
  z.infer<typeof zToBackendGetFileOutput>
>({ value: true });
