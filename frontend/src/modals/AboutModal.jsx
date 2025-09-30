/**
 * CONRAD
 * MODAL: About Game (from Home)
 * Close with ✕ in modal chrome
 *
 */
export default function AboutModal() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-200">About SMARTIE PANTS</h2>
      <p className="text-sm text-slate-400">
        Conrad is a cool dude who likes to build web apps and play games. He
        made this game for fun and to learn more about web development. Hope you
        enjoy it!
      </p>
      <p className="text-sm text-slate-400">
        Contact: conrad@gmail.com 
      </p>
      <img src="http://localhost:3000/uploads/conrad.jpg" alt="User avatar" />

    </div>
  );
}
