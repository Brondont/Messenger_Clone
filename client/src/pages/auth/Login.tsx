import React, { ReactEventHandler } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const Login: React.FC<{
  setUserLogin: (userId: string, token: string) => void;
}> = ({ setUserLogin }) => {
  const rooturl = process.env.REACT_APP_ROOT_URL;
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    fetch(rooturl + "/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        setUserLogin(resData.userId, resData.token);
        localStorage.setItem("userId", resData.userId);
        localStorage.setItem("token", resData.token);
        console.log("user Logged in successfully !");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section>
      <form className="auth-form" onSubmit={handleLogin}>
        <input name="email" placeholder="Email" type="email" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit"> Continue </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </section>
  );
};

export default Login;
