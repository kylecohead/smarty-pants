import { fetchCategoryQuestions } from "../src/utils/opentdb.js";

const [, , categoryArg, amountArg] = process.argv;

const categoryId = Number.isFinite(Number(categoryArg)) ? Number(categoryArg) : 9;
const amount = Number.isFinite(Number(amountArg)) ? Number(amountArg) : 10;

console.log(`Fetching ${amount} questions for category ${categoryId}…`);
const data = await fetchCategoryQuestions(categoryId, "Test Category", amount);
console.log(`Retrieved ${data.length} questions.`);
if (data.length) {
  const sample = data[0];
  console.log(`Sample question: ${sample.question}`);
}
