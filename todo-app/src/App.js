import React, { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { useCallback } from "react";
import { signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";

function TodoApp() {
  // State to store the list of tasks
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // State to store logged-in user
  const [user, setUser] = useState(null);

  // State to store the input value
  const [taskInput, setTaskInput] = useState("");

  // Function to add a new task
  const addTask = async () => {
    if (taskInput.trim() === "" || !user) return; // Prevent adding if empty or not logged in
  
    const newTask = {
      text: taskInput,
      completed: false,
      userId: user.uid, // Store task with user ID
      createdAt: new Date() // Timestamp for sorting later
    };
  
    try {
      await addDoc(collection(db, "tasks"), newTask); // Save to Firestore
      setTaskInput("");
      fetchTasks(); // Reload tasks after adding
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

const fetchTasks = useCallback(async () => {
  if (!user) return;

  const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  const tasksList = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  setTasks(tasksList);
}, [user]); 

useEffect(() => {
  fetchTasks();
}, [fetchTasks]); 

  

  // Function to toggle task completion
  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Function to remove a task
  const removeTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const removeAllTasks = async () => {
    try {
      const userTasksQuery = query(collection(db, "tasks"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(userTasksQuery);
  
      // Delete each task from Firestore
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
  
      setTasks([]); // Clear tasks from local state
    } catch (error) {
      console.error("Error deleting all tasks:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addTask();
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider.setCustomParameters({prompt: "select_account"}));
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async() => {
    try {
      await signOut(auth);
      setUser(null);
      setTasks([]);
    } catch (error) {
      console.error("Logout Failed:", error);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px", textAlign: "center" }}>
      <h2>Todo List</h2>
      {user && (
        <div style={{ marginBottom: "10px" }}>
          <img 
            src={user?.photoURL} 
            alt="Profile" 
            onError={(e) => e.target.src = "https://via.placeholder.com/40"} 
            style={{ width: "40px", borderRadius: "50%" }} 
          />
          <p>Welcome, {user.displayName}!</p>
          <button 
            onClick={logout} 
            style={{
              padding: "8px", 
              backgroundColor: "red", 
              color: "white", 
              border: "none", 
              cursor: "pointer",
              borderRadius: "8px"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "darkred"}
            onMouseOut={(e) => e.target.style.backgroundColor = "red"}
          >
            Logout
          </button>
        </div>
      )}
      {!user && (
        <button 
          onClick={loginWithGoogle} 
          style={{padding: "15px", backgroundColor: "blue", color: "white", border:"none", cursor: "pointer", margin: "8px", borderRadius: "20px", fontSize: "20px"}}
          onMouseOver={(e) => e.target.style.backgroundColor = "darkblue"}
          onMouseOut={(e) => e.target.style.backgroundColor = "blue"}
        >
          Sign in with Google
        </button>
      )}
      {user && (
        <div>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a task"
            style={{ padding: "8px", width: "70%" }}
          />
          <button onClick={addTask} style={{ padding: "8px", marginLeft: "10px" }}>Add</button>
          <button onClick={removeAllTasks} style={{padding: "8px", marginLeft: "10px"}}>Clear All</button>
        </div>
      )}
      {user && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map(task => (
            <li key={task.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" }}>
              <span 
                onClick={() => toggleTask(task.id)}
                style={{ cursor: "pointer", textDecoration: task.completed ? "line-through" : "none" }}>
                {task.text}
              </span>
              <button onClick={() => removeTask(task.id)} style={{ color: "red", border: "none", background: "none", cursor: "pointer" }}>💩</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TodoApp;
