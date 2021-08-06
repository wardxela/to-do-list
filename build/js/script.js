// DOM references
const addItemForm = document.querySelector("#to-do-add");
const addItemFormField = document.querySelector("#to-do-add-input");
const toDoList = document.querySelector("#to-do-list");

let previouslyOpenedMenu = null;

const openEl = (() => {
  let previouslyOpenedMenu = null;
  return newEl => {
    if (previouslyOpenedMenu) {
      if (previouslyOpenedMenu === newEl) {
        newEl && newEl.classList.toggle("_opened");
      } else {
        previouslyOpenedMenu.classList.remove("_opened");
        newEl && newEl.classList.add("_opened");
      }
    } else {
      newEl && newEl.classList.add("_opened");
    }
    previouslyOpenedMenu = newEl;
  };
})();

function taskState(textEl, completed) {
  if (completed) {
    textEl.classList.add("_completed");
  } else {
    textEl.classList.remove("_completed");
  }
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

function renderEditor(taskId, textEl, handleElements) {
  const editorArea = document.createElement("div");
  const editor = document.createElement("input");
  const controllers = document.createElement("div");
  const save = document.createElement("button");
  const cancel = document.createElement("button");

  editorArea.classList.add("to-do-item-editor-area");
  editor.classList.add("to-do-item-editor-area__input");
  controllers.classList.add("to-do-item-editor-area__controllers");
  save.classList.add("text-btn", "text-btn_success");
  cancel.classList.add("text-btn", "text-btn_danger");

  save.textContent = "Save";
  cancel.textContent = "Cancel";

  editor.type = "text";
  editor.value = textEl.textContent;

  controllers.append(save, cancel);
  editorArea.append(editor, controllers);

  editor.addEventListener("input", e => {
    if (editor.value.trim()) {
      save.disabled = false;
    } else {
      save.disabled = true;
    }
  });

  save.addEventListener("click", e => {
    textEl.textContent = editor.value;
    updateTaskInStorage(taskId, {
      text: editor.value,
    });
    editorArea.remove();
    handleElements(true);
  });

  cancel.addEventListener("click", e => {
    editorArea.remove();
    handleElements(true);
  });

  return [editorArea, editor];
}

function renderTask(data) {
  const li = document.createElement("li");

  const checkboxLabel = document.createElement("label");
  const checkboxInput = document.createElement("input");
  const checkboxCircle = document.createElement("span");

  const textbox = document.createElement("div");
  const text = document.createElement("p");

  const btnGroup = document.createElement("div");
  const removeBtn = document.createElement("button");
  const editBtn = document.createElement("button");
  const detailsBtn = document.createElement("button");

  function handleElements(open) {
    if (open) {
      text.classList.remove("_hidden");
      editBtn.disabled = false;
    } else {
      text.classList.add("_hidden");
      editBtn.disabled = true;
    }
  }

  li.classList.add("to-do-item");

  checkboxLabel.classList.add(
    "checkbox",
    "to-do-item__item",
    "to-do-item__complete"
  );
  checkboxInput.classList.add("checkbox__input");
  checkboxCircle.classList.add("checkbox__circle");

  textbox.classList.add("to-do-item__textbox");
  text.classList.add("to-do-item__text");

  btnGroup.classList.add("to-do-item-controllers");
  detailsBtn.classList.add(
    "btn",
    "btn_details",
    "to-do-item__item",
    "to-do-item__show-more"
  );
  removeBtn.classList.add("btn", "btn_remove", "to-do-item__item");
  editBtn.classList.add("btn", "btn_edit", "to-do-item__item");

  checkboxInput.type = "checkbox";
  removeBtn.type = "button";
  detailsBtn.type = "button";
  editBtn.type = "button";

  li.dataset.taskId = data.id;
  text.textContent = data.text;
  checkboxInput.checked = data.completed;

  taskState(text, data.completed);

  detailsBtn.append(document.createElement("span"));

  checkboxLabel.append(checkboxInput, checkboxCircle);
  btnGroup.append(editBtn, removeBtn);
  textbox.append(text);
  li.append(checkboxLabel, textbox, btnGroup, detailsBtn);

  detailsBtn.addEventListener("click", e => {
    openEl(btnGroup);
  });

  editBtn.addEventListener("click", e => {
    openEl(null);
    handleElements(false);

    const [editorArea, editor] = renderEditor(data.id, text, handleElements);

    textbox.append(editorArea);
    editor.focus();
    // setTimeout(() => editor.classList.add("_animate"));
    editor.classList.add("_animate");
  });

  removeBtn.addEventListener("click", e => {
    removeBtn.disabled = true;
    reduceTasksStorage(data.id);
    li.classList.add("_removing");
    setTimeout(() => li.remove(), 500);
  });

  checkboxInput.addEventListener("input", e => {
    taskState(text, checkboxInput.checked);
    updateTaskInStorage(data.id, {
      completed: checkboxInput.checked,
    });
  });

  return li;
}

getTasksFromStorage().forEach(task => {
  toDoList.append(renderTask(task));
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
