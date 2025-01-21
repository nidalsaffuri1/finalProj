import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./style.css";
import "./components/homePage/homePagee.css";
import LoginPage from "./pages/loginPage";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./components/privateRoute";
import CreateProjectForm from "./components/createProjectForm/CreateProjectForm";
import CurrentProjects from "./components/currentProjects/CurrentProjects";
import ProjectDetails from "./components/projectDetails/ProjectDetails";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const companyName = localStorage.getItem("companyName");

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token from local storage
    localStorage.removeItem("companyName"); // Clear companyName from local storage
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="homepage-container">
      <h1 className="homepage-title">
        Welcome, {companyName}
        <br /> to Truck Management System
      </h1>
      <h3 className="homepage-subtitle">
        Efficiently manage your trucks, tasks, and projects.
      </h3>
      <div className="button-group">
        <Link to="/create-project">
          <button className="primary-btn">Create Project</button>
        </Link>
        <Link to="/current-projects">
          <button className="secondary-btn">Current Projects</button>
        </Link>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/current-projects"
          element={
            <PrivateRoute>
              <CurrentProjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <PrivateRoute>
              <CreateProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />
        {/* Protect the home page */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
