---
name: mprove-build-malloy-model
description: Build Mprove Model based on Malloy sources
---

# Build Mprove Model based on Malloy sources

## Docs

https://docs.mprove.io/docs/reference/model-malloy
https://docs.malloydata.dev/documentation

## Some parts of Malloy language are not supported in Mprove Models yet

Do not use it:

- Malloy Nest
- Malloy Calculations
- Malloy Views

## Joins

Joins in Malloy are lazy. Actual SQL joins calculated based on selected and filtered fields.
When you build Mprove Malloy Model - join all possible leaf sources on model top source level (if they make sense).

For tables that have relationhips A->B->C:

- source A should join source B
- source A should join source C after joining B, using keys of B and C

Use this flat style instead of joining source D that already have source C joined.

Ensure that each table has its own malloy source (leaf) in a separate file for reusability.

## Mprove Model Labels

Use this pattern for top level source:

```
#(mprove) model
#(mprove) label="Order Items (Postgres)"
#(mprove) top_label="Order Items"
source: c1_order_items is c1_order_items_tx extend {
  join_one: orders is c1_orders_tx on order_id = orders.order_id
```

This way we remove "c1\_" prefix in Mprove UI Model Labels.

## Build Model Metrics

Mprove Reports are based on Metrics.

When you build Mprove Malloy Model - always build metrics if dwh table schema has meaningful time field.

Use this pattern:

```
##! experimental{sql_functions}
source: c1_orders_table is c1_postgres.table('ecommerce.orders') extend {}
source: c1_orders_tx is c1_orders_table extend {
  primary_key: order_id
  #(mprove) build_metrics field_group="Created At"
  dimension:
    created_at_ts is sql_timestamp(""" TIMESTAMP 'epoch' + ${created_at} * INTERVAL '1 second' """)
    created_at_day is created_at_ts.day
    created_at_week is created_at_ts.week
    created_at_month is created_at_ts.month
    created_at_quarter is created_at_ts.quarter
    created_at_year is created_at_ts.year
    created_at_hour is created_at_ts.hour
    created_at_minute is created_at_ts.minute
    created_at_second is created_at_ts.second
  measure: orders_count is count()
}
```

Add `##! experimental{sql_functions}` malloy source tag if using sql functions like `sql_timestamp`.

It is important to have all time parts to be present (.day, .week, .month, etc) so user will be able to select any Time Detail in UI.

These tags build metrics for all measures of Mprove Malloy Model for a field_group of time dimensions.

```
  #(mprove) build_metrics field_group="Created At"
```

Dimensions in field_group must be based on the same "\_ts" field.

Mprove tags `build_metrics` and `field_group` should be applied at the sources (prefer "\_tx") that have the time columns which are useful. Create "\_ts" dimension based on time column.

# Types

Use and apply malloy types for sources that are based on tables (prefer "\_table" suffix sources).
The type should list all columns of the source table.

https://docs.malloydata.dev/documentation/experiments/virtual_sources
