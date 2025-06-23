mod: ec1_m2_order_items
source: ec1_m2_order_items
location: mods/c2/ec1_m2_order_items.malloy
# build_metrics: ...

# chart: 4GI2L3ALYEO9LXWP3O92
# tiles:
# - title: Total Profit
#   query: 4GI2L3ALYEO9LXWP3O92
#   type: table
#   # model: ec1_m1
#   # select:
#   # - mf.total_profit

# dashboard: ec1_d1
# title: Ecommerce
# access_roles:
# - sales
# - marketing
# parameters:
# - filter: order_date
#   result: ts
#   conditions:
#   - last 5 years complete

# - filter: product_brand
#   result: string
#   suggest_model_dimension: ec1_m1.products.brand
#   conditions:
#   - any
# tiles:
# - title: Average Sale Price by Category
#   query: 4GI2L3ALYEO9LXWP3O92
#   # model: ec1_m1
#   # select:
#   # - products.category
#   # - order_items.average_sale_price
#   # sorts: order_items.average_sale_price desc
#   parameters:
#   - apply_to: orders.created___date
#     listen: order_date
#   - apply_to: products.brand
#     listen: product_brand
#   type: table
#   plate:
#     plate_width: 8
#     plate_height: 9
#     plate_x: 0
#     plate_y: 0