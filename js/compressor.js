// /js/compressor.js - diagnóstico
(async function(){
  const $ = id => document.getElementById(id);
  const status = $('mq-compressor-status');
  if(!status) return;
  status.textContent = 'Cargando FFmpeg...';
  try{
    if(!window.FFmpeg){
      await new Promise((res, rej)=>{
        const s=document.createElement('script');
        s.src='/js/ffmpeg.min.js';
        s.onload=res; s.onerror=()=>rej(new Error('No se pudo cargar /js/ffmpeg.min.js'));
        document.head.appendChild(s);
      });
    }
    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true, corePath: '/js/ffmpeg-core.js' });
    await ffmpeg.load();
    status.textContent = 'Listo. Elige un video.';
  }catch(e){
    status.textContent = 'Error FFmpeg: ' + e.message;
    console.error(e);
  }
})();
