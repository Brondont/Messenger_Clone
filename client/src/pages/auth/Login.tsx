import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../public/images/367690509_814737896696440_8796982152716932950_n.jpg";
import "./Auth.css";

import Input from "../../components/form/input/Input";
import { isRequired, isEmail, isLength } from "../../util/validators";
import { ValidatorFunction } from "../../util/validators";

export type ErrorServerResponse = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

type Form = {
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
  const [loginForm, setLoginForm] = useState<Form>({
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

  const rooturl = process.env.REACT_APP_ROOT_URL;

  const inputChangeHandler = (value: string, name: string) => {
    setLoginForm((prevState: Form) => {
      const fieldConfig = prevState[name];
      let isValid = true;
      fieldConfig.validators.map((validator: ValidatorFunction) => {
        isValid = isValid && validator(value);
        return validator;
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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);
    setErrorMessages([]);

    const formData = new FormData(e.currentTarget);

    fetch(rooturl + "/login", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
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
              return err;
            });
            setIsloading(false);
            return;
          } else {
            throw resData.error;
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
        console.log("some unexpected error occured: ", err);
      });
  };
  return (
    <section>
      <form className="auth-form" onSubmit={handleLogin}>
        <img src={Logo} alt="Logo" className="main-image" />
        <Input
          name="email"
          placeholder="Email"
          type="text"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={loginForm.email.valid}
          value={loginForm.email.value}
          required={true}
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={loginForm.password.valid}
          value={loginForm.password.value}
          required={true}
        />
        <button type="submit"> Continue </button>
      </form>
      <p>
        Don't have an account?
        <Link to="/signup">
          <b> Sign up here</b>
        </Link>
      </p>
      <p>
        Forgot your password?
        <Link to="/reset-password">
          <b> Reset password</b>
        </Link>
      </p>
    </section>
  );
};

export default Login;
