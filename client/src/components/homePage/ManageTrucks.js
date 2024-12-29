import React, { useState, useEffect } from "react";
import { fetchTrucks, createTruck, deleteTruck } from "../../services/api";

const ManageTrucks = () => {
  const [trucks, setTrucks] = useState([]);
  const [formData, setFormData] = useState({
    model: "",
    registrationNumber: "",
    weightCapacity: "",
    ownerId: "",
  });

  useEffect(() => {
    const loadTrucks = async () => {
      try {
        const data = await fetchTrucks();
        setTrucks(data);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
      }
    };
    loadTrucks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTruck(formData);
      setFormData({
        model: "",
        registrationNumber: "",
        weightCapacity: "",
        ownerId: "",
      });
      const updatedTrucks = await fetchTrucks();
      setTrucks(updatedTrucks);
    } catch (error) {
      console.error("Failed to create truck:", error);
    }
  };

  return (
    <div>
      <h1>Manage Trucks</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="model"
          placeholder="Truck Model"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        />
        <input
          type="text"
          name="registrationNumber"
          placeholder="Registration Number"
          value={formData.registrationNumber}
          onChange={(e) =>
            setFormData({ ...formData, registrationNumber: e.target.value })
          }
        />
        <input
          type="number"
          name="weightCapacity"
          placeholder="Weight Capacity"
          value={formData.weightCapacity}
          onChange={(e) =>
            setFormData({ ...formData, weightCapacity: e.target.value })
          }
        />
        <button type="submit">Add Truck</button>
      </form>
      <ul>
        {trucks.map((truck) => (
          <li key={truck._id}>
            {truck.model} - {truck.registrationNumber}
            <button onClick={() => deleteTruck(truck._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageTrucks;
