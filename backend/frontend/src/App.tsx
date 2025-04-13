import { useEffect, useState } from "react";
import axios from "axios";

interface Question {
  question: string;
  answer?: string; // optional
  remaining?: number;
}

const App = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
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
      const response = await axios.get("http://127.0.0.1:8000/get-question");
      if (response.status === 200) {
        const data = response.data;

        if (data.quiz_end) {
          setIsQuizEnd(true); // Show modal if quiz ends
        } else {
          setQuestion(data);
        }
      }
    } catch (err) {
      console.error("Error fetching question", err);
      setError(true);
    }
  };

  // For submitting the answer
  const submitAnswer = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/submit-answer", {
        answer,
      });
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
      setAnswer("");
    }
  };

  // Resetting the quiz
  const restartQuiz = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/reset-quiz");
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
      <div className="bg-yellow-100 top-0 right-0 ">
        <p className="">{score}</p>
      </div>
      {/* For error */}
      <div className="bg-red-900 top-4 rounded-2xl flex items-center justify-center">
        {error && <p className="text-white">{error}</p>}
      </div>

      {/* For question */}
      <div className="bg-white m-10 h-full p-10 w-[510px]  shadow-[9px_9px_0px_0px_#000] flex justify-center">
        <div>
        {question && <div>Question: {question.question}</div>}
        <div>
        </div>
          <form action="" method="post" onSubmit={submitAnswer}>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-gray-500 rounded p-2"
            />
            <button
              className="bg-blue-700 text-white border-4 border-black  text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000] hover:bg-blue-800"
              type="submit"
            >
              Start Game
            </button>
          </form>
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
              className="mt-4 p-2 bg-blue-500 text-white border-4 border-black hover:bg-blue-700 shadow-[6px_8px_0_#000]"
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
