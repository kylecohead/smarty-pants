/**
 * Author: Kyle
 * QuestionCard component - displays the question, timer, and answer options.
 */
export default function QuestionCard({
  question,
  timeLeftMs,
  questionDurationMs,
  youAnswered,
  questionResolved,
  waitingOnOthers,
  onAnswer,
}) {
  const colorClasses = [
    "bg-gradient-to-br from-[#FF8FAB] to-[#FF5F87]",
    "bg-gradient-to-br from-[#6EC5FF] to-[#4F8CFF]",
    "bg-gradient-to-br from-[#FFC857] to-[#FFAE42] text-black",
    "bg-gradient-to-br from-[#32D399] to-[#0FB57D]",
  ];
  const totalDuration = questionDurationMs || 6000;

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border-2 border-white bg-white/20 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-10">
      {/* Timer Progress Bar */}
      <div className="mb-10 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          Time Remaining
        </p>
        <div className="h-3 w-full overflow-hidden rounded-full border border-white/20 bg-white/10">
          <div
            className="h-full bg-smart-red transition-all duration-100 ease-linear"
            style={{
              width: `${
                totalDuration > 0 ? (timeLeftMs / totalDuration) * 100 : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question Text */}
      <p className="font-heading text-3xl font-black leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
        {question?.text}
      </p>

      {/* Answer Options */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {question?.options.map((opt, i) => {
          const baseClass = colorClasses[i % colorClasses.length];
          const disabledClass =
            youAnswered || questionResolved
              ? "opacity-60 cursor-not-allowed"
              : "";

          return (
            <button
              key={opt.id}
              onClick={() => onAnswer(opt.id)}
              disabled={youAnswered || questionResolved}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 px-6 py-8 text-xl font-bold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${baseClass} ${disabledClass}`}
            >
              <span className="relative z-10 block drop-shadow-sm">
                {opt.label}
              </span>
              <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20 group-focus-visible:opacity-20" />
            </button>
          );
        })}
      </div>

      {/* Waiting Message */}
      {waitingOnOthers && (
        <p className="mt-6 text-sm font-medium text-white/70">
          Waiting for other players to finish…
        </p>
      )}
    </div>
  );
}
