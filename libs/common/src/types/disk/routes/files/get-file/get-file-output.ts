import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

export type ToDiskGetFileOutput = {
  repo: Repo;
  originalContent: string;
  content: string;
  isExist: boolean;
};

export let zToDiskGetFileOutput = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToDiskGetFileOutput' });

assertTypesEqual<ToDiskGetFileOutput, z.infer<typeof zToDiskGetFileOutput>>({
  value: true
});
