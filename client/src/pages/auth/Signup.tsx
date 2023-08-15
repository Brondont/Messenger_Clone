import React, { ReactEventHandler } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";

const Singup: React.FC = () => {
  const rooturl = process.env.REACT_APP_ROOT_URL;
  const handleSingup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const username = formData.get("password") as string;
    const password = formData.get("password") as string;

    fetch(rooturl + "Singup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch((err) => {
        console.log("didnt get a response");
        console.log(err);
      });
  };

  return (
    <section>
      <form className="auth-form" onSubmit={handleSingup}>
        <input name="email" placeholder="Email" type="email" />
        <input name="username" placeholder="Username" type="text" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit"> Continue </button>
      </form>
      <p>
        Already have an account ? <Link to="/login">Sign in here</Link>
      </p>
    </section>
  );
};

export default Singup;
