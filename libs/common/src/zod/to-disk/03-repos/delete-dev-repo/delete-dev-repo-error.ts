import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteDevRepoError = never;

export let zToDiskDeleteDevRepoError = z.never();

assertTypesEqual<
  ToDiskDeleteDevRepoError,
  z.infer<typeof zToDiskDeleteDevRepoError>
>({ value: true });
