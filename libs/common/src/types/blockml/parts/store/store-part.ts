import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type StorePart = {
  reqTemplate: string;
  reqFunction: string;
  reqJsonParts: string;
  reqBody: string;
  reqUrlPath: string;
};

export let zStorePart = z
  .object({
    reqTemplate: z.string(),
    reqFunction: z.string(),
    reqJsonParts: z.string(),
    reqBody: z.string(),
    reqUrlPath: z.string()
  })
  .meta({ id: 'StorePart' });

assertTypesEqual<StorePart, z.infer<typeof zStorePart>>({ value: true });
