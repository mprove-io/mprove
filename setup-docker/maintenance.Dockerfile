FROM nginx:1.21.1

COPY setup-docker/maintenance/nginx.maintenance.conf /etc/nginx/nginx.conf
COPY setup-docker/maintenance/index.html /etc/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

