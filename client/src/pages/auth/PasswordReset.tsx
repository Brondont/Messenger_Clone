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

const ResetPassword: React.FC = () => {
  const [errorMessage, setErrorMessages] = useState<ErrorServerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordResetForm, setPasswordResetForm] = useState<Form>({
    email: {
      value: "",
      valid: true,
      validators: [isRequired, isEmail],
    },
    oldPassword: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 5 })],
    },
    newPassword: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 5 })],
    },
  });
  const navigate = useNavigate();

  const rooturl = process.env.REACT_APP_ROOT_URL;
  const token = localStorage.getItem("token");

  const inputChangeHandler = (value: string, name: string) => {
    setPasswordResetForm((prevState: Form) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setErrorMessages([]);
    console.log("this ran");

    const formData = new FormData(e.currentTarget);

    fetch(rooturl + "/reset-password", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
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
              setPasswordResetForm((prevState) => {
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
          } else {
            throw resData.error;
          }
          setIsLoading(false);
          return;
        }
        navigate("/");
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        throw err;
      });
  };

  return (
    <section className="auth">
      <form className="auth__form" onSubmit={handleSubmit}>
        <label htmlFor="email">Current Email</label>
        <Input
          className="auth__form-input"
          name="email"
          placeholder="Email"
          type="text"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={passwordResetForm.email.valid}
          value={passwordResetForm.email.value}
          required={true}
        />
        <label htmlFor="oldPassword">Old Password</label>
        <Input
          className="auth__form-input"
          name="oldPassword"
          placeholder="Old Password"
          type="password"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={passwordResetForm.oldPassword.valid}
          value={passwordResetForm.oldPassword.value}
          required={true}
        />
        <label htmlFor="newPassword">New Password</label>
        <Input
          className="auth__form-input"
          name="newPassword"
          placeholder="New Password"
          type="password"
          onChange={inputChangeHandler}
          errorMessage={errorMessage}
          valid={passwordResetForm.newPassword.valid}
          value={passwordResetForm.newPassword.value}
          required={true}
        />
        <button type="submit"> Continue </button>
      </form>
      <p>
        Return to
        <Link to="/login">
          <b> Login</b>
        </Link>
      </p>
    </section>
  );
};

export default ResetPassword;
