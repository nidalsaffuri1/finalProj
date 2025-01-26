import axios from "axios";
const API_URL = "http://localhost:5000/";

// Fetch all projects with pagination, sorting, and search
export const fetchProjects = async (
  token,
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const response = await axios.get(`${API_URL}projects`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the token for authentication
      },
      params: {
        page,
        limit,
        search, // Include search in the request if provided
      },
    });

    // Log the response for debugging (optional)
    console.log("Projects Response Data:", response.data);

    return response.data; // Return the data directly
  } catch (error) {
    console.error("Error fetching projects:", error.message);

    // Optionally, log detailed error information
    if (error.response) {
      console.error("Response Error Data:", error.response.data);
    }

    throw error; // Throw the error to handle it in the caller
  }
};
// export const fetchProjects = async (
//   page = 1,
//   limit = 10,
//   sortBy = "createdAt",
//   order = "desc",
//   search = ""
// ) => {
//   try {
//     const url = `${API_URL}?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&search=${encodeURIComponent(
//       search
//     )}`;
//     console.log("Fetching Projects from URL:", url);

//     const response = await fetch(url);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("Error Response:", errorText);
//       throw new Error(`Failed to fetch projects: ${errorText}`);
//     }

//     const data = await response.json();
//     console.log("Projects Response Data:", data);
//     return data;
//   } catch (error) {
//     console.error("Error fetching projects:", error.message);
//     throw error;
//   }
// };

// Fetch project by ID
export const fetchProjectById = async (id) => {
  try {
    const token = localStorage.getItem("token"); // Ensure token is passed
    if (!token) throw new Error("No token available");

    const response = await axios.get(`${API_URL}projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Pass token for authentication
      },
    });

    console.log("Fetched Project Details:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching project details:", error.message);
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    }
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available");

    const response = await fetch(`${API_URL}products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch products: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error.message);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token available");
    }

    const response = await fetch(`${API_URL}projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create project: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }
};

// Update a project

export const updateProject = async (projectId, projectData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update project: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }
};

// services/api.js
export const deleteProduct = async (productId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(`${API_URL}products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token available");
    }

    const response = await fetch(`${API_URL}projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Include the token
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete project: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting project:", error.message);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token available");

    const response = await axios.post(`${API_URL}products`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Product Created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error.message);
    throw error;
  }
};

// Fetch all customers
export const fetchCustomers = async () => {
  try {
    const response = await fetch("http://localhost:5000/customers");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch customers:", errorText);
      throw new Error(`Failed to fetch customers: ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched Customers:", data);
    return data;
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    throw error;
  }
};

export const fetchCustomerById = async (customerId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/customers/${customerId}`
    );
    if (!response.ok) throw new Error("Failed to fetch customer details");
    const data = await response.json();
    console.log("Fetched Customer Data:", data); // Debug: Ensure data is correct
    return data;
  } catch (error) {
    console.error("Error fetching customer by ID:", error.message);
    throw error;
  }
};

// Update project notes
export const updateNotes = async (projectId, notes) => {
  try {
    const token = localStorage.getItem("token"); // Get token
    const response = await fetch(`${API_URL}projects/${projectId}/notes`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token for authentication
      },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update notes: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateNotes:", error.message);
    throw error;
  }
};

export const fetchTruckById = async (truckId) => {
  try {
    const response = await fetch(`http://localhost:5000/trucks/${truckId}`);
    if (!response.ok) throw new Error("Failed to fetch truck details");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching truck:", error.message);
    throw error;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const fetchTasks = async (projectId) => {
  try {
    console.log("Fetching tasks for projectId:", projectId);

    // Axios request with token authentication and query params
    const response = await axios.get(`${API_URL}tasks`, {
      headers: getAuthHeaders(),
      params: { projectId }, // Automatically appends projectId to the URL as a query parameter
    });

    console.log("Fetched Tasks:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        "Failed to fetch tasks:",
        error.response.data.message || error.response.data
      );
    } else {
      console.error("Error fetching tasks:", error.message);
    }
    throw error;
  }
};

// Fetch reusable tasks
export const fetchReusableTasks = async () => {
  try {
    const response = await fetch("http://localhost:5000/reusableTasks"); // Adjust endpoint as necessary
    if (!response.ok) {
      throw new Error("Failed to fetch reusable tasks.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reusable tasks:", error);
    throw error;
  }
};

// Create a new reusable task
export const createReusableTask = async (taskData) => {
  try {
    const response = await fetch("http://localhost:5000/reusable-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error("Failed to create reusable task");
    return await response.json();
  } catch (error) {
    console.error("Error creating reusable task:", error);
    throw error;
  }
};

// Delete a reusable task
export const deleteReusableTask = async (taskId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/reusable-tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) throw new Error("Failed to delete reusable task");
    return await response.json();
  } catch (error) {
    console.error("Error deleting reusable task:", error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    console.log("Creating Task with Data:", taskData); // Debug log
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create task:", errorText); // Log error details
      throw new Error(`Failed to create task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Task:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error in createTask:", error.message);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update task:", errorText);
      throw new Error(`Failed to update task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Updated Task Response:", data);
    return data;
  } catch (error) {
    console.error("Error updating task:", error.message);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to delete task:", errorText);
      throw new Error(`Failed to delete task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Deleted Task Response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting task:", error.message);
    throw error;
  }
};
