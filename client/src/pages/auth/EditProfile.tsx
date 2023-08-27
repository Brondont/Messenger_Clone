import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

type User = {
  id: string;
  username: string;
  imagePath: string;
  gender: string;
};

const EditProfile: React.FC<{ User: User | undefined }> = ({ User }) => {
  const navigate = useNavigate();
  const rooturl = process.env.REACT_APP_ROOT_URL;
  const token = localStorage.getItem("token");

  const handleProfileEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          throw new Error(resData.error);
        }
        navigate("/m/" + User!.id);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <section>
      {User ? (
        <form className="auth-form" onSubmit={handleProfileEdit}>
          <h1> Update your profile </h1>
          <label htmlFor="username">Username </label>
          <input
            name="username"
            placeholder="Username"
            type="text"
            defaultValue={User!.username}
          />
          <label htmlFor="image">Profile picture </label>
          <input name="image" className="auth-form-image_input" type="file" />
          <label htmlFor="gender">Gender </label>
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
