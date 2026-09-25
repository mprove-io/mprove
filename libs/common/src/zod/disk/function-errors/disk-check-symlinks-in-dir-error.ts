import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskSymlinksFoundError,
  zDiskSymlinksFoundError
} from '#common/zod/disk/errors/disk-symlinks-found-error';

export type DiskCheckSymlinksInDirError = DiskSymlinksFoundError;

export let zDiskCheckSymlinksInDirError = zDiskSymlinksFoundError;

assertTypesEqual<
  DiskCheckSymlinksInDirError,
  z.infer<typeof zDiskCheckSymlinksInDirError>
>({ value: true });
