import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Repo } from '#common/zod/disk/repo';
import { zRepo } from '#common/zod/disk/repo';

export type ToDiskGetFileResponsePayload = {
  repo: Repo;
  originalContent: string;
  content: string;
  isExist: boolean;
};

export let zToDiskGetFileResponsePayload = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToDiskGetFileResponsePayload' });

assertTypesEqual<
  ToDiskGetFileResponsePayload,
  z.infer<typeof zToDiskGetFileResponsePayload>
>({ value: true });
