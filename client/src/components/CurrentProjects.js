import React, { useState, useEffect, useRef } from "react";
import { fetchProjects, deleteProject } from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CurrentProjects = () => {
  const [projects, setProjects] = useState([]); // Holds project data
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Debounced search query
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const [loading, setLoading] = useState(false); // Loading state

  const searchInputRef = useRef(null); // Reference for the search input field
  const projectsPerPage = 10; // Number of projects per page

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce time
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch projects whenever currentPage or debouncedSearchQuery changes
  useEffect(() => {
    const loadProjects = async () => {
      console.log("Loading projects...");
      setLoading(true);
      try {
        const data = await fetchProjects(
          currentPage,
          projectsPerPage,
          "createdAt",
          "desc",
          debouncedSearchQuery
        );
        console.log("Fetched Projects Data:", data);

        if (data.projects?.length) {
          setProjects(data.projects || []);
          setTotalPages(data.totalPages || 1);
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

  // Handle delete project
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((project) => project._id !== id));
        toast.success("Project deleted successfully!");

        // If the current page is empty after deletion, go to the previous page
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project.");
      }
    }
  };

  // Pagination controls
  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Focus the search input field after re-render
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [projects]); // Ensure it focuses after project updates

  return (
    <div className="container">
      <h1>Current Projects</h1>

      {/* Search Bar */}
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search by Serial Number, Customer Name, or Truck Model"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {/* Content */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>
          No projects found. Try creating a new project or modify your search
          query.
        </p>
      ) : (
        <>
          <table>
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
              {projects.map((project, index) => (
                <tr
                  key={project._id}
                  style={{
                    backgroundColor: project.hasTasks
                      ? project.isCompleted
                        ? "lightgreen"
                        : "lightcoral"
                      : "white", // Neutral color for projects with no tasks
                  }}
                >
                  <td>{index + 1 + (currentPage - 1) * projectsPerPage}</td>
                  <td>{project.serialNumber || "Not Provided"}</td>
                  <td>{project.customerId?.name || "Unknown"}</td>
                  <td>{project.truckModel || "Not Provided"}</td>
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td>{project.isCompleted ? "Completed" : "In Progress"}</td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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
