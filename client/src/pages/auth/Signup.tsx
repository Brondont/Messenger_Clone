import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const Singup: React.FC = () => {
  const [errorMessage, setErrorMessages] = useState<ErrorServerResponse[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [signupForm, setSignupForm] = useState<Form>({
    email: {
      value: "",
      valid: true,
      validators: [isRequired, isEmail],
    },
    username: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 2 })],
    },
    password: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 5 })],
    },
  });

  const navigate = useNavigate();
  const rooturl = process.env.REACT_APP_ROOT_URL;

  const inputChangeHandler = (value: string, name: string) => {
    setSignupForm((prevState: Form) => {
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

  const handleSingup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);
    setErrorMessages([]);

    const formData = new FormData(e.currentTarget);
    fetch(rooturl + "/signup", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.error) {
          if (
            resData.error.statusCode === 409 ||
            resData.error.statusCode === 422
          ) {
            resData.error.data.map((err: ErrorServerResponse) => {
              setErrorMessages((prevState: ErrorServerResponse[]) => {
                return [...prevState, err];
              });
              setSignupForm((prevState) => {
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
        navigate("/login");
      })

      .catch((err) => {
        setIsloading(false);
        console.log(err);
      });
  };

  return (
    <section className="auth">
      <form className="auth__form" onSubmit={handleSingup}>
        <Input
          className="auth__form-input"
          name="email"
          placeholder="Email"
          type="text"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={signupForm.email.valid}
          value={signupForm.email.value}
          required={true}
        />
        <Input
          className="auth__form-input"
          name="username"
          placeholder="Username"
          type="text"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={signupForm.username.valid}
          value={signupForm.username.value}
          required={true}
        />
        <Input
          className="auth__form-input"
          name="password"
          placeholder="Password"
          type="password"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={signupForm.password.valid}
          value={signupForm.password.value}
          required={true}
        />
        <select className="auth__form-select" name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit"> Continue </button>
      </form>
      <p>
        Already have an account ?
        <Link to="/login">
          <b> Sign in here</b>
        </Link>
      </p>
    </section>
  );
};

export default Singup;
