export function WaveformMotif() {
  return (
    <div className="hero-waveform" aria-hidden="true">
      <svg viewBox="0 0 720 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="heroWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(200, 90, 17, 0)" />
            <stop offset="18%" stopColor="rgba(212, 163, 115, 0.7)" />
            <stop offset="48%" stopColor="rgba(200, 90, 17, 0.95)" />
            <stop offset="78%" stopColor="rgba(212, 163, 115, 0.55)" />
            <stop offset="100%" stopColor="rgba(200, 90, 17, 0)" />
          </linearGradient>
        </defs>
        <path d="M0 110 C38 112, 56 78, 92 82 S142 142, 182 122 S226 46, 270 72 S326 150, 370 112 S426 34, 470 64 S520 140, 564 112 S620 58, 662 86 S700 106, 720 102" />
        <path d="M0 118 C46 120, 68 92, 102 96 S152 144, 196 124 S242 54, 286 78 S336 148, 382 118 S432 50, 474 72 S526 132, 570 110 S626 70, 672 92 S706 110, 720 108" />
      </svg>
    </div>
  );
}
