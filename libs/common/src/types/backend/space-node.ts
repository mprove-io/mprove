import { z } from 'zod';
import {
  type SpaceFolder,
  zSpaceFolder
} from '#common/types/backend/space-folder';
import { type SpaceUnit, zSpaceUnit } from '#common/types/backend/space-unit';

export let zSpaceNode: z.ZodType<SpaceNode> = z.discriminatedUnion('type', [
  zSpaceFolder,
  zSpaceUnit
]);

export type SpaceNode = SpaceFolder | SpaceUnit;
