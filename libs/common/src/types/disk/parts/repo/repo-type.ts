import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const repoTypeValues = ['production', 'dev', 'session'] as const;

export type RepoType = (typeof repoTypeValues)[number];

export let zRepoType = z.enum(repoTypeValues);

assertTypesEqual<RepoType, z.infer<typeof zRepoType>>({
  value: true
});
