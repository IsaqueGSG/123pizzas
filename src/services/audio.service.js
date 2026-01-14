let audioUnlocked = false;
let audioElement = null;

export function unlockAudio() {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.volume = 1;
  }

  // tentativa silenciosa para "desbloquear"
  audioElement.src = "";
  audioElement.play().catch(() => {});

  audioUnlocked = true;
}

export function tocarAudio(src) {
  if (!audioUnlocked) {
    console.warn("🔇 Áudio bloqueado pelo navegador");
    return;
  }

  if (!audioElement) {
    audioElement = new Audio();
  }

  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.src = src;

  audioElement.play().catch((err) => {
    console.error("Erro ao tocar áudio:", err);
  });
}
