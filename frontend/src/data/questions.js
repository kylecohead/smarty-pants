// Temporary single-player questions for development. Replace later with web-scraped or backend-provided data.

/** @typedef {{ id: string, text: string, options: { id: string, label: string }[], correctId: string }} Question */

/** @type {Question[]} */
export const QUESTIONS = [
  {
    id: "q1",
    text: "What is the capital of France?",
    options: [
      { id: "a", label: "Paris" },
      { id: "b", label: "Madrid" },
      { id: "c", label: "Berlin" },
      { id: "d", label: "Rome" },
    ],
    correctId: "a",
  },
  {
    id: "q2",
    text: "Which planet is known as the Red Planet?",
    options: [
      { id: "a", label: "Venus" },
      { id: "b", label: "Mars" },
      { id: "c", label: "Jupiter" },
      { id: "d", label: "Saturn" },
    ],
    correctId: "b",
  },
  {
    id: "q3",
    text: "What is 9 × 7?",
    options: [
      { id: "a", label: "56" },
      { id: "b", label: "61" },
      { id: "c", label: "63" },
      { id: "d", label: "72" },
    ],
    correctId: "c",
  },
  {
    id: "q4",
    text: "Which language runs in a web browser?",
    options: [
      { id: "a", label: "C++" },
      { id: "b", label: "Java" },
      { id: "c", label: "Python" },
      { id: "d", label: "JavaScript" },
    ],
    correctId: "d",
  },
  {
    id: "q5",
    text: "Who wrote 'To Kill a Mockingbird'?",
    options: [
      { id: "a", label: "Harper Lee" },
      { id: "b", label: "Mark Twain" },
      { id: "c", label: "Ernest Hemingway" },
      { id: "d", label: "Jane Austen" },
    ],
    correctId: "a",
  },
];
