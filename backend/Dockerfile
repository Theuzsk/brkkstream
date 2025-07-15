FROM node:18

# Instala o Nginx com módulo RTMP
RUN apt-get update && \
    apt-get install -y build-essential libpcre3 libpcre3-dev libssl-dev zlib1g-dev git && \
    git clone https://github.com/arut/nginx-rtmp-module.git && \
    wget http://nginx.org/download/nginx-1.25.4.tar.gz && \
    tar -zxvf nginx-1.25.4.tar.gz && \
    cd nginx-1.25.4 && \
    ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module && \
    make && make install

WORKDIR /app

COPY . .

RUN npm install

# Cria a pasta HLS se não existir
RUN mkdir -p /app/public/hls

# Copia a configuração do nginx
COPY nginx.conf /usr/local/nginx/conf/nginx.conf

EXPOSE 8080 1935

CMD /usr/local/nginx/sbin/nginx && node server.js