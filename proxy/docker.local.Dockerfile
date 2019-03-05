FROM nginx:1.15.7

COPY nginx.local.conf /etc/nginx/conf.d/default.conf

COPY auth.htpasswd /etc/nginx/auth.htpasswd
