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

const HomePage = () => (
  <div className="homepage-container">
    <h1 className="homepage-title">Welcome to Truck Management System</h1>
    <p className="homepage-subtitle">
      Efficiently manage your trucks, tasks, and projects.
    </p>

    <div className="button-group">
      <Link to="/create-project">
        <button className="primary-btn">Create Project</button>
      </Link>
      <Link to="/current-projects">
        <button className="secondary-btn">Current Projects</button>
      </Link>
    </div>
  </div>
);

const CreateProject = () => (
  <div>
    <CreateProjectForm /> {/* Use the form component here */}
  </div>
);

const CurrentProjectsPage = () => (
  <div>
    <CurrentProjects />
  </div>
);

// Inside <Routes> in App.js:
<Route path="/current-projects" element={<CurrentProjectsPage />} />;

<Route path="/projects/:id" element={<ProjectDetails />} />;

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
        <Route path="/" element={<HomePage />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/current-projects" element={<CurrentProjects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />{" "}
      </Routes>
    </Router>
  );
};

export default App;
