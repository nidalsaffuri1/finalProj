import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./styles.css"; // Import the styles
import CreateProjectForm from "./components/CreateProjectForm";
import CurrentProjects from "./components/CurrentProjects";
import ProjectDetails from "./components/ProjectDetails";
import { ToastContainer } from "react-toastify";

const HomePage = () => (
  <div>
    <h1>Welcome to Truck Management System</h1>
    <div>
      <Link to="/create-project">
        <button>Create Project</button>
      </Link>
      <Link to="/current-projects">
        <button>Current Projects</button>
      </Link>
    </div>
  </div>
);

// const CreateProject = () => (
//   <div>
//     <h1>Create Project Page</h1>
//     <p>This is where the form to create a new project will go.</p>
//   </div>
// );
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
        <Route path="/" element={<HomePage />} />
        <Route path="/create-project" element={<CreateProject />} />
        <Route path="/current-projects" element={<CurrentProjects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />{" "}
      </Routes>
    </Router>
  );
};

export default App;
