import React, { ReactEventHandler } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const Singup: React.FC = () => {
  const navigate = useNavigate();
  const rooturl = process.env.REACT_APP_ROOT_URL;
  const handleSingup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    fetch(rooturl + "/signup", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.message !== "Input validation failed") {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section>
      <form className="auth-form" onSubmit={handleSingup}>
        <input name="email" placeholder="Email" type="email" />
        <input name="username" placeholder="Username" type="text" />
        <input name="password" placeholder="Password" type="password" />
        <select name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit"> Continue </button>
      </form>
      <p>
        Already have an account ?{" "}
        <Link to="/login">
          <b>Sign in here</b>
        </Link>
      </p>
    </section>
  );
};

export default Singup;
