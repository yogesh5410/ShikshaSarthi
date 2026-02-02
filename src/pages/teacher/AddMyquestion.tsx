import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast"; // adjust path if needed
const API_URL = import.meta.env.VITE_API_URL;
export default function AddMyQuestion() {
  const [formData, setFormData] = useState({
    subject: "",
    class: "",
    topic: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    hintText: "",
  });

  const [teacherId, setTeacherId] = useState("");
  const[quizId,setquizId]=useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("hello")
    const teacherCookie = Cookies.get("teacher");
    console.log(teacherCookie);
    if (teacherCookie) {
      const parsed = JSON.parse(teacherCookie);
      setTeacherId(parsed.teacher.teacherId);
      console.log(teacherId);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    if (e.target.name === "option" && index !== undefined) {
      const newOptions = [...formData.options];
      newOptions[index] = e.target.value;
      setFormData({ ...formData, options: newOptions });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher ID not found in cookies",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        teacherId,
        questionData: {
          subject: formData.subject,
          class: formData.class,
          topic: formData.topic,
          question: formData.question,
          options: formData.options,
          correctAnswer: formData.correctAnswer,
          hint: {
            text: formData.hintText,
          },
        },
      };

      const response = await axios.post(
       `${API_URL}/questions/teacher`,
        payload
      );

      toast({
        title: "Success",
        description: "Question added successfully",
      });

      // Optional: reset form
      setFormData({
        subject: "",
        class: "",
        topic: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        hintText: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Add a Question</h2>
      <input
        type="text"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Subject"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="class"
        value={formData.class}
        onChange={handleChange}
        placeholder="Class"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="topic"
        value={formData.topic}
        onChange={handleChange}
        placeholder="Topic"
        className="w-full p-2 border rounded"
      />
      <textarea
        name="question"
        value={formData.question}
        onChange={handleChange}
        placeholder="Question"
        className="w-full p-2 border rounded"
      />

      {formData.options.map((opt, idx) => (
        <input
          key={idx}
          type="text"
          name="option"
          value={opt}
          onChange={(e) => handleChange(e, idx)}
          placeholder={`Option ${idx + 1}`}
          className="w-full p-2 border rounded"
        />
      ))}

      <input
        type="text"
        name="correctAnswer"
        value={formData.correctAnswer}
        onChange={handleChange}
        placeholder="Correct Answer"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="hintText"
        value={formData.hintText}
        onChange={handleChange}
        placeholder="Hint (text)"
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Question
      </button>
    </form>
  );
}
