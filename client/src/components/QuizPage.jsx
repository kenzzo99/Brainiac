import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();
  let { courseID, lessonTitle } = useParams();
  lessonTitle = decodeURIComponent(lessonTitle);
  useEffect(() => {
    // Fetch quiz data from backend
    console.log("Lesson Title: ", lessonTitle);
    fetch(`http://localhost:5000/api/quiz/${courseID}/${lessonTitle}`)
      .then((response) => response.json())
      .then((data) => setQuizData(data))
      .catch((error) => console.error("Error:", error));
  });

  const handleAnswerSelect = (answer) => {
    setAnswers([...answers, answer]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Send answers to backend
    fetch(`/api/quiz/${courseID}/${lessonTitle}/submit`, {
      method: "POST",
      body: JSON.stringify(answers),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => navigate("/quiz/submitted"));
  };

  if (!quizData) return "Loading...";

  const question = quizData.questions[currentQuestionIndex];

  return (
    <div>
      <h2>{question.question}</h2>
      {question.answers.map((answer, index) => (
        <Button key={index} onClick={() => handleAnswerSelect(answer)}>
          {answer}
        </Button>
      ))}
      <Button onClick={handleBack}>Back</Button>
      <Button onClick={() => navigate(`/curriculum/${courseID}`)}>Exit</Button>
      {currentQuestionIndex === quizData.questions.length - 1 && (
        <Button onClick={handleSubmit}>Submit</Button>
      )}
    </div>
  );
}

