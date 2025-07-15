# Backend de Streaming BRKK

## Pré-requisitos
- Node.js 18+
- Nginx com módulo RTMP (https://github.com/arut/nginx-rtmp-module)

## Estrutura de Pastas
```
backend/
  server.js         # Backend Node.js (serve HLS)
  nginx.conf        # Configuração do Nginx RTMP
  public/
    hls/            # Arquivos HLS gerados pelo Nginx
```

## Como rodar localmente

1. Instale as dependências do Node.js:
   ```bash
   npm install express
   ```

2. Crie a pasta para os arquivos HLS:
   ```bash
   mkdir -p public/hls
   ```

3. Inicie o backend Node.js:
   ```bash
   node server.js
   ```

4. Inicie o Nginx com a configuração customizada:
   ```bash
   nginx -c /CAMINHO/ATÉ/backend/nginx.conf
   ```
   (Altere o caminho conforme sua máquina)

5. Transmita via OBS Studio para:
   - URL do servidor: `rtmp://localhost/live`
   - Nome do stream: `stream` (ou outro nome)

6. O HLS ficará disponível em:
   - `http://localhost:8080/hls/stream.m3u8`

## Observações
- Para deploy na Render, consulte as instruções específicas (Render não suporta Nginx nativamente, mas pode rodar via Docker).
- Para produção, recomenda-se usar VPS/cloud e CDN para escalar. 