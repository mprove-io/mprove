import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ValidatePathUnderDirError,
  zValidatePathUnderDirError
} from '#common/zod/node-common/function-errors/validate-path-under-dir-error';

export type RemovePathUnderDirError = ValidatePathUnderDirError;

export let zRemovePathUnderDirError = zValidatePathUnderDirError;

assertTypesEqual<
  RemovePathUnderDirError,
  z.infer<typeof zRemovePathUnderDirError>
>({ value: true });
