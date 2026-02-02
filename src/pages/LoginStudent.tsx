import React, { useState } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
export default function LoginStudent() {
  const [id, setid] = useState("");
  const [password, setPassword] = useState("");

  function changeid(e) {
    setid(e.target.value);
  }

  function changepassword(e) {
    setPassword(e.target.value);
  }

  async function handlesubmit() {
    console.log(id);
    console.log(password);

    const url = `${API_URL}/students/login`;
    const payload = {
      studentId: id,
      password: password,
    };

    try {
      const response = await axios.post(url, payload);
      const json_data = JSON.stringify(response.data);

      // ✅ Save to localStorage instead of cookie
      localStorage.setItem("Login_student", json_data);

      // ✅ Retrieve and print
      const storedData = localStorage.getItem("Login_student");
      console.log("Retrieved from localStorage:", storedData);
    } catch (err) {
      console.error("Login failed", err);
    }
  }

  return (
    <div>
      <div>Enter student id</div>
      <input value={id} onChange={changeid} />

      <div>Enter password</div>
      <input type="password" value={password} onChange={changepassword} />

      <div
        onClick={handlesubmit}
        style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}
      >
        Submit
      </div>
    </div>
  );
}
