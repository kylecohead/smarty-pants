export default function ProfileCard({
  user,
  stickmanStrokeWidth,
  stickmanColor,
  stickmanHeight,
  stickmanWidth,
  size = "default",
}) {
  // Get customization settings from props or localStorage
  const strokeWidth =
    stickmanStrokeWidth ??
    parseInt(localStorage.getItem("stickmanStrokeWidth")) ??
    3;
  const height =
    stickmanHeight ?? parseInt(localStorage.getItem("stickmanHeight")) ?? 120;
  const width =
    stickmanWidth ?? parseInt(localStorage.getItem("stickmanWidth")) ?? 80;
  const color =
    stickmanColor ??
    localStorage.getItem("stickmanColor") ??
    "smart-light-blue";

  // Size classes based on the size prop
  const sizeClasses = size === "large" ? "max-w-2xl p-12" : "max-w-xs p-4";

  return (
    <div>
      <div
        className={`rounded-xl border-2 border-${color} bg-[#1a237e] ${sizeClasses} mx-auto`}
      >
        {/* Username + Member Since */}
        <div className={`text-center ${size === "large" ? "mb-6" : "mb-3"}`}>
          <h2 className={`font-heading ${size === "large" ? "text-4xl" : "text-2xl"} font-bold text-${color}`}>
            {user.username.toUpperCase()}
          </h2>
          <p className={`font-body text-smart-white/60 ${size === "large" ? "text-lg" : "text-xs"}`}>
            EST. {new Date(user.memberSince).toLocaleDateString()}
          </p>
        </div>

        {/* Avatar - Customizable Stick Man */}
        <div className={`flex justify-center ${size === "large" ? "mb-8" : "mb-4"}`}>
          <div
            className="flex items-center justify-center"
            style={{
              width: `${Math.max(60, width * (size === "large" ? 1.5 : 0.8))}px`,
              height: `${Math.max(100, height * (size === "large" ? 1.5 : 0.8))}px`,
            }}
          >
            <svg
              width={width * (size === "large" ? 1.5 : 0.8)}
              height={height * (size === "large" ? 1.5 : 0.8)}
              viewBox={`0 0 ${width} ${height}`}
              className={`text-${color} opacity-80`}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Head */}
              <circle cx={width / 2} cy={height * 0.125} r={height * 0.1} />

              {/* Body */}
              <line
                x1={width / 2}
                y1={height * 0.225}
                x2={width / 2}
                y2={height * 0.625}
              />

              {/* Arms */}
              <line
                x1={width / 2}
                y1={height * 0.375}
                x2={width * 0.25}
                y2={height * 0.29}
              />
              <line
                x1={width / 2}
                y1={height * 0.375}
                x2={width * 0.75}
                y2={height * 0.29}
              />

              {/* Legs */}
              <line
                x1={width / 2}
                y1={height * 0.625}
                x2={width * 0.31}
                y2={height * 0.875}
              />
              <line
                x1={width / 2}
                y1={height * 0.625}
                x2={width * 0.69}
                y2={height * 0.875}
              />
            </svg>
          </div>
        </div>

        {/* User Stats - Compact */}
        <div className={`grid grid-cols-3 ${size === "large" ? "gap-4" : "gap-2"}`}>
          <div className={`rounded-lg border border-smart-green bg-smart-dark-blue ${size === "large" ? "p-4" : "p-2"} text-center`}>
            <p className={`font-body text-smart-white/60 ${size === "large" ? "text-sm mb-2" : "text-xs mb-1"}`}>Games</p>
            <p className={`font-heading ${size === "large" ? "text-xl" : "text-sm"} font-bold text-smart-green`}>
              {user.gamesPlayed}
            </p>
          </div>
          <div className={`rounded-lg border border-smart-yellow bg-smart-dark-blue ${size === "large" ? "p-4" : "p-2"} text-center`}>
            <p className={`font-body text-smart-white/60 ${size === "large" ? "text-sm mb-2" : "text-xs mb-1"}`}>
              High Score
            </p>
            <p className={`font-heading ${size === "large" ? "text-xl" : "text-sm"} font-bold text-smart-yellow`}>
              {user.highScore.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-lg border border-smart-light-blue bg-smart-dark-blue ${size === "large" ? "p-4" : "p-2"} text-center`}>
            <p className={`font-body text-smart-white/60 ${size === "large" ? "text-sm mb-2" : "text-xs mb-1"}`}>Wins</p>
            <p className={`font-heading ${size === "large" ? "text-xl" : "text-sm"} font-bold text-smart-light-blue`}>
              {user.wins}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
