import { useEffect, useState } from 'react';
import axios from 'axios';

interface Question {
  question: string;
  answer?: string; // optional
  remaining?: number;
}

const App = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuizEnd, setIsQuizEnd] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [rupee, setRupee] = useState<number>(0);

  useEffect(() => {
    QuestionQuiz();
  }, []);

  // Function to fetch new question
  const QuestionQuiz = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/get-question');
      if (response.status === 200) {
        const data = response.data;

        if (data.quiz_end) {
          setIsQuizEnd(true); // Show modal if quiz ends
        } else {
          setQuestion(data);
        }
      }
    } catch (err) {
      console.error('Error fetching question', err);
      setError(true);
    }
  };

  // For submitting the answer
  const submitAnswer = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/submit-answer', { answer });
      const data = response.data;
      if (data.correct) {
        setScore((prev) => prev + 1);
        setRupee((rs) => rs + 1000);
      }

      if (data.end) {
        setIsQuizEnd(true); // Quiz ends after submitting the last answer
      } else {
        QuestionQuiz(); // Fetch the next question if the quiz isn't over
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setAnswer('');
    }
  };

  // Resetting the quiz
  const restartQuiz = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/reset-quiz');
      if (response.status === 200) {
        setScore(0);
        setRupee(0);
        setIsQuizEnd(false); // Hide the modal
        setQuestion(response.data); // Get the first question
      }
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  return (
    <>
      {/* For error */}
      <div className="bg-red-900 top-4 rounded-2xl flex items-center justify-center">
        {error && <p className="text-white">{error}</p>}
      </div>

      {/* For question */}
      <div className="bg-red-600">
        {question && <div>Question: {question.question}</div>}
        <div>
          <form action="" method="post" onSubmit={submitAnswer}>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-gray-500 rounded p-2"
            />
            <button type="submit">Submit your Answer</button>
          </form>
        </div>
        <div>
          <h1>Score Board</h1>
          <p>Score: {score}</p>
          <p>Rupee: {rupee}</p>
        </div>
      </div>

      {/* Modal for end of quiz */}
      {isQuizEnd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-md shadow-lg">
            <h2 className="text-xl mb-4">Quiz Over</h2>
            <p>Your Score: {score}</p>
            <p>Your Rupees: {rupee}</p>
            <button
              onClick={restartQuiz}
              className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
