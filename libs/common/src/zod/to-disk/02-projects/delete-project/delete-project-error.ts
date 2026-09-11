import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskDeleteProjectError = never;

export let zToDiskDeleteProjectError = z.never();

assertTypesEqual<
  ToDiskDeleteProjectError,
  z.infer<typeof zToDiskDeleteProjectError>
>({ value: true });
