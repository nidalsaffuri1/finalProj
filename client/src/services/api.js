const API_URL = "http://localhost:5000/projects";

// Fetch all projects with pagination, sorting, and search
export const fetchProjects = async (
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  search = ""
) => {
  try {
    const url = `${API_URL}?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&search=${encodeURIComponent(
      search
    )}`;
    console.log("Fetching Projects from URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error Response:", errorText);
      throw new Error(`Failed to fetch projects: ${errorText}`);
    }

    const data = await response.json();
    console.log("Projects Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    throw error;
  }
};

// Fetch project by ID
export const fetchProjectById = async (id) => {
  try {
    console.log("Fetching project by ID:", id);
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch project details:", errorText);
      throw new Error(`Failed to fetch project details: ${errorText}`);
    }
    const data = await response.json();
    console.log("Fetched Project Details:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchProjectById:", error.message);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData) => {
  try {
    console.log("Creating project with data:", projectData);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create project, response:", errorText);
      throw new Error(`Failed to create project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }
};

// Update a project
export const updateProject = async (id, projectData) => {
  try {
    console.log("Updating project with data:", projectData);
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData), // Send all updated fields
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update project:", errorText);
      throw new Error(`Failed to update project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Updated Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to delete project:", errorText);
      throw new Error(`Failed to delete project: ${errorText}`);
    }

    const data = await response.json();
    console.log("Deleted Project Response:", data);
    return data;
  } catch (error) {
    console.error("Error deleting project:", error.message);
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

// Update project notes
export const updateNotes = async (id, notes) => {
  try {
    const response = await fetch(`${API_URL}/${id}/notes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }), // Send the updated notes
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update notes: ${errorText}`);
    }

    const data = await response.json();
    return data; // Return the updated project
  } catch (error) {
    console.error("Error updating notes:", error.message);
    throw error;
  }
};

export const fetchTasks = async (projectId) => {
  try {
    console.log("Fetching tasks for projectId:", projectId);
    const response = await fetch(
      `http://localhost:5000/tasks?projectId=${projectId}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch tasks:", errorText);
      throw new Error(`Failed to fetch tasks: ${errorText}`);
    }

    const data = await response.json();
    console.log("Fetched Tasks:", data);
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create task:", errorText);
      throw new Error(`Failed to create task: ${errorText}`);
    }

    const data = await response.json();
    console.log("Created Task Response:", data);
    return data;
  } catch (error) {
    console.error("Error creating task:", error.message);
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
