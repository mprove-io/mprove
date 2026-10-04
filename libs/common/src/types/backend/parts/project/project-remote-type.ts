import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const projectRemoteTypeValues = ['Managed', 'GitClone'] as const;

export type ProjectRemoteType = (typeof projectRemoteTypeValues)[number];

export let zProjectRemoteType = z.enum(projectRemoteTypeValues);

assertTypesEqual<ProjectRemoteType, z.infer<typeof zProjectRemoteType>>({
  value: true
});
