// export default CurrentProjects;
import React, { useState, useEffect, useRef } from "react";
import { fetchProjects, deleteProject } from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./currentProjectss.css";
// import { useNavigate } from "react-router-dom";

const CurrentProjects = () => {
  const [projects, setProjects] = useState([]);
  // const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);
  const projectsPerPage = 10;
  const navigate = useNavigate(); // Initialize navigate function

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No token found. Please login first.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchProjects(
          token,
          currentPage,
          projectsPerPage,
          debouncedSearchQuery
        );

        if (data.projects?.length) {
          setProjects(data.projects);
          setTotalPages(data.totalPages);
        } else {
          setProjects([]);
          toast.warn("No projects found.");
        }
      } catch (error) {
        console.error("Error fetching projects:", error.message);
        toast.error("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [currentPage, debouncedSearchQuery]);

  // Handle deletion of a project
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((project) => project._id !== id));
        toast.success("Project deleted successfully!");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project.");
      }
    }
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Focus search input on render
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [projects]);

  return (
    <div className="projects-container">
      <h1>Current Projects</h1>
      {/* Button to navigate back to home page */}
      <div className="navigation-button">
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>
          No projects found. Try creating a new project or modify your search
          query.
        </p>
      ) : (
        <>
          <table className="projects-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Serial Number</th>
                <th>Customer Name</th>
                <th>Truck Model</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => {
                // Determine the row class based on project status
                const rowClass = project.dailyTasks.length
                  ? project.hasIncompleteTasks
                    ? "project-row in-progress" // Red if tasks are incomplete
                    : "project-row completed" // Green if all tasks are completed
                  : "project-row normal"; // No color if no tasks

                return (
                  <tr key={project._id} className={rowClass}>
                    <td>{index + 1 + (currentPage - 1) * projectsPerPage}</td>
                    <td>{project.serialNumber || "Not Provided"}</td>
                    <td>{project.customerId?.name || "Unknown"}</td>
                    <td>{project.truckId?.model || "Not Provided"}</td>
                    <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                    <td>
                      {project.dailyTasks.length === 0
                        ? "No Tasks"
                        : project.hasIncompleteTasks
                        ? "In Progress"
                        : "Completed"}
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(project._id)}
                      >
                        Delete
                      </button>
                      <Link to={`/projects/${project._id}`}>
                        <button className="view-btn">View</button>
                      </Link>
                      <Link
                        to={`/create-project?customerId=${
                          project.customerId?._id
                        }&companyId=${localStorage.getItem("companyId")}`}
                      >
                        <button className="add-btn">➕</button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentProjects;
