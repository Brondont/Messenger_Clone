import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../public/images/367690509_814737896696440_8796982152716932950_n.jpg";
import "./Auth.css";

import Input from "../../components/Form/Input/Input";
import { isRequired, isEmail, isLength } from "../../util/validators";
import { ValidatorFunction, IsLengthFunction } from "../../util/validators";
import { setegid } from "process";

export type ErrorServerResponse = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

type LoginForm = {
  [key: string]: {
    value: string;
    valid: boolean;
    validators: ValidatorFunction[];
  };
};

const Login: React.FC<{
  setUserLogin: (userId: string, token: string) => void;
}> = ({ setUserLogin }) => {
  const [errorMessage, setErrorMessages] = useState<ErrorServerResponse[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: {
      value: "",
      valid: true,
      validators: [isRequired, isEmail],
    },
    password: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 5 })],
    },
  });

  const inputChangeHandler = (value: string, name: string) => {
    setLoginForm((prevState: LoginForm) => {
      const fieldConfig = prevState[name];
      let isValid = true;
      fieldConfig.validators.map((validator) => {
        isValid = isValid && validator(value);
      });
      const updatedForm = {
        ...prevState,
        [name]: {
          ...prevState[name],
          valid: isValid,
          value: value,
        },
      };
      return updatedForm;
    });
  };

  const rooturl = process.env.REACT_APP_ROOT_URL;
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    fetch(rooturl + "/login", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          if (resData.error.statusCode === 500) {
            throw resData.error;
          }
          if (
            resData.error.statusCode === 422 ||
            resData.error.statusCode === 401 ||
            resData.error.statusCode === 404
          ) {
            resData.error.data.map((err: ErrorServerResponse) => {
              setErrorMessages((prevState: ErrorServerResponse[]) => {
                return [...prevState, err];
              });
              setLoginForm((prevState) => {
                return {
                  ...prevState,
                  [err.path]: {
                    ...prevState[err.path],
                    valid: false,
                  },
                };
              });
            });
            setIsloading(false);
            return;
          }
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
        setIsloading(false);
      })
      .catch((err) => {
        setIsloading(false);
        throw err;
      });
  };
  return (
    <section>
      {/* <img src={Logo} placeholder="Logo" /> */}
      <form className="auth-form" onSubmit={handleLogin}>
        <img src={Logo} placeholder="Logo" className="main-image" />
        <Input
          name="email"
          placeholder="Email"
          type="text"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={loginForm.email.valid}
          required={true}
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={loginForm.password.valid}
          required={true}
        />
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
