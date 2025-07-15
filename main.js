// ===== CONFIGURAÇÃO DO BACKEND =====
// Altere para o domínio do backend na Render após o deploy (ex: 'https://seusite.onrender.com')
const BACKEND_URL = '';
// Se estiver em branco, usa o mesmo domínio do frontend

// Senhas pré-definidas
const VIEWER_PASSWORD = 'brkk123';
const STREAMER_PASSWORD = 'stream'; // senha forte

let currentStream = null; // Para controlar o stream ativo

const app = document.getElementById('app');

function getBackendUrl(path) {
  if (BACKEND_URL) {
    // Remove barra final se houver
    return BACKEND_URL.replace(/\/$/, '') + path;
  }
  return path;
}

function renderLogin() {
  app.innerHTML = `
    <h2>Login</h2>
    <form id="login-form">
      <label>Senha:
        <input type="password" id="password" required />
      </label>
      <button type="submit">Entrar</button>
    </form>
  `;
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    if (pwd === VIEWER_PASSWORD) {
      renderViewer();
    } else if (pwd === STREAMER_PASSWORD) {
      renderStreamer();
    } else {
      alert('Senha incorreta!');
    }
  };
}

function renderStreamer() {
  app.innerHTML = `
    <h2>Painel do Streamer</h2>
    <form id="stream-config">
      <label>Método de transmissão:
        <select id="stream-method">
          <option value="obs">OBS Studio (RTMP)</option>
          <option value="navegador">Navegador</option>
        </select>
      </label>
      <div id="obs-instructions" style="display:none;margin:10px 0 18px 0;"></div>
      <label>Nome da Live:
        <input type="text" id="live-name" placeholder="Ex:Nome do anime" />
      </label>
      <label>Qualidade:
        <select id="quality">
          <option value="1080p">1080p60</option>
          <option value="720p">720p60</option>
          <option value="480p">480p</option>
          <option value="360p">360p</option>
          <option value="160p">160p</option>
          <option value="auto">Automático</option>
        </select>
      </label>
      <label>FPS:
        <select id="fps">
          <option value="60">60 fps</option>
          <option value="30">30 fps</option>
        </select>
      </label>
      <label>
        <input type="checkbox" id="mic-audio" checked /> Capturar microfone
      </label>
      <button type="button" id="start-stream">Iniciar Transmissão</button>
      <button type="button" id="stop-stream" style="display:none;background:#6d28d9;">Parar Transmissão</button>
    </form>
    <div id="stream-preview" style="margin-top:24px;"></div>
    <button id="logout" style="margin-top:24px;">Sair</button>
  `;
  document.getElementById('logout').onclick = renderLogin;
  document.getElementById('start-stream').onclick = () => {
    const method = document.getElementById('stream-method').value;
    if (method === 'obs') {
      alert('Transmita pelo OBS Studio usando as instruções abaixo.');
    } else {
      startStream();
    }
  };
  document.getElementById('stop-stream').onclick = stopStream;
  document.getElementById('stream-method').onchange = function() {
    const val = this.value;
    const obsDiv = document.getElementById('obs-instructions');
    if (val === 'obs') {
      obsDiv.style.display = 'block';
      obsDiv.innerHTML = `
        <b>Configuração OBS Studio:</b><br>
        URL do servidor: <span style="color:#b47aff">rtmp://${window.location.hostname}/live</span><br>
        Nome do stream: <span style="color:#b47aff">stream</span><br>
        <span style="font-size:0.95em;color:#aaa">(Altere o endereço para o backend na Render após o deploy, se necessário)</span>
      `;
      if (BACKEND_URL) {
        obsDiv.innerHTML = obsDiv.innerHTML.replace(
          `rtmp://${window.location.hostname}/live`,
          `rtmp://${BACKEND_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}/live`
        );
      }
      document.getElementById('start-stream').innerText = 'Transmitir pelo OBS';
    } else {
      obsDiv.style.display = 'none';
      document.getElementById('start-stream').innerText = 'Iniciar Transmissão';
    }
  };
  document.getElementById('stream-method').onchange();
}

function renderViewer() {
  app.innerHTML = `
    <h2>Assistir Live</h2>
    <div id="live-player" style="background:#111;min-height:240px;text-align:center;">
      <video id="hls-video" controls style="width:100%;max-width:100%;border-radius:10px;background:#000;display:none"></video>
      <p id="aguardando-msg">Aguardando transmissão...</p>
    </div>
    <label>Qualidade:
      <select id="viewer-quality">
        <option value="1080p">1080p60</option>
        <option value="720p">720p60</option>
        <option value="480p">480p</option>
        <option value="360p">360p</option>
        <option value="160p">160p</option>
        <option value="auto">Automático</option>
      </select>
    </label>
    <button id="fullscreen">Tela Cheia</button>
    <button id="logout" style="margin-top:24px;">Sair</button>
    <div style="font-size:0.95em;color:#b47aff;margin-top:18px;text-align:center;">
      Este site foi criado para ajudar o streamer <b>BRKK</b> a assistir animes e continuar monetizando.<br>
      Para apoiar e manter este projeto/solução funcionando, <b>continue acompanhando a live na plataforma da Kick</b>.<br>
      Caso contrário, este site poderá ser encerrado.
    </div>
  `;
  document.getElementById('logout').onclick = renderLogin;
  document.getElementById('fullscreen').onclick = () => {
    const player = document.getElementById('live-player');
    if (player.requestFullscreen) player.requestFullscreen();
  };
  iniciarHLSPlayer();
}

function iniciarHLSPlayer() {
  const video = document.getElementById('hls-video');
  const aguardando = document.getElementById('aguardando-msg');
  // Monta o endereço do HLS conforme o backend
  const hlsUrl = getBackendUrl('/hls/stream.m3u8');
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      video.style.display = 'block';
      aguardando.style.display = 'none';
      video.play();
    });
    hls.on(Hls.Events.ERROR, function(event, data) {
      if (data.type === 'networkError') {
        video.style.display = 'none';
        aguardando.style.display = 'block';
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = hlsUrl;
    video.addEventListener('loadedmetadata', function() {
      video.style.display = 'block';
      aguardando.style.display = 'none';
      video.play();
    });
  }
}

function startStream() {
  const preview = document.getElementById('stream-preview');
  preview.innerHTML = '<p>Selecione o que deseja compartilhar:</p>';
  const fps = parseInt(document.getElementById('fps').value, 10);
  navigator.mediaDevices.getDisplayMedia({ 
    video: { frameRate: { ideal: fps, max: fps } }, 
    audio: document.getElementById('mic-audio').checked 
  })
    .then(stream => {
      currentStream = stream;
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.controls = true;
      video.style.maxWidth = '100%';
      preview.innerHTML = '';
      preview.appendChild(video);
      document.getElementById('start-stream').style.display = 'none';
      document.getElementById('stop-stream').style.display = 'inline-block';
      // Aqui seria feita a transmissão P2P (WebRTC) para outros usuários, mas no GitHub Pages só mostramos o preview local
    })
    .catch(err => {
      preview.innerHTML = '<p style="color:#f55">Erro ao capturar tela: ' + err.message + '</p>';
    });
}

function stopStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  const preview = document.getElementById('stream-preview');
  preview.innerHTML = '<p>Transmissão parada.</p>';
  document.getElementById('start-stream').style.display = 'inline-block';
  document.getElementById('stop-stream').style.display = 'none';
}

// Inicializa
renderLogin(); 