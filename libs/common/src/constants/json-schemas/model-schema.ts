import { JSONSchema7 } from 'json-schema';
import { CALCULATION_SCHEMA } from './parts/calculation-schema';
import { DIMENSION_SCHEMA } from './parts/dimension-schema';
import { FILTER_SCHEMA } from './parts/filter-schema';
import { MEASURE_SCHEMA } from './parts/measure-schema';
import { TIME_SCHEMA } from './parts/time-schema';

const commonJoinProperties: JSONSchema7['properties'] = {
  hidden: {
    type: 'boolean'
  },
  label: {
    type: 'string'
  },
  description: {
    type: 'string'
  },
  as: {
    type: 'string'
  },
  hide_fields: {
    type: 'array',
    items: {
      type: 'string'
    }
  },
  show_fields: {
    type: 'array',
    items: {
      type: 'string'
    }
  }
};

const fromJoin: JSONSchema7 = {
  properties: Object.assign(commonJoinProperties, {
    from_view: {
      type: 'string'
    }
  }),
  required: ['from_view', 'as']
};

const joinView: JSONSchema7 = {
  properties: Object.assign(commonJoinProperties, {
    join_view: {
      type: 'string'
    },
    // type: {
    //   type: 'enum'
    // },
    sql_on: {
      type: 'string'
    },
    sql_where: {
      type: 'string'
    }
  }),
  required: ['join_view', 'as']
};

export const MODEL_SCHEMA: JSONSchema7 = {
  properties: {
    model: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    label: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    access_roles: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    access_users: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    always_join: {
      type: 'string'
    },
    sql_always_where: {
      type: 'string'
    },
    sql_always_where_calc: {
      type: 'string'
    },
    udfs: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    joins: {
      type: 'array',
      items: {
        anyOf: [fromJoin, joinView]
      },
      contains: fromJoin
    },
    fields: {
      type: 'array',
      items: {
        anyOf: [
          DIMENSION_SCHEMA,
          TIME_SCHEMA,
          MEASURE_SCHEMA,
          CALCULATION_SCHEMA,
          FILTER_SCHEMA
        ]
      }
    }
  },
  required: ['model', 'connection', 'joins']
};
