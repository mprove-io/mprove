import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskProjectAlreadyExistError,
  zDiskProjectAlreadyExistError
} from '#common/zod/disk/errors/disk-project-already-exist-error';

export type DiskCheckProjectDoesNotExistError = DiskProjectAlreadyExistError;

export let zDiskCheckProjectDoesNotExistError = zDiskProjectAlreadyExistError;

assertTypesEqual<
  DiskCheckProjectDoesNotExistError,
  z.infer<typeof zDiskCheckProjectDoesNotExistError>
>({ value: true });
