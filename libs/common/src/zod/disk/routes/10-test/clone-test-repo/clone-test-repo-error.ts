import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskCloneTestRepoError = never;

export let zToDiskCloneTestRepoError = z.never();

assertTypesEqual<
  ToDiskCloneTestRepoError,
  z.infer<typeof zToDiskCloneTestRepoError>
>({ value: true });
