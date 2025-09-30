/**
 * CONRAD
 * PAGE: Admin - Question Management
 * Features:
 *  - View questions by subject (Science, History, Culture, Sports, General)
 *  - Add, Edit, Delete questions
 *  - Tabbed interface for different subjects
 * Back: to previous page
 * Logout: to Home "/"
 */
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { QUESTIONS, SUBJECTS, getQuestionsBySubject } from "../data/questions.js";
import backgroundImg from "../assets/home-background.jpg";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Science");
  const [questions, setQuestions] = useState(QUESTIONS);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
      { id: "c", label: "" },
      { id: "d", label: "" },
    ],
    correctId: "a",
    subject: "Science"
  });

  // Get questions for the active tab
  const currentQuestions = questions.filter(q => q.subject === activeTab);

  // Handle adding a new question
  const handleAddQuestion = () => {
    if (!newQuestion.text.trim() || newQuestion.options.some(opt => !opt.label.trim())) {
      alert("Please fill in all fields");
      return;
    }

    const question = {
      ...newQuestion,
      id: `${activeTab.toLowerCase().charAt(0)}${Date.now()}`,
      subject: activeTab
    };

    setQuestions([...questions, question]);
    setNewQuestion({
      text: "",
      options: [
        { id: "a", label: "" },
        { id: "b", label: "" },
        { id: "c", label: "" },
        { id: "d", label: "" },
      ],
      correctId: "a",
      subject: activeTab
    });
    setShowAddForm(false);
  };

  // Handle editing a question
  const handleEditQuestion = (updatedQuestion) => {
    setQuestions(questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
    setEditingQuestion(null);
  };

  // Handle deleting a question
  const handleDeleteQuestion = (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat font-body text-smart-white relative"
      style={{
        color: 'white',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Header with navigation */}
      <div className="relative z-10 border-b-4 border-smart-purple bg-smart-dark-blue/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl border-4 border-smart-white bg-smart-light-blue px-6 py-3 font-button text-lg font-bold text-smart-black hover:bg-smart-green hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              ← Back
            </button>
            <h1 className="text-3xl lg:text-4xl font-heading font-black drop-shadow-2xl">
              <span className="text-smart-yellow">Q</span>
              <span className="text-smart-pink">U</span>
              <span className="text-smart-green">E</span>
              <span className="text-smart-orange">S</span>
              <span className="text-smart-light-blue">T</span>
              <span className="text-smart-purple">I</span>
              <span className="text-smart-red">O</span>
              <span className="text-smart-light-pink">N</span>
              <span className="text-smart-white"> </span>
              <span className="text-smart-green">A</span>
              <span className="text-smart-yellow">D</span>
              <span className="text-smart-orange">M</span>
              <span className="text-smart-light-blue">I</span>
              <span className="text-smart-pink">N</span>
            </h1>
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl border-4 border-smart-white bg-smart-red px-6 py-3 font-button text-lg font-bold text-smart-white hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="relative z-10 bg-smart-purple/90 backdrop-blur-sm border-b-4 border-smart-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-4">
            {Object.keys(SUBJECTS).map((subject, index) => {
              const colors = ['smart-blue', 'smart-blue', 'smart-blue', 'smart-blue', 'smart-blue'];
              const bgColor = colors[index % colors.length];
              return (
                <button
                  key={subject}
                  onClick={() => setActiveTab(subject)}
                  className={`rounded-2xl border-4 border-smart-white px-6 py-3 font-button text-lg font-bold whitespace-nowrap hover:scale-105 transition-all duration-200 shadow-2xl ${
                    activeTab === subject
                      ? `bg-${bgColor} text-smart-black`
                      : `bg-smart-black/70 text-smart-white hover:bg-${bgColor} hover:text-smart-black`
                  }`}
                >
                  {subject} ({questions.filter(q => q.subject === subject).length})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Question Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-2xl border-4 border-smart-white bg-smart-green px-8 py-4 font-button text-xl font-bold text-smart-black hover:bg-smart-yellow hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            + Add New {activeTab} Question
          </button>
        </div>

        {/* Add Question Form */}
        {showAddForm && (
          <div className="bg-smart-dark-blue/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl mb-8 border-4 border-smart-purple">
            <h3 className="text-2xl font-heading font-bold mb-6 text-smart-yellow drop-shadow-lg">Add New {activeTab} Question</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-button font-bold text-smart-white mb-3">
                  Question Text
                </label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                  className="w-full border-4 border-smart-light-blue rounded-2xl px-4 py-3 focus:ring-4 focus:ring-smart-green focus:border-smart-green bg-smart-white text-smart-black font-body text-lg"
                  rows="3"
                  placeholder="Enter your question..."
                />
              </div>
              
              {newQuestion.options.map((option, index) => {
                const optionColors = ['smart-red', 'smart-red', 'smart-red', 'smart-red'];
                const optionColor = optionColors[index];
                return (
                  <div key={option.id} className="flex items-center space-x-4">
                    <label className={`text-lg font-button font-bold text-${optionColor} w-12`}>
                      {option.id.toUpperCase()}:
                    </label>
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => {
                        const updatedOptions = [...newQuestion.options];
                        updatedOptions[index].label = e.target.value;
                        setNewQuestion({...newQuestion, options: updatedOptions});
                      }}
                      className="flex-1 border-4 border-smart-light-blue rounded-2xl px-4 py-3 focus:ring-4 focus:ring-smart-green focus:border-smart-green bg-smart-white text-smart-black font-body text-lg"
                      placeholder={`Option ${option.id.toUpperCase()}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctId === option.id}
                      onChange={() => setNewQuestion({...newQuestion, correctId: option.id})}
                      className="w-6 h-6 text-smart-green accent-smart-green"
                    />
                    <label className="text-lg font-button font-bold text-smart-green">Correct</label>
                  </div>
                );
              })}
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAddQuestion}
                  className="rounded-2xl border-4 border-smart-white bg-smart-green px-8 py-4 font-button text-lg font-bold text-smart-black hover:bg-smart-yellow hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  Add Question
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-2xl border-4 border-smart-white bg-smart-red px-8 py-4 font-button text-lg font-bold text-smart-white hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {currentQuestions.length === 0 ? (
            <div className="text-center py-16 bg-smart-dark-blue/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-smart-purple">
              <p className="text-smart-yellow text-2xl font-button font-bold mb-2 drop-shadow-lg">No {activeTab} questions found.</p>
              <p className="text-smart-white text-lg font-body">Click "Add New {activeTab} Question" to get started.</p>
            </div>
          ) : (
            currentQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                isEditing={editingQuestion?.id === question.id}
                onEdit={(q) => setEditingQuestion(q)}
                onSave={handleEditQuestion}
                onCancel={() => setEditingQuestion(null)}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({ question, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [editData, setEditData] = useState(question);

  useEffect(() => {
    setEditData(question);
  }, [question]);

  const handleSave = () => {
    if (!editData.text.trim() || editData.options.some(opt => !opt.label.trim())) {
      alert("Please fill in all fields");
      return;
    }
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-smart-dark-blue/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-smart-light-blue">
        <h3 className="text-2xl font-heading font-bold mb-6 text-smart-light-blue drop-shadow-lg">Editing Question</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-button font-bold text-smart-white mb-3">
              Question Text
            </label>
            <textarea
              value={editData.text}
              onChange={(e) => setEditData({...editData, text: e.target.value})}
              className="w-full border-4 border-smart-light-blue rounded-2xl px-4 py-3 focus:ring-4 focus:ring-smart-green focus:border-smart-green bg-smart-white text-smart-black font-body text-lg"
              rows="3"
            />
          </div>
          
          {editData.options.map((option, index) => {
            const optionColors = ['smart-red', 'smart-red', 'smart-red', 'smart-red'];
            const optionColor = optionColors[index];
            return (
              <div key={option.id} className="flex items-center space-x-4">
                <label className={`text-lg font-button font-bold text-${optionColor} w-12`}>
                  {option.id.toUpperCase()}:
                </label>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => {
                    const updatedOptions = [...editData.options];
                    updatedOptions[index].label = e.target.value;
                    setEditData({...editData, options: updatedOptions});
                  }}
                  className="flex-1 border-4 border-smart-light-blue rounded-2xl px-4 py-3 focus:ring-4 focus:ring-smart-green focus:border-smart-green bg-smart-white text-smart-black font-body text-lg"
                />
                <input
                  type="radio"
                  name={`correctAnswer-${question.id}`}
                  checked={editData.correctId === option.id}
                  onChange={() => setEditData({...editData, correctId: option.id})}
                  className="w-6 h-6 text-smart-green accent-smart-green"
                />
                <label className="text-lg font-button font-bold text-smart-green">Correct</label>
              </div>
            );
          })}
          
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="rounded-2xl border-4 border-smart-white bg-smart-green px-8 py-4 font-button text-lg font-bold text-smart-black hover:bg-smart-yellow hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="rounded-2xl border-4 border-smart-white bg-smart-red px-8 py-4 font-button text-lg font-bold text-smart-white hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-smart-dark-blue/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-smart-purple hover:border-smart-yellow transition-all duration-200 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-button font-bold text-smart-white flex-1 pr-4 drop-shadow-lg">{question.text}</h3>
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(question)}
            className="rounded-2xl border-4 border-smart-white bg-smart-light-blue px-6 py-3 font-button text-lg font-bold text-smart-black hover:bg-smart-green hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="rounded-2xl border-4 border-smart-white bg-smart-red px-6 py-3 font-button text-lg font-bold text-smart-white hover:bg-smart-orange hover:scale-105 transition-all duration-200 shadow-2xl"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => {
          const optionColors = ['smart-red', 'smart-red', 'smart-red', 'smart-red'];
          const optionColor = optionColors[index];
          const isCorrect = question.correctId === option.id;
          return (
            <div
              key={option.id}
              className={`p-4 rounded-2xl border-4 ${
                isCorrect
                  ? `bg-smart-green/20 border-smart-green text-smart-green`
                  : `bg-smart-black/30 border-${optionColor} text-${optionColor}`
              } backdrop-blur-sm`}
            >
              <span className="font-button font-bold text-lg">{option.id.toUpperCase()}:</span>{" "}
              <span className="font-body text-lg">{option.label}</span>
              {isCorrect && (
                <span className="ml-3 text-smart-green font-button font-bold text-lg drop-shadow-lg">✓ CORRECT</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
