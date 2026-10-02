import type { Part } from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcPartSt = {
  ocPart: Part;
};

export let zOcPartSt = z
  .object({ ocPart: z.custom<Part>() })
  .meta({ id: 'OcPartSt' });

assertTypesEqual<OcPartSt, z.infer<typeof zOcPartSt>>({ value: true });
