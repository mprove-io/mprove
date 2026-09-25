import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskPathTraversalError,
  zDiskPathTraversalError
} from '#common/zod/disk/errors/disk-path-traversal-error';

export type ValidatePathUnderDirError = DiskPathTraversalError;

export let zValidatePathUnderDirError = zDiskPathTraversalError;

assertTypesEqual<
  ValidatePathUnderDirError,
  z.infer<typeof zValidatePathUnderDirError>
>({ value: true });
