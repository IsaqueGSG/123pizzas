let audioUnlocked = sessionStorage.getItem("audioUnlocked") === "true";
let audioElement = null;

export function unlockAudio() {
  if (audioUnlocked) return;

  try {
    audioElement = new Audio();
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

const audioPool = new Map();

export function tocarAudio(src) {
  const unlocked = sessionStorage.getItem("audioUnlocked") === "true";
  if (!unlocked) return;

  let audio = audioPool.get(src);

  if (!audio) {
    audio = new Audio(src);
    audio.volume = 1;
    audioPool.set(src, audio);
  }

  audio.currentTime = 0;
  audio.play().catch(console.error);
}


