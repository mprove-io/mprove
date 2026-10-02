import { z } from 'zod';
import { zFileBasic } from '#common/types/blockml/parts/internal/file-basic';
import { zFilePartSpaceShape } from '#common/types/blockml/parts/internal/file-part-space-shape';

export let zFilePartSpace = zFileBasic
  .extend(zFilePartSpaceShape)
  .meta({ id: 'FilePartSpace' });

export type FilePartSpace = z.infer<typeof zFilePartSpace>;
