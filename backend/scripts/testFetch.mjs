const decodeText = (value = "") =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&shy;/g, "")
    .replace(/&eacute;/g, "é")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&auml;/g, "ä");

const shuffle = (items) =>
  items
    .map((item) => ({ sort: Math.random(), value: item }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

async function fetchQuestionsForCategory(categoryId, amount = 10) {
  const collected = new Map();
  let attempts = 0;

  while (collected.size < amount && attempts < 10) {
    attempts += 1;

    const response = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryId}`
    );
    const payload = await response.json();

    if (payload.response_code === 5) {
      const backoff = Math.min(1000, 250 + attempts * 100);
      console.log(`Rate limited (code=5). Waiting ${backoff}ms before retrying…`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      continue;
    }

    if (!payload.results?.length) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      continue;
    }

    for (const item of payload.results) {
      const questionText = decodeText(item.question);
      if (collected.has(questionText)) continue;

      const correct = decodeText(item.correct_answer);
      const incorrect = item.incorrect_answers.map((ans) => decodeText(ans));

      collected.set(questionText, {
        category: item.category,
        difficulty: item.difficulty,
        question: questionText,
        correct,
        options: shuffle([correct, ...incorrect])
      });

      if (collected.size >= amount) break;
    }
  }

  return Array.from(collected.values());
}

const [, , categoryArg, amountArg] = process.argv;

const categoryId = Number.isFinite(Number(categoryArg)) ? Number(categoryArg) : 9;
const amount = Number.isFinite(Number(amountArg)) ? Number(amountArg) : 10;

console.log(`Fetching ${amount} questions for category ${categoryId}…`);
const data = await fetchQuestionsForCategory(categoryId, amount);
console.log(`Retrieved ${data.length} questions.`);
if (data.length) {
  const sample = data[0];
  console.log(`Sample question: ${sample.question}`);
}
