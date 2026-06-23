import { useState, useEffect } from "react";

interface Props {
  isRecording?: boolean;
}

export default function CamcorderHUD({ isRecording = false }: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ts = time.toLocaleTimeString("en-US", { hour12: false });
  const date = time.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });

  return (
    <>
      {/* Top-left: REC indicator */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
        {isRecording && (
          <span className="w-3 h-3 rounded-full bg-red-500 animate-[recBlink_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
        <span className="font-mono text-xs text-cream-dark tracking-widest opacity-70">
          {isRecording ? "● REC" : "■ STANDBY"}
        </span>
      </div>

      {/* Top-right: timestamp + battery */}
      <div className="fixed top-4 right-4 z-50 text-right pointer-events-none">
        <div className="font-mono text-xs text-cream-dark tracking-wider opacity-70">
          <div>{date}  {ts}</div>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-sky-film opacity-80">▮▮▮▯</span>
            <span className="text-[10px]">BATT</span>
          </div>
        </div>
      </div>

      {/* Bottom-left: tape counter */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
        <div className="font-mono text-[10px] text-cream-dark opacity-50 tracking-widest">
          <div>SP ■ HI-FI</div>
          <div className="text-sky-film opacity-80">T-120</div>
        </div>
      </div>

      {/* Bottom-right: zoom level */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <div className="font-mono text-[10px] text-cream-dark opacity-50 tracking-widest text-right">
          <div>ZOOM  <span className="text-sky-film">×1.0</span></div>
          <div>AF ◉ AUTO</div>
        </div>
      </div>
    </>
  );
}
