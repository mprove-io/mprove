import { api } from '../barrels/api';

export interface ChartOptions {
  animations: string; // boolean
  animations_line_num: number;

  gradient: string; // boolean
  gradient_line_num: number;

  legend: string; // boolean
  legend_line_num: number;

  legend_title: string;
  legend_title_line_num: number;

  tooltip_disabled: string; // boolean
  tooltip_disabled_line_num: number;

  round_edges: string; // boolean
  round_edges_line_num: number;

  round_domains: string; // boolean
  round_domains_line_num: number;

  show_grid_lines: string; // boolean
  show_grid_lines_line_num: number;

  timeline: string; // boolean
  timeline_line_num: number;

  interpolation: api.ChartInterpolationEnum;
  interpolation_line_num: number;

  auto_scale: string; // boolean
  auto_scale_line_num: number;

  doughnut: string; // boolean
  doughnut_line_num: number;

  explode_slices: string; // boolean
  explode_slices_line_num: number;

  labels: string; // boolean
  labels_line_num: number;

  color_scheme: api.ChartColorSchemeEnum;
  color_scheme_line_num: number;

  scheme_type: api.ChartSchemeTypeEnum;
  scheme_type_line_num: number;

  page_size: string;
  page_size_line_num: number;

  arc_width: string;
  arc_width_line_num: number;

  bar_padding: string;
  bar_padding_line_num: number;

  group_padding: string;
  group_padding_line_num: number;

  inner_padding: string;
  inner_padding_line_num: number;

  range_fill_opacity: string;
  range_fill_opacity_line_num: number;

  angle_span: string;
  angle_span_line_num: number;

  start_angle: string;
  start_angle_line_num: number;

  big_segments: string;
  big_segments_line_num: number;

  small_segments: string;
  small_segments_line_num: number;

  min: string;
  min_line_num: number;

  max: string;
  max_line_num: number;

  units: string;
  units_line_num: number;

  y_scale_min: string;
  y_scale_min_line_num: number;

  x_scale_max: string;
  x_scale_max_line_num: number;

  y_scale_max: string;
  y_scale_max_line_num: number;

  band_color: string;
  band_color_line_num: number;

  card_color: string;
  card_color_line_num: number;

  text_color: string;
  text_color_line_num: number;

  empty_color: string;
  empty_color_line_num: number;
}
