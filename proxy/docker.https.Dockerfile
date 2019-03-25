FROM nginx:1.15.7

COPY nginx.https.conf /etc/nginx/conf.d/default.conf
