import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Ev, zEv } from '#common/types/backend/parts/ev';

export type EnvSt = {
  evs: Ev[];
};

export let zEnvSt = z.object({ evs: z.array(zEv) }).meta({ id: 'EnvSt' });

assertTypesEqual<EnvSt, z.infer<typeof zEnvSt>>({ value: true });
