import type { SpaceUnit } from '#common/zod/backend/space-unit';

export type SpaceUnitX = SpaceUnit & {
  isMatched?: boolean;
};
