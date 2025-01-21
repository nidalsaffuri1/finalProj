import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("companyName");
    navigate("/login");
  };

  const companyName = localStorage.getItem("companyName");

  return (
    <div>
      <h1>Welcome, {companyName}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
