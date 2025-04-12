from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample Questions
question_answer = [
    {"question": "How many continents are there on Earth?", "answer": ["seven", "7"]},
    {"question": "What is the highest mountain in the world?", "answer": "mount everest"},
    {"question": 'Who wrote the play "Romeo and Juliet"?', "answer": "william shakespeare"},
    {"question": "In what year did World War II end?", "answer": "1945"},
    {"question": "What is the capital city of France?", "answer": "paris"},
    {"question": "What is the chemical symbol for water?", "answer": "h2o"}
]

# Track state
score = 0
rupee = 0
used_questions = []
current_question = {}
quiz_end = False

# Model for answer input
class AnswerRequest(BaseModel):
    answer: str

# Endpoint to get a new question
@app.get("/get-question")
def get_question():
    global current_question, quiz_end, score, rupee

    if len(used_questions) == len(question_answer):
        quiz_end = True
        return {"message": "Quiz khatam ho chuki hai!", "quiz_end": True}

    remaining_questions = [q for q in question_answer if q not in used_questions]

    if not remaining_questions:
        quiz_end = True
        return {"message": "Saray questions dikh chukay hain.", "quiz_end": True}

    current_question = random.choice(remaining_questions)
    used_questions.append(current_question)

    return {
        "question": current_question["question"],
        "remaining": len(question_answer) - len(used_questions)
    }

# Endpoint to submit answer
@app.post("/submit-answer")
def submit_answer(answer_req: AnswerRequest):
    global score, rupee, current_question, used_questions

    user_answer = answer_req.answer.strip().lower()
    correct_answer = current_question.get("answer")

    # Handle single or multiple correct answers
    if isinstance(correct_answer, list):
        correct_answers = [ans.strip().lower() for ans in correct_answer]
    else:
        correct_answers = [correct_answer.strip().lower()]

    is_correct = user_answer in correct_answers

    if is_correct:
        score += 1
        rupee += 1000

    # Check if that was the last question AFTER submitting answer
    is_quiz_end = len(used_questions) == len(question_answer)

    return {
        "correct": is_correct,
        "message": "Bilkul sahi jawab!" if is_correct else "Ap ka jawab ghalat hai!",
        "score": score,
        "rupee": rupee,
        "end": is_quiz_end
    }

# Endpoint to reset quiz
@app.get("/reset-quiz")
def reset_quiz():
    global score, rupee, used_questions, current_question, quiz_end

    # Reset state
    score = 0
    rupee = 0
    used_questions = []
    current_question = {}
    quiz_end = False

    # Get first question
    return get_question()
