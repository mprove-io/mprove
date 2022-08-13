#!/bin/bash

clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --multiquery \
  --query='
DROP TABLE IF EXISTS c_db.distribution_centers;
DROP TABLE IF EXISTS c_db.inventory_items;
DROP TABLE IF EXISTS c_db.order_items;
DROP TABLE IF EXISTS c_db.orders;
DROP TABLE IF EXISTS c_db.products;
DROP TABLE IF EXISTS c_db.users;

CREATE TABLE c_db.distribution_centers
(
    `distribution_center_id` String,
    `name` String
)
ENGINE = Log;

CREATE TABLE c_db.inventory_items
(
    `inventory_item_id` String,
    `product_id` String,
    `distribution_center_id` String,
    `actual_cost` Float32
)
ENGINE = Log;

CREATE TABLE c_db.order_items
(
    `order_item_id` String,
    `order_id` String,
    `inventory_item_id` String,
    `sale_price` Float32
)
ENGINE = Log;

CREATE TABLE c_db.orders
(
    `order_id` String,
    `user_id` String,
    `created_at` Int64,
    `status` String
)
ENGINE = Log;

CREATE TABLE c_db.products
(
    `product_id` String,
    `cost` Float32,
    `retail_price` Float32,
    `brand` String,
    `category` String
)
ENGINE = Log;

CREATE TABLE c_db.users
(
    `user_id` String,
    `first_name` String,
    `last_name` String,
    `city` String,
    `state` String,
    `age` Int8,
    `gender` String,
    `email` String,
    `traffic_source` String
)
ENGINE = Log;
'

cat /tmp/csv/distribution_centers.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.distribution_centers FORMAT CSVWithNames
'

cat /tmp/csv/inventory_items.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.inventory_items FORMAT CSVWithNames
'

cat /tmp/csv/order_items.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.order_items FORMAT CSVWithNames
'

cat /tmp/csv/orders.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.orders FORMAT CSVWithNames
'

cat /tmp/csv/products.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.products FORMAT CSVWithNames
'

cat /tmp/csv/users.csv | \
  clickhouse client \
  --user=$CLICKHOUSE_USER \
  --password=$CLICKHOUSE_PASSWORD \
  --database=c_db \
  --query='
Insert into c_db.users FORMAT CSVWithNames
'