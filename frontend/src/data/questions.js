// Quiz questions organized by subject categories

/** @typedef {{ id: string, text: string, options: { id: string, label: string }[], correctId: string, subject: string }} Question */

// Available subjects with their background images
export const SUBJECTS = {
  Science: "backScience.jpg",
  History: "backHistory.jpg", 
  Culture: "backCulture.jpg",
  Sports: "backSports.jpg",
  General: "backGeneral.jpg"
};

/** @type {Question[]} */
export const QUESTIONS = [
  // Science Questions
  {
    id: "s1",
    text: "Which planet is known as the Red Planet?",
    options: [
      { id: "a", label: "Venus" },
      { id: "b", label: "Mars" },
      { id: "c", label: "Jupiter" },
      { id: "d", label: "Saturn" },
    ],
    correctId: "b",
    subject: "Science",
  },
  {
    id: "s2",
    text: "What is the chemical symbol for gold?",
    options: [
      { id: "a", label: "Go" },
      { id: "b", label: "Gd" },
      { id: "c", label: "Au" },
      { id: "d", label: "Ag" },
    ],
    correctId: "c",
    subject: "Science",
  },
  {
    id: "s3",
    text: "How many bones are in the human body?",
    options: [
      { id: "a", label: "206" },
      { id: "b", label: "208" },
      { id: "c", label: "204" },
      { id: "d", label: "210" },
    ],
    correctId: "a",
    subject: "Science",
  },
  
  // History Questions
  {
    id: "h1",
    text: "In which year did World War II end?",
    options: [
      { id: "a", label: "1944" },
      { id: "b", label: "1945" },
      { id: "c", label: "1946" },
      { id: "d", label: "1947" },
    ],
    correctId: "b",
    subject: "History",
  },
  {
    id: "h2",
    text: "Who was the first President of the United States?",
    options: [
      { id: "a", label: "Thomas Jefferson" },
      { id: "b", label: "John Adams" },
      { id: "c", label: "George Washington" },
      { id: "d", label: "Benjamin Franklin" },
    ],
    correctId: "c",
    subject: "History",
  },
  
  // Culture Questions
  {
    id: "c1",
    text: "Who wrote 'To Kill a Mockingbird'?",
    options: [
      { id: "a", label: "Harper Lee" },
      { id: "b", label: "Mark Twain" },
      { id: "c", label: "Ernest Hemingway" },
      { id: "d", label: "Jane Austen" },
    ],
    correctId: "a",
    subject: "Culture",
  },
  {
    id: "c2",
    text: "Which artist painted the Mona Lisa?",
    options: [
      { id: "a", label: "Vincent van Gogh" },
      { id: "b", label: "Pablo Picasso" },
      { id: "c", label: "Leonardo da Vinci" },
      { id: "d", label: "Michelangelo" },
    ],
    correctId: "c",
    subject: "Culture",
  },
  
  // Sports Questions
  {
    id: "sp1",
    text: "How many players are on a basketball team on the court at one time?",
    options: [
      { id: "a", label: "4" },
      { id: "b", label: "5" },
      { id: "c", label: "6" },
      { id: "d", label: "7" },
    ],
    correctId: "b",
    subject: "Sports",
  },
  {
    id: "sp2",
    text: "In which sport would you perform a slam dunk?",
    options: [
      { id: "a", label: "Tennis" },
      { id: "b", label: "Basketball" },
      { id: "c", label: "Volleyball" },
      { id: "d", label: "Baseball" },
    ],
    correctId: "b",
    subject: "Sports",
  },
  
  // General Questions
  {
    id: "g1",
    text: "What is the capital of France?",
    options: [
      { id: "a", label: "Paris" },
      { id: "b", label: "Madrid" },
      { id: "c", label: "Berlin" },
      { id: "d", label: "Rome" },
    ],
    correctId: "a",
    subject: "General",
  },
  {
    id: "g2",
    text: "What is 9 × 7?",
    options: [
      { id: "a", label: "56" },
      { id: "b", label: "61" },
      { id: "c", label: "63" },
      { id: "d", label: "72" },
    ],
    correctId: "c",
    subject: "General",
  },
  {
    id: "g3",
    text: "Which language runs in a web browser?",
    options: [
      { id: "a", label: "C++" },
      { id: "b", label: "Java" },
      { id: "c", label: "Python" },
      { id: "d", label: "JavaScript" },
    ],
    correctId: "d",
    subject: "General",
  },
];

// Helper function to get questions by subject
export const getQuestionsBySubject = (subject) => {
  return QUESTIONS.filter(q => q.subject === subject);
};
