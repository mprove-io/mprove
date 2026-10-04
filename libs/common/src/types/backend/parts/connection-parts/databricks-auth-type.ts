import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const databricksAuthTypeValues = ['OAuthM2M', 'PersonalAccessToken'] as const;

export type DatabricksAuthType = (typeof databricksAuthTypeValues)[number];

export let zDatabricksAuthType = z.enum(databricksAuthTypeValues);

assertTypesEqual<DatabricksAuthType, z.infer<typeof zDatabricksAuthType>>({
  value: true
});
