FROM nginx:1.21.1

COPY apps/front/nginx-configs/nginx.front.conf /etc/nginx/nginx.conf

COPY dist/apps/front /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

