import { z } from 'zod';
import {
  type SpaceFolder,
  zSpaceFolder
} from '#common/types/backend/parts/space-folder';
import {
  type SpaceUnit,
  zSpaceUnit
} from '#common/types/backend/parts/space-unit';

export let zSpaceNode: z.ZodType<SpaceNode> = z.discriminatedUnion('type', [
  zSpaceFolder,
  zSpaceUnit
]);

export type SpaceNode = SpaceFolder | SpaceUnit;
