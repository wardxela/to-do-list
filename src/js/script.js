// DOM references
const addItemForm = document.querySelector("#to-do-add");
const addItemFormField = document.querySelector("#to-do-add-input");
const toDoList = document.querySelector("#to-do-list");

function taskState(textEl, completed) {
  if (completed) {
    textEl.classList.add("_completed");
  } else {
    textEl.classList.remove("_completed");
  }
}

function renderTask(data) {
  const li = document.createElement("li");

  const checkboxLabel = document.createElement("label");
  const checkboxInput = document.createElement("input");
  const checkboxCircle = document.createElement("span");

  const textbox = document.createElement("div");
  const text = document.createElement("p");
  const button = document.createElement("button");

  li.classList.add("to-do-item");
  checkboxLabel.classList.add("checkbox", "to-do-item__complete");
  checkboxInput.classList.add("checkbox__input");
  checkboxCircle.classList.add("checkbox__circle");
  textbox.classList.add("to-do-item__textbox");
  text.classList.add("to-do-item__text");
  button.classList.add("to-do-item__remove");

  checkboxInput.type = "checkbox";
  button.type = "button";

  li.dataset.taskId = data.id;
  li.dataset.taskElement = true;
  text.textContent = data.text;
  text.dataset.taskText = true;
  checkboxLabel.dataset.taskCheckbox = true;
  checkboxInput.checked = data.completed;
  button.dataset.taskRemove = true;

  taskState(text, data.completed);

  checkboxLabel.append(checkboxInput, checkboxCircle);
  textbox.append(text);
  li.append(checkboxLabel, textbox, button);

  return li;
}

function createTask(text, completed = false) {
  return {
    id: new Date().getTime(),
    text,
    completed,
  };
}

function getTasksFromStorage() {
  const jsonString = localStorage.getItem("tasks");
  if (jsonString) {
    const json = JSON.parse(jsonString);
    if (json !== null) {
      return json.items ? json.items : [];
    }
  }
  return [];
}

function setTasksToStorage(data) {
  localStorage.setItem("tasks", JSON.stringify(data));
}

function expandTasksStorage(task) {
  const tasks = getTasksFromStorage();
  setTasksToStorage({
    items: [...tasks, task],
  });
}

function reduceTasksStorage(taskId) {
  const tasks = getTasksFromStorage();
  const filteredTasks = tasks.filter(task => task.id !== +taskId);
  setTasksToStorage({
    items: filteredTasks,
  });
}

function updateTaskInStorage(taskId, data) {
  const tasks = getTasksFromStorage();
  const updatedTasks = [];

  tasks.forEach(task => {
    if (task.id === +taskId) {
      const updatedTask = {
        ...task,
        ...data,
      };
      updatedTasks.push(updatedTask);
    } else {
      updatedTasks.push(task);
    }
  });

  setTasksToStorage({
    items: updatedTasks,
  });
}

getTasksFromStorage().forEach(task => {
  toDoList.append(renderTask(task));
});

toDoList.addEventListener("click", e => {
  const taskEl = e.target.closest("[data-task-id]");
  const removeBtn = e.target.closest("[data-task-remove]");

  if (removeBtn) {
    taskEl.remove();
    reduceTasksStorage(taskEl.dataset.taskId);
  }
});

toDoList.addEventListener("input", e => {
  const taskEl = e.target.closest("[data-task-id]");
  const checkbox = e.target.closest("[data-task-checkbox]");
  const checked = checkbox.querySelector("input").checked;
  if (checkbox) {
    taskState(taskEl.querySelector("[data-task-text]"), checked);
    updateTaskInStorage(taskEl.dataset.taskId, {
      completed: checked,
    });
  }
});

addItemForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = addItemFormField.value.trim();
  if (text) {
    const task = createTask(text);
    toDoList.append(renderTask(task));
    expandTasksStorage(task);
    addItemFormField.value = "";
  }
});
