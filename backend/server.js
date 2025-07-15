const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Servir arquivos HLS gerados pelo Nginx/FFmpeg
app.use('/hls', express.static(path.join(__dirname, 'public/hls')));

app.get('/', (req, res) => {
  res.send('Servidor de streaming BRKK rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 