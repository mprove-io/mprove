import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export type SpaceUnitX = SpaceUnit & {
  isMatched?: boolean;
};
