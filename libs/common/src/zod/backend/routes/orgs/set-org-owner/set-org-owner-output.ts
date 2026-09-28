import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/zod/backend/org';

export type ToBackendSetOrgOwnerOutput = {
  org: Org;
};

export let zToBackendSetOrgOwnerOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendSetOrgOwnerOutput' });

assertTypesEqual<
  ToBackendSetOrgOwnerOutput,
  z.infer<typeof zToBackendSetOrgOwnerOutput>
>({ value: true });
