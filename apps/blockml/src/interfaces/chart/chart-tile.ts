import { apiToBlockml } from '~blockml/barrels/api-to-blockml';

export interface ChartTile {
  tile_width: apiToBlockml.ChartTileWidthEnum;
  tile_width_line_num: number;

  tile_height: apiToBlockml.ChartTileHeightEnum;
  tile_height_line_num: number;

  view_size: apiToBlockml.ChartViewSizeEnum;
  view_size_line_num: number;

  view_width: string; // number
  view_width_line_num: number;

  view_height: string; // number
  view_height_line_num: number;
}
