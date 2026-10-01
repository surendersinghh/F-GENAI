import { useAuth } from "../hooks/useauth";
import { Navigate } from "react-router";
import React from "react";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();
  if (loading) {
    return (
      <main>
        <h1>Loading...</h1>
      </main>
    );
  }

  if (user === undefined) {
    return null;
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }
  return children;
};

export default Protected;
