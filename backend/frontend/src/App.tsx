import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface Question {
  question: string;
  answer?: string;
  remaining?: number;
}

const App = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [isQuizEnd, setIsQuizEnd] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false); 
  const [error, setError] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [rupee, setRupee] = useState<number>(0);

  useEffect(() => {
    QuestionQuiz();
  }, []);
  const soundRef = useRef(new Audio("/src/assets/sound/isQuizEnd.wav"));

  // Fetch Question
  const QuestionQuiz = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get-question");
      if (response.status === 200) {
        const data = response.data;
        if (data.quiz_end) {
          setIsEnding(true); 
          setTimeout(() => {
            setIsQuizEnd(true); 
            soundRef.current.play();
          }, 2000);
        } else {
          setQuestion(data);
        }
      }
    } catch (err) {
      console.error("Error fetching question", err);
      setError(true);
    }
  };

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
        setIsEnding(true);
        setTimeout(() => {
          setIsQuizEnd(true);
        soundRef.current.play();
        }, 3000);
      } else {
        QuestionQuiz();
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setAnswer("");
    }
  };

  // Reset Quiz
  const restartQuiz = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/reset-quiz");
      if (response.status === 200) {
        setScore(0);
        setRupee(0);
        setIsQuizEnd(false);
        setIsEnding(false);
        setQuestion(response.data);
      }
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  const clickMe = () => {
    const clickSound = new Audio("/src/assets/sound/clickme.wav");
    clickSound.play();
  };

  return (
    <>
      {/* Header */}
      <div className="w-full bg-transparent py-6 px-10 flex justify-between items-center border-b-4 border-blue-950 shadow-xl fixed top-0 left-0 z-20 backdrop-blur-md">
        {/* Left: Game Title or Logo (optional) */}
        <div className="text-pink-600 font-extrabold text-3xl shadow-[3px_3px_0px_#000] tracking-widest">
          <span>🎮</span>KBC 
        </div>
        {/* Right: Rupee with gif */}
        <div className="text-black font-extrabold text-4xl flex items-center gap-3  tracking-widest">
          <img
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjY4cDJwM3ZmNmI5MnRmNnZyNGc0dzFybXphcHZwNDBkNnpxZHUzMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vn7fcFu3KtHi7V44IH/giphy.gif"
            alt="rupee gif"
            className="w-[40px] h-[40px]"
          />
          {rupee}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 top-4 rounded-2xl flex items-center justify-center text-white p-4 absolute z-10">
          <p>Error: Something went wrong!</p>
        </div>
      )}

      {/* Main Quiz Box or Ending Message */}
      <div className="h-screen flex items-center justify-center">
        <div
          className={`relative bg-white p-10 w-[510px] shadow-[9px_9px_0px_0px_#000] flex flex-col justify-center items-center gap-4 border-4 border-black transition-all duration-300 ${
            isEnding ? " grayscale" : ""
          }`}
        >
          {" "}
          {/* Increased opacity for the faded background */}
          {question && (
            <div className="mb-4 text-lg font-bold">
              <span className="text-center text-2xl">Question {5 - (question.remaining || 0)} out of 5</span><br />
              Question: {question.question}
            </div>
          )}
          <form
            onSubmit={submitAnswer}
            className="flex flex-col gap-4 w-full items-center"
          >
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-gray-500 rounded p-2 w-full 
                         disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-600"
              placeholder="Type your answer"
              required
              disabled={isEnding || !question}
            />

            <button
              className="bg-blue-700 text-white border-4 border-black text-sm px-4 py-2 shadow-[4px_4px_0px_0px_#000] 
                         hover:bg-blue-800 
                         disabled:bg-gray-400 disabled:text-gray-100 disabled:cursor-not-allowed"
              type="submit"
              onClick={clickMe}
              disabled={isEnding || !question}
            >
              Submit Answer
            </button>
          </form>
          {isEnding && !isQuizEnd && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white p-6 rounded-md shadow-md z-10 ">
              {" "}
              {/* Explicitly set opacity to 100 */}
              <p className="text-lg font-semibold">
                Quiz Ended. Please wait...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Final Result */}
      {isQuizEnd && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 ">
          <div className="bg-white p-8 w-[530px] border-4 border-black shadow-[6px_8px_0_#000] text-center">
            <h2 className="text-xl mb-4 font-bold"> Quiz Over</h2>
            <img
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25oMGRzcmI4Yzc1MHpzbHNvcXBoN3k5YjJlNmhmdnJ5cDdzaXc1bSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/6qFTJz4fDRkdy/giphy.gif"
              alt=""
              className="mx-auto mb-5"
            />

            <p>
              Your Score: <strong>{score}</strong>
            </p>
            <p>
              Your Rupees: <strong>{rupee}</strong>
            </p>
            <button
              onClick={restartQuiz}
              className="mt-4 px-6 py-2 bg-blue-500 text-white border-4 border-black hover:bg-blue-700 shadow-[6px_8px_0_#000]"
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
