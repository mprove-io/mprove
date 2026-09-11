import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteOrgError = never;

export let zToDiskDeleteOrgError = z.never();

assertTypesEqual<ToDiskDeleteOrgError, z.infer<typeof zToDiskDeleteOrgError>>({
  value: true
});
