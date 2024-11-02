const newTask = document.getElementById("input");
const addTask = document.getElementById("add-btn");
const ttlTask = document.getElementById("ttl-btn");
const taskList = document.getElementById("task-list");


addTask.addEventListener("click", () => addToList(false)); 
ttlTask.addEventListener("click", () => addToList(true)); 


newTask.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        addToList(false); 
    }
});


async function addToList(isTTL) {
    const text = newTask.value.trim();
    if (text) {
        try {
            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ task: text, isTTL }) 
            });
            const result = await response.json();
            if (response.ok) {
                createTaskElement(result.taskId, text, isTTL);
                newTask.value = "";
            } else {
                console.error(result.error);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
}


function createTaskElement(taskId, text, isTTL) {
    const listItem = document.createElement("li");
    listItem.className = "task-item";

    const checkbox = document.createElement("button");
    checkbox.className = "btn-check";
    checkbox.innerHTML = `<i class="fa-solid fa-check"></i>`;
    
    const span = document.createElement("span");
    span.className = "text";
    span.textContent = text;

    const closeButton = document.createElement("button");
    closeButton.className = "btn-close";
    closeButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`;

    const timerSpan = document.createElement("span");
    timerSpan.className = "timer";
    timerSpan.textContent = isTTL ? "10s" : "";

    listItem.appendChild(checkbox);
    listItem.appendChild(span);
    listItem.appendChild(timerSpan);
    listItem.appendChild(closeButton);
    taskList.appendChild(listItem);

    closeButton.addEventListener("click", () => deleteTask(taskId, listItem));
    checkbox.addEventListener("click", () => {
        listItem.classList.toggle("active");
    });

    if (isTTL) {
        startCountdown(timerSpan, taskId, listItem);
    }
}


function startCountdown(timerSpan, taskId, listItem) {
    let timeLeft = 10;
    const countdown = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = `${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            deleteTask(taskId, listItem);
        }
    }, 1000);
}


async function deleteTask(taskId, listItem) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            taskList.removeChild(listItem);
        } else {
            console.error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}


async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        const result = await response.json();
        result.tasks.forEach(task => {
            createTaskElement(task.taskId, task.task, task.isTTL);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}


fetchTasks();
