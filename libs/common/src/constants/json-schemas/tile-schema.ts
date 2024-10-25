import { JSONSchema7 } from 'json-schema';
import { constants } from '~common/barrels/constants';
import { getTimezonesValues } from '~common/functions/get-timezones-values';

export const TILE_SCHEMA: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://docs.mprove.io/top/blockml/tile',
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    model: {
      type: 'string'
    },
    select: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    sorts: {
      type: 'string'
    },
    timezone: {
      type: 'string',
      enum: getTimezonesValues()
    },
    limit: {
      type: 'integer'
    },
    listen_filters: {
      additionalProperties: { type: 'string' }
    },
    default_filters: {
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    type: {
      type: 'string',
      enum: constants.CHART_TYPE_VALUES
    },
    data: {
      type: 'object',
      additionalProperties: false,
      properties: {
        hide_columns: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        x_field: {
          type: 'string'
        },
        y_field: {
          type: 'string'
        },
        y_fields: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        multi_field: {
          type: 'string'
        },
        value_field: {
          type: 'string'
        },
        previous_value_field: {
          type: 'string'
        }
      }
    },
    axis: {
      type: 'object',
      additionalProperties: false,
      properties: {
        x_axis_label: {
          type: 'string'
        },
        y_axis_label: {
          type: 'string'
        },
        show_x_axis_label: {
          type: 'boolean'
        },
        show_y_axis_label: {
          type: 'boolean'
        },
        x_axis: {
          type: 'boolean'
        },
        y_axis: {
          type: 'boolean'
        },
        show_axis: {
          type: 'boolean'
        }
      }
    },
    options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        color_scheme: {
          type: 'string',
          enum: constants.CHART_COLOR_SCHEME_VALUES
        },
        scheme_type: {
          type: 'string',
          enum: constants.CHART_SCHEME_TYPE_VALUES
        },
        interpolation: {
          type: 'string',
          enum: constants.CHART_INTERPOLATION_VALUES
        },
        card_color: {
          type: 'string'
        },
        empty_color: {
          type: 'string'
        },
        band_color: {
          type: 'string'
        },
        text_color: {
          type: 'string'
        },
        units: {
          type: 'string'
        },
        legend_title: {
          type: 'string'
        },
        legend: {
          type: 'boolean'
        },
        labels: {
          type: 'boolean'
        },
        format: {
          type: 'boolean'
        },
        show_data_label: {
          type: 'boolean'
        },
        tooltip_disabled: {
          type: 'boolean'
        },
        round_edges: {
          type: 'boolean'
        },
        round_domains: {
          type: 'boolean'
        },
        show_grid_lines: {
          type: 'boolean'
        },
        auto_scale: {
          type: 'boolean'
        },
        doughnut: {
          type: 'boolean'
        },
        explode_slices: {
          type: 'boolean'
        },
        gradient: {
          type: 'boolean'
        },
        animations: {
          type: 'boolean'
        },
        page_size: {
          type: 'integer'
        },
        arc_width: {
          type: 'number'
        },
        bar_padding: {
          type: 'integer'
        },
        group_padding: {
          type: 'integer'
        },
        inner_padding: {
          type: 'integer'
        },
        angle_span: {
          type: 'integer'
        },
        start_angle: {
          type: 'integer'
        },
        big_segments: {
          type: 'integer'
        },
        small_segments: {
          type: 'integer'
        },
        min: {
          type: 'integer'
        },
        max: {
          type: 'integer'
        },
        y_scale_min: {
          type: 'number'
        },
        y_scale_max: {
          type: 'number'
        },
        x_scale_max: {
          type: 'number'
        },
        format_number_data_label: {
          type: 'string'
        },
        format_number_value: {
          type: 'string'
        },
        format_number_axis_tick: {
          type: 'string'
        },
        format_number_y_axis_tick: {
          type: 'string'
        },
        format_number_x_axis_tick: {
          type: 'string'
        }
      }
    },
    plate: {
      type: 'object',
      additionalProperties: false,
      properties: {
        plate_width: {
          type: 'integer',
          minimum: 1,
          maximum: 24
        },
        plate_height: {
          type: 'integer',
          minimum: 1
        },
        plate_x: {
          type: 'integer',
          minimum: 0,
          maximum: 23
        },
        plate_y: {
          type: 'integer',
          minimum: 0
        }
      }
    }
  },
  required: ['title', 'model', 'select', 'type']
};
