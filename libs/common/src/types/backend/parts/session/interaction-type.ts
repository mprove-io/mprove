import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const interactionTypeValues = [
  'Message',
  'Question',
  'Permission',
  'Stop'
] as const;

export type InteractionType = (typeof interactionTypeValues)[number];

export let zInteractionType = z.enum(interactionTypeValues);

assertTypesEqual<InteractionType, z.infer<typeof zInteractionType>>({
  value: true
});
