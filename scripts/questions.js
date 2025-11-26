const QUESTION_LIMIT = 1;

export async function getQuizQuestions() {
  try {
    const response = await fetch("questions.json");

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const shuffledData = shuffle(data);
    return shuffledData.slice(0, QUESTION_LIMIT);
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

function shuffle(arr) {
  let lastQuestion = arr.length - 1;
  while (lastQuestion > 0) {
    const randQuestion = Math.floor(Math.random() * (lastQuestion + 1));
    [arr[lastQuestion], arr[randQuestion]] = [arr[randQuestion], arr[lastQuestion]];
    lastQuestion -= 1;
  }
  return arr;
}