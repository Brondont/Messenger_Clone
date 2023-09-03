import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Form/Input/Input";
import "./Auth.css";

import { isRequired, isEmail, isLength } from "../../util/validators";
import { ValidatorFunction, IsLengthFunction } from "../../util/validators";

type User = {
  id: number;
  username: string;
  imagePath: string;
  gender: string;
};

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

const EditProfile: React.FC<{ User: User | undefined }> = ({ User }) => {
  const [errorMessage, setErrorMessages] = useState<ErrorServerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editProfileForm, setEditProfileForm] = useState<Form>({
    username: {
      value: "",
      valid: true,
      validators: [isRequired, isLength({ min: 2 })],
    },
    image: {
      value: "",
      valid: true,
      validators: [],
    },
  });

  const navigate = useNavigate();
  const rooturl = process.env.REACT_APP_ROOT_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (User) {
      setEditProfileForm((prevState) => {
        return {
          ...prevState,
          username: {
            ...prevState.username,
            value: User.username,
            valid: true,
          },
        };
      });
    }
  }, [User]);

  const handleProfileEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    setErrorMessages([]);

    const formData = new FormData(e.currentTarget);
    formData.append("oldPath", User!.imagePath);

    fetch(rooturl + "/signup", {
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
          if (resData.error.statusCode === 422) {
            resData.error.data.map((err: ErrorServerResponse) => {
              setErrorMessages((prevState: ErrorServerResponse[]) => {
                return [...prevState, err];
              });
              setEditProfileForm((prevState) => {
                return {
                  ...prevState,
                  [err.path]: {
                    ...prevState[err.path],
                    valid: false,
                  },
                };
              });
            });
          }
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setIsLoading(false);
        console.log(err);
      });
  };

  const inputChangeHandler = (value: string, name: string) => {
    setEditProfileForm((prevState: Form) => {
      const fieldConfig = prevState[name];
      let isValid = true;
      fieldConfig.validators.map((validator: ValidatorFunction) => {
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

  return (
    <section>
      {User ? (
        <form className="auth-form" onSubmit={handleProfileEdit}>
          <h1> Update your profile </h1>
          <Input
            label="username"
            name="username"
            placeholder="Username"
            type="text"
            onChange={inputChangeHandler}
            errorMessage={errorMessage}
            valid={editProfileForm.username.valid}
            value={editProfileForm.username.value}
            required={true}
          />
          <label htmlFor="image">Profile picture</label>
          <Input
            name="image"
            type="file"
            onChange={inputChangeHandler}
            errorMessage={errorMessage}
            valid={editProfileForm.image.valid}
            required={false}
          />
          <label htmlFor="gender">Gender</label>
          <select name="gender" defaultValue={User.gender}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button type="submit"> Continue </button>
        </form>
      ) : (
        <p> Loading user data ...</p>
      )}
      <p>
        Reset password ?{" "}
        <Link to="/login">
          <b>Click here</b>
        </Link>
      </p>
    </section>
  );
};

export default EditProfile;
