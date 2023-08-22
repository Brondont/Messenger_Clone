import React, { ReactEventHandler } from "react";
import { Link } from "react-router-dom";
import Logo from "../../public/images/367690509_814737896696440_8796982152716932950_n.jpg";
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
        if (resData.error) {
          console.log(resData.error, "status code:", resData.status);
          throw new Error(resData.error);
        }
        setUserLogin(resData.userId, resData.token);
        localStorage.setItem("userId", resData.userId);
        localStorage.setItem("token", resData.token);
        const remainingMiliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMiliseconds
        );
        localStorage.setItem("expiryDate", expiryDate.toISOString());
        console.log("user Logged in successfully !");
      })
      .catch((err) => {});
  };

  return (
    <section>
      {/* <img src={Logo} placeholder="Logo" /> */}
      <form className="auth-form" onSubmit={handleLogin}>
        <img src={Logo} placeholder="Logo" className="main-image" />
        <input name="email" placeholder="Email" type="email" />
        <input name="password" placeholder="Password" type="password" />
        <button type="submit"> Continue </button>
      </form>
      <p>
        Don't have an account?{" "}
        <Link to="/signup">
          <b>Sign up here</b>
        </Link>
      </p>
    </section>
  );
};

export default Login;
