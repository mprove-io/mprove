import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/types/backend/org';

export type ToBackendGetOrgOutput = {
  org: Org;
};

export let zToBackendGetOrgOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendGetOrgOutput' });

assertTypesEqual<ToBackendGetOrgOutput, z.infer<typeof zToBackendGetOrgOutput>>(
  { value: true }
);
