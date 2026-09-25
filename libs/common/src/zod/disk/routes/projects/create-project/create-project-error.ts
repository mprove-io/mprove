import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCheckProjectDoesNotExistError,
  zDiskCheckProjectDoesNotExistError
} from '#common/zod/disk/function-errors/disk-check-project-does-not-exist-error';
import {
  type DiskPrepareRemoteAndProdError,
  zDiskPrepareRemoteAndProdError
} from '#common/zod/disk/function-errors/disk-prepare-remote-and-prod-error';

export type ToDiskCreateProjectError =
  | DiskCheckProjectDoesNotExistError
  | DiskPrepareRemoteAndProdError;

export let zToDiskCreateProjectError = z.union([
  zDiskCheckProjectDoesNotExistError,
  zDiskPrepareRemoteAndProdError
]);

assertTypesEqual<
  ToDiskCreateProjectError,
  z.infer<typeof zToDiskCreateProjectError>
>({ value: true });
