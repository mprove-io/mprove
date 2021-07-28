import { ChartColorSchemeEnum } from '~common/enums/chart/chart-color-scheme.enum';
import { ChartInterpolationEnum } from '~common/enums/chart/chart-interpolation.enum';
import { ChartSchemeTypeEnum } from '~common/enums/chart/chart-scheme-type.enum';
import { ChartTileHeightEnum } from '~common/enums/chart/chart-tile-height.enum';
import { ChartTileWidthEnum } from '~common/enums/chart/chart-tile-width.enum';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ChartViewSizeEnum } from '~common/enums/chart/chart-view-size.enum';

export const CHART_DEFAULT_TYPE = ChartTypeEnum.Line;
export const CHART_DEFAULT_TITLE = 'Title';

export const CHART_DEFAULT_INTERPOLATION = ChartInterpolationEnum.Linear;
export const CHART_DEFAULT_COLOR_SCHEME = ChartColorSchemeEnum.Cool;
export const CHART_DEFAULT_SCHEME_TYPE = ChartSchemeTypeEnum.Ordinal;

export const CHART_DEFAULT_CARD_COLOR = 'rgba(255, 255, 255, 100)';
export const CHART_DEFAULT_EMPTY_COLOR = 'rgba(255, 255, 255, 100)';
export const CHART_DEFAULT_BAND_COLOR = 'rgba(255, 255, 255, 100)';
export const CHART_DEFAULT_TEXT_COLOR: string = null;

export const CHART_DEFAULT_X_AXIS_LABEL = 'X axis label';
export const CHART_DEFAULT_Y_AXIS_LABEL = 'Y axis label';
export const CHART_DEFAULT_LEGEND_TITLE = 'Legend title';
export const CHART_DEFAULT_UNITS = 'Units';

export const CHART_DEFAULT_PAGE_SIZE = 5;
export const CHART_DEFAULT_ARC_WIDTH = 0.25;
export const CHART_DEFAULT_BAR_PADDING = 8;
export const CHART_DEFAULT_GROUP_PADDING = 16;
export const CHART_DEFAULT_INNER_PADDING = 8;
export const CHART_DEFAULT_RANGE_FILL_OPACITY = 0.15;
export const CHART_DEFAULT_ANGLE_SPAN = 240;
export const CHART_DEFAULT_START_ANGLE = -120;
export const CHART_DEFAULT_BIG_SEGMENTS = 10;
export const CHART_DEFAULT_SMALL_SEGMENTS = 5;
export const CHART_DEFAULT_MIN = 0;
export const CHART_DEFAULT_MAX: number = null;
export const CHART_DEFAULT_X_SCALE_MAX: number = null;
export const CHART_DEFAULT_Y_SCALE_MIN: number = null;
export const CHART_DEFAULT_Y_SCALE_MAX: number = null;

export const CHART_DEFAULT_TIMELINE = false;
export const CHART_DEFAULT_SHOW_AXIS = true;

export const CHART_DEFAULT_LABELS = true;
export const CHART_DEFAULT_SHOW_DATA_LABEL = true;
export const CHART_DEFAULT_AUTO_SCALE = false;
export const CHART_DEFAULT_LEGEND = true;
export const CHART_DEFAULT_DOUGHNUT = false;
export const CHART_DEFAULT_EXPLODE_SLICES = false;
export const CHART_DEFAULT_X_AXIS = true;
export const CHART_DEFAULT_Y_AXIS = true;
export const CHART_DEFAULT_SHOW_X_AXIS_LABEL = false;
export const CHART_DEFAULT_SHOW_Y_AXIS_LABEL = false;
export const CHART_DEFAULT_ROUND_DOMAINS = true;
export const CHART_DEFAULT_SHOW_GRID_LINES = true;
export const CHART_DEFAULT_ROUND_EDGES = true;
export const CHART_DEFAULT_TOOLTIP_DISABLED = false;
export const CHART_DEFAULT_GRADIENT = false;
export const CHART_DEFAULT_ANIMATIONS = false;

export const CHART_DEFAULT_TILE_WIDTH = ChartTileWidthEnum._6;
export const CHART_DEFAULT_TILE_HEIGHT = ChartTileHeightEnum._500;
export const CHART_DEFAULT_VIEW_SIZE = ChartViewSizeEnum.Auto;
export const CHART_DEFAULT_VIEW_WIDTH = 600;
export const CHART_DEFAULT_VIEW_HEIGHT = 200;
