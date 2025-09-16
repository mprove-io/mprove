#!/usr/bin/env bash

echo "Seed started at $(date)"

mysql -u root -p${MYSQL_ROOT_PASSWORD} < /tmp/dwh-mysql-schema.sql

mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/distribution_centers.csv' INTO TABLE distribution_centers FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/inventory_items.csv' INTO TABLE inventory_items FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/order_items.csv' INTO TABLE order_items FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/orders.csv' INTO TABLE orders FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/products.csv' INTO TABLE products FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"
mysql -u root -p${MYSQL_ROOT_PASSWORD} ecommerce -e "LOAD DATA INFILE '/var/lib/mysql-files/users.csv' INTO TABLE users FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;"

echo "Seed completed at $(date)"
