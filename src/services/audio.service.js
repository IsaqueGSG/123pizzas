let audioUnlocked = sessionStorage.getItem("audioUnlocked") === "true";
let audioElement = null;

export function unlockAudio() {
  if (audioUnlocked) return;

  try {
    audioElement = new Audio();
    audioElement.src = campainha;
    audioElement.volume = 0;
    audioElement.muted = true;

    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audioUnlocked = true;
          sessionStorage.setItem("audioUnlocked", "true");
          console.log("🔊 Áudio desbloqueado com sucesso");
        })
        .catch((err) => {
          console.warn("🔇 Falha ao desbloquear áudio:", err);
        });
    } else {
      audioUnlocked = true;
      sessionStorage.setItem("audioUnlocked", "true");
    }
  } catch (err) {
    console.error("Erro no unlockAudio:", err);
  }
}

let audioPool = null;

export function tocarAudio(src) {
  const unlocked = sessionStorage.getItem("audioUnlocked") === "true";

  if (!unlocked) {
    console.warn("🔇 Áudio bloqueado pelo navegador");
    return;
  }

  try {
    if (!audioPool) {
      audioPool = new Audio(src);
      audioPool.volume = 1;
    }

    audioPool.currentTime = 0; // reinicia som
    audioPool.play().catch((err) => {
      console.error("Erro ao tocar áudio:", err);
    });
  } catch (err) {
    console.error("Erro geral de áudio:", err);
  }
}


