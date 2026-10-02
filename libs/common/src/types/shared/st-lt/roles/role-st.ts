import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Gv, zGv } from '#common/types/backend/parts/gv';

export type RoleSt = {
  gvs: Gv[];
};

export let zRoleSt = z.object({ gvs: z.array(zGv) }).meta({ id: 'RoleSt' });

assertTypesEqual<RoleSt, z.infer<typeof zRoleSt>>({ value: true });
