from fastapi import FastAPI, Request
from pydantic import BaseModel
import random

app = FastAPI()

# Static list of questions
questions_answers = [
    {"question": "How many continents are there on Earth?", "answer": "seven"},
    {"question": "What is the highest mountain in the world?", "answer": "mount everest"},
    {"question": 'Who wrote the play "Romeo and Juliet"?', "answer": "william shakespeare"},
    {"question": "In what year did World War II end?", "answer": "1945"},
    {"question": "What is the capital city of France?", "answer": "paris"},
    {"question": "What is the chemical symbol for water?", "answer": "h2o"}
]

# To track score and question (for simplicity in this demo)
current_question = {}
score = 0
rupee = 0
questions_answered = 0

# Model to accept answer
class AnswerRequest(BaseModel):
    answer: str

@app.get("/get-question")
def get_question():
    global current_question, questions_answered
    if questions_answered < len(questions_answers):
        current_question = random.choice(questions_answers)
        questions_answered += 1
        return {"question": current_question["question"]}
    else:
        return {"message": "The quiz is over! Final score will be displayed."}

@app.post("/submit-answer")
def submit_answer(answer_req: AnswerRequest):
    global score, rupee
    user_answer = answer_req.answer.strip().lower()
    correct_answer = current_question["answer"].strip().lower()

    if user_answer == correct_answer:
        score += 1
        rupee += 1000
        return {
            "correct": True,
            "message": "Bilkul sahi jawab!",
            "score": score,
            "rupee": rupee
        }
    else:
        return {
            "correct": False,
            "message": "Ap ka jawab ghalat hy!",
            "correct_answer": correct_answer,
            "score": score,
            "rupee": rupee
        }

@app.get("/end-quiz")
def end_quiz():
    global score, rupee
    return {
        "message": "Kul mila kar ap ki rkm ho gayi hai!",
        "total_rupee": rupee
    }
