import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { ITrack } from "@/lib/api";

let currentAudio: HTMLAudioElement | null = null;

export function SoundtrackTrack({ track }: { track: ITrack }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio(track.previewUrl);
    a.addEventListener("ended", () => setPlaying(false));
    audioRef.current = a;
    return () => { a.pause(); a.src = ""; };
  }, [track.previewUrl]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      if (currentAudio && currentAudio !== a) currentAudio.pause();
      currentAudio = a;
      a.currentTime = 0;
      a.play().catch(() => {});
      setPlaying(true);
      // 30s preview window
      setTimeout(() => { if (currentAudio === a) { a.pause(); setPlaying(false); } }, 30000);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary transition-colors">
      <img src={track.artworkUrl100} alt="" className="w-14 h-14 rounded-md object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm line-clamp-1">{track.trackName}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{track.artistName}</p>
      </div>
      <button
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className={`relative w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 transition-transform hover:scale-110 ${playing ? "animate-pulse-ring" : ""}`}
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
    </div>
  );
}
