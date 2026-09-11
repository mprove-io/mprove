import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskPathTraversalError = {
  code: 'DISK_PATH_TRAVERSAL';
  displayData?: { path: string };
};

export let zDiskPathTraversalError = z.object({
  code: z.literal('DISK_PATH_TRAVERSAL'),
  displayData: z.object({ path: z.string() }).nullish()
});

assertTypesEqual<
  DiskPathTraversalError,
  z.infer<typeof zDiskPathTraversalError>
>({ value: true });
