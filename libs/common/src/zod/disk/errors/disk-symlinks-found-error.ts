import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskSymlinksFoundError = {
  code: 'DISK_SYMLINKS_FOUND';
  displayData: { dir: string; symlinks: string[] };
};

export let zDiskSymlinksFoundError = z.object({
  code: z.literal('DISK_SYMLINKS_FOUND'),
  displayData: z.object({ dir: z.string(), symlinks: z.array(z.string()) })
});

assertTypesEqual<
  DiskSymlinksFoundError,
  z.infer<typeof zDiskSymlinksFoundError>
>({ value: true });
