export default function ProfileCard({ user }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm p-6">
        {/* Username + Member Since */}
        <div className="text-center mb-4">
          <h2 className="font-heading text-3xl font-bold text-smart-white">
            {user.username?.toUpperCase() || "USER"}
          </h2>
          <p className="font-button text-smart-white/60 text-lg">
            EST. {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 rounded-2xl bg-smart-orange border-4 border-smart-white flex items-center justify-center overflow-hidden">
            {user.avatar || user.avatarUrl ? (
              <img
                src={user.avatar || user.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="font-heading text-6xl font-bold text-smart-black">
                {user.username?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="font-button text-smart-white/60 text-sm mb-1">
              Games Played
            </p>
            <p className="font-heading text-2xl font-bold text-smart-green">
              {user.gamesPlayed || 0}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="font-button text-smart-white/60 text-sm mb-1">
              High Score
            </p>
            <p className="font-heading text-2xl font-bold text-smart-yellow">
              {(user.highScore || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="font-button text-smart-white/60 text-sm mb-1">Wins</p>
            <p className="font-heading text-2xl font-bold text-smart-light-blue">
              {user.wins || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
