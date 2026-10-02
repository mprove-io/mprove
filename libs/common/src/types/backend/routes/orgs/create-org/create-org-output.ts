import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Org, zOrg } from '#common/types/backend/parts/org';

export type ToBackendCreateOrgOutput = {
  org: Org;
};

export let zToBackendCreateOrgOutput = z
  .object({
    org: zOrg
  })
  .meta({ id: 'ToBackendCreateOrgOutput' });

assertTypesEqual<
  ToBackendCreateOrgOutput,
  z.infer<typeof zToBackendCreateOrgOutput>
>({ value: true });
