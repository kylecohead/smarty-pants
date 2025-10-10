/**
 * CONRAD
 * PAGE: Edit Question Types
 * Simple skeleton with heading and back.
 * Back: to Admin "/admin"
 */
import { useNavigate } from "react-router-dom";

export default function QuestionTypes() {
  const navigate = useNavigate();
  return (
    <div className="center-screen">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 rounded-lg border px-4 py-2 hover:bg-slate-100"
      >
        ← Admin
      </button>

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Edit Question Types</h1>
        <p className="text-sm text-slate-600">
          Add your question type editing UI here.
        </p>
      </div>
    </div>
  );
}
