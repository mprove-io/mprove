import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const apiHostnameCheckPhaseValues = ['instant', 'resolved'] as const;

export type ApiHostnameCheckPhase =
  (typeof apiHostnameCheckPhaseValues)[number];

export let zApiHostnameCheckPhase = z.enum(apiHostnameCheckPhaseValues);

assertTypesEqual<ApiHostnameCheckPhase, z.infer<typeof zApiHostnameCheckPhase>>(
  {
    value: true
  }
);
