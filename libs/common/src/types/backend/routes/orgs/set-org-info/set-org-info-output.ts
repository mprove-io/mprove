import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/types/backend/org';

export type ToBackendSetOrgInfoOutput = {
  org: Org;
};

export let zToBackendSetOrgInfoOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgInfoOutput' });

assertTypesEqual<
  ToBackendSetOrgInfoOutput,
  z.infer<typeof zToBackendSetOrgInfoOutput>
>({ value: true });
