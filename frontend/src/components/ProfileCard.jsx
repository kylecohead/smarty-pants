export default function ProfileCard({
  user,
  stickmanStrokeWidth,
  size = "default",
}) {
  // Get customization settings from props or localStorage
  const strokeWidth =
    stickmanStrokeWidth ??
    parseInt(localStorage.getItem("stickmanStrokeWidth")) ??
    3;
  const stickmanHeight =
    parseInt(localStorage.getItem("stickmanHeight")) ?? 120;
  const stickmanWidth = parseInt(localStorage.getItem("stickmanWidth")) ?? 80;
  const stickmanColor =
    localStorage.getItem("stickmanColor") ?? "smart-light-blue";

  // Size classes based on the size prop
  const sizeClasses = size === "large" ? "max-w-sm p-6" : "max-w-xs p-4";

  return (
    <div>
      <div
        className={`rounded-xl border-2 border-smart-light-blue bg-[#1a237e] ${sizeClasses} mx-auto`}
      >
        {/* Username + Member Since */}
        <div className="text-center mb-3">
          <h2 className="font-heading text-lg font-bold text-smart-white">
            {user.username.toUpperCase()}
          </h2>
          <p className="font-body text-smart-white/60 text-xs">
            EST. {new Date(user.memberSince).toLocaleDateString()}
          </p>
        </div>

        {/* Avatar - Customizable Stick Man */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: `${Math.max(80, stickmanWidth)}px`,
              height: `${Math.max(120, stickmanHeight)}px`,
            }}
          >
            <svg
              width={stickmanWidth}
              height={stickmanHeight}
              viewBox={`0 0 ${stickmanWidth} ${stickmanHeight}`}
              className={`text-${stickmanColor} opacity-80`}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Head */}
              <circle
                cx={stickmanWidth / 2}
                cy={stickmanHeight * 0.125}
                r={stickmanHeight * 0.1}
              />

              {/* Body */}
              <line
                x1={stickmanWidth / 2}
                y1={stickmanHeight * 0.225}
                x2={stickmanWidth / 2}
                y2={stickmanHeight * 0.625}
              />

              {/* Arms */}
              <line
                x1={stickmanWidth / 2}
                y1={stickmanHeight * 0.375}
                x2={stickmanWidth * 0.25}
                y2={stickmanHeight * 0.29}
              />
              <line
                x1={stickmanWidth / 2}
                y1={stickmanHeight * 0.375}
                x2={stickmanWidth * 0.75}
                y2={stickmanHeight * 0.29}
              />

              {/* Legs */}
              <line
                x1={stickmanWidth / 2}
                y1={stickmanHeight * 0.625}
                x2={stickmanWidth * 0.31}
                y2={stickmanHeight * 0.875}
              />
              <line
                x1={stickmanWidth / 2}
                y1={stickmanHeight * 0.625}
                x2={stickmanWidth * 0.69}
                y2={stickmanHeight * 0.875}
              />
            </svg>
          </div>
        </div>

        {/* User Stats - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-smart-green bg-smart-dark-blue p-2 text-center">
            <p className="font-body text-smart-white/60 text-xs mb-1">Games</p>
            <p className="font-heading text-sm font-bold text-smart-green">
              {user.gamesPlayed}
            </p>
          </div>
          <div className="rounded-lg border border-smart-yellow bg-smart-dark-blue p-2 text-center">
            <p className="font-body text-smart-white/60 text-xs mb-1">
              High Score
            </p>
            <p className="font-heading text-sm font-bold text-smart-yellow">
              {user.highScore.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-smart-light-blue bg-smart-dark-blue p-2 text-center">
            <p className="font-body text-smart-white/60 text-xs mb-1">Wins</p>
            <p className="font-heading text-sm font-bold text-smart-light-blue">
              {user.wins}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
