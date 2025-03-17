class Task {
    constructor(title, description, priority, category) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.completed = false;
    }
}

class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.categories = ["Personal", "Work", "Urgent", "Other"];
    }

    addTask(title, description, priority, category) {
        const task = new Task(title, description, priority, category);
        this.tasks.push(task);
        this.saveTasks();
        this.showNotification("Task Added", task.priority);
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    updateTask(id, newTitle, newDescription, newPriority, newCategory) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.title = newTitle;
            task.description = newDescription;
            task.priority = newPriority;
            task.category = newCategory;
            this.saveTasks();
            this.showNotification("Task Updated", task.priority);
        }
    }

    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
        }
    }

    filterTasks(category) {
        return category === "All" ? this.tasks : this.tasks.filter(task => task.category === category);
    }

    searchTasks(query) {
        return this.tasks.filter(task => task.title.toLowerCase().includes(query.toLowerCase()) || task.description.toLowerCase().includes(query.toLowerCase()));
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    showNotification(message, priority) {
        const notification = document.createElement("div");
        notification.className = `notification ${priority.toLowerCase()} alert alert-warning position-fixed top-0 end-0 m-3 p-2 fade-in`;
        notification.innerText = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// UI Functions
const taskManager = new TaskManager();

function populateCategoryDropdown() {
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = "";
    taskManager.categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", populateCategoryDropdown);

function renderTasks(filter = "All", query = "") {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    let tasks = query ? taskManager.searchTasks(query) : taskManager.filterTasks(filter);

    tasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item card shadow-sm p-3 mb-2 bg-light border-0 fade-in";
        taskItem.innerHTML = `
            <h3 class="card-title ${task.completed ? 'completed' : ''}">${task.title}</h3>
            <p class="card-text">${task.description}</p>
            <span class="priority badge bg-${task.priority.toLowerCase() === 'high' ? 'danger' : task.priority.toLowerCase() === 'medium' ? 'warning' : 'success'}">Priority: ${task.priority}</span>
            <span class="category text-muted">Category: ${task.category}</span>
            <button class="btn btn-success btn-sm" onclick="taskManager.toggleComplete(${task.id}); renderTasks()">✔ Complete</button>
            <button class="btn btn-warning btn-sm" onclick="editTask(${task.id})">✏ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="taskManager.deleteTask(${task.id}); renderTasks()">❌ Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function editTask(id) {
    const task = taskManager.tasks.find(task => task.id === id);
    if (task) {
        document.getElementById("title").value = task.title;
        document.getElementById("description").value = task.description;
        document.getElementById("priority").value = task.priority;
        document.getElementById("category").value = task.category;
        document.getElementById("save-btn").setAttribute("onclick", `updateExistingTask(${id})`);
    }
}

function updateExistingTask(id) {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;
    taskManager.updateTask(id, title, description, priority, category);
    document.getElementById("save-btn").removeAttribute("onclick");
    document.getElementById("task-form").reset();
    renderTasks();
}

// Event Listeners
document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;
    
    if (title.trim() === "") {
        alert("Title cannot be empty");
        return;
    }
    
    taskManager.addTask(title, description, priority, category);
    e.target.reset();
    renderTasks();
});

document.getElementById("filter").addEventListener("change", (e) => {
    renderTasks(e.target.value);
});

document.getElementById("search").addEventListener("input", (e) => {
    renderTasks("All", e.target.value);
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.body.style.backgroundColor = document.body.classList.contains("dark-mode") ? "#1e1e1e" : "#f5f0e1";
    localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode"));
});

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
        document.body.style.backgroundColor = "#1e1e1e";
    }
});

// Initial Render
renderTasks();
