import * as shape from 'd3-shape';
import { common } from '~front/barrels/common';

export function getChartCurve(interpolation: common.ChartInterpolationEnum) {
  if (common.isUndefined(interpolation)) {
    return null;
  }

  let curves = {
    basis: shape.curveBasis,
    basis_closed: shape.curveBasisClosed,
    bundle: shape.curveBundle.beta(1),
    cardinal: shape.curveCardinal,
    cardinal_closed: shape.curveCardinalClosed,
    catmull_rom: shape.curveCatmullRom,
    catmull_rom_closed: shape.curveCatmullRomClosed,
    linear: shape.curveLinear,
    linear_closed: shape.curveLinearClosed,
    monotone_x: shape.curveMonotoneX,
    monotone_y: shape.curveMonotoneY,
    natural: shape.curveNatural,
    step: shape.curveStep,
    step_after: shape.curveStepAfter,
    step_before: shape.curveStepBefore
  };

  return curves[interpolation];
}
