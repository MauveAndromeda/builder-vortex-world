import { useEffect, useRef } from "react";
import { useThemeOverride } from "./use-theme-override";

const MUSIC_TRACKS = {
  day: "https://cdn.pixabay.com/audio/2022/02/22/audio_d1bb2b8b-fd9d-4de5-9de7-1b6b9fb7b1b8.mp3",
  night: "https://cdn.pixabay.com/audio/2021/08/03/audio_0b7b5bc7-bb7e-4ca8-9b3b-e4b9e6e7b4a8.mp3",
  rain: "https://cdn.pixabay.com/audio/2022/03/10/audio_c7d2d3b9-8e4b-4f9b-9a2c-3e1f4e5a6b7c.mp3",
  storm: "https://cdn.pixabay.com/audio/2021/09/12/audio_f8e9d2a3-5b6c-4e7d-8f9a-1b2c3d4e5f6g.mp3",
};

export function useBackgroundMusic(mode: string, weather: string) {
  const { musicEnabled } = useThemeOverride();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string | null>(null);

  useEffect(() => {
    if (!musicEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const getTrack = () => {
      if (weather === "rain" || weather === "storm") return MUSIC_TRACKS.storm;
      if (mode === "night" || mode === "dusk" || mode === "dawn") return MUSIC_TRACKS.night;
      return MUSIC_TRACKS.day;
    };

    const track = getTrack();
    
    if (track === currentTrackRef.current && audioRef.current) {
      return; // Same track, keep playing
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio();
    audio.src = track;
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";

    const playPromise = audio.play().catch(() => {
      // Autoplay blocked, user needs to interact first
    });

    audioRef.current = audio;
    currentTrackRef.current = track;

    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [musicEnabled, mode, weather]);

  return null;
}
