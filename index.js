//На странице находится инпут и кнопка.
//Пользователь может ввести что-то в инпут и нажать на кнопку, после этого в списке ниже
//должна отобразится строка с тем что было введено в инпуте. Инпут очищается

//Каждое дело в списке может быть в двух состояниях (нужно сделать - желтый фон и сделано - зеленый фон).
//По умолчанию, дело в список добавляется в статусе нужно сделать. При клике на него, состояние меняется на противоположное.
//Пользователь может удалять любые дела.

//Все данные берем с сервера, и управление тоже через сервер

//https://jsonplaceholder.typicode.com/todos


const list = document.querySelector(".js-list");
const emptyMessage = document.querySelector(".js-nothing");
const addButtonElement = document.querySelector(".js-btn");
const listItemToDo = document.querySelector(".js-item");
const input = document.querySelector(".js-input");
const dataFormElement = document.forms.data;

class ToDosRepository {
    constructor() {
        this._todos = [];
    }
    set todos(toDoList) {
        this._todos = toDoList;
    }
    get todos() {
        return this._todos;
    }
}
const toDosRepository = new ToDosRepository;

class ToDosRequests {
    static sendGetToDoListRequest() {
        return fetch("https://jsonplaceholder.typicode.com/todos").then((response) =>
            response.json()
        );
    }

    static sendPostToDoRequest(newListItem) {
        return fetch("https://jsonplaceholder.typicode.com/todos", {
            method: "POST",
            body: JSON.stringify(newListItem),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());
    }

    static sendPutStatusRequest(toDoItem) {
        const item = getItemFromHTML(toDoItem);
        return fetch(`https://jsonplaceholder.typicode.com/todos/${toDoItem.id}`, {
            method: "PUT",
            body: JSON.stringify(item),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        }).then((response) => response.json());
    }

    static sendDleteToDoListRequest(id) {
        return fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
            method: "DELETE",
        });
    }
}

class ToDosLogic {
    static getToDoList() {
        const promise = ToDosRequests.sendGetToDoListRequest();
        promise.then((toDoList) => {
            renderListItems(toDoList);
            toDosRepository.todos = toDoList;
        });
    }

    static addNewTodo() {
        const newListItem = {
            userId: 0,
            id: list.children.length + 1,
            title: input.value,
            completed: false,
        };
        ToDosRequests.sendPostToDoRequest(newListItem);
        list.insertAdjacentHTML("beforeend", getToDoListItem(newListItem));
        toDosRepository.todos = [...toDosRepository.todos, newListItem];
    }

    static toggleStatusOnListItem(event) {
        if (event.target.classList.contains("js-item")) {
            if (event.target.dataset.completed === "false") {
                event.target.dataset.completed = "true";
            } else {
                event.target.dataset.completed = "false";
            };
            ToDosRequests.sendPutStatusRequest(event.target);
            editToDosRepositoryItem(event.target);
        };
    }

    static deleteElement(event) {
        const currentItem = event.target.closest('li');
        const id = +(currentItem.id)
        ToDosRequests.sendDleteToDoListRequest(id);
        currentItem.remove();
        toDosRepository.todos = toDosRepository.todos.filter(todo => todo.id !== id);
        console.log(toDosRepository.todos);
    }
}

//RENDERS
function renderListItems(toDoList) {
    const listItems = toDoList.map((toDoListItem) =>
        getToDoListItem(toDoListItem)
    );
    if (listItems) {
        emptyMessage.hidden = true;
        list.hidden = false;
        list.innerHTML = listItems.join("");
    }
}

function getToDoListItem(listItem) {
    return `<li class="list-group-item js-item" data-completed = "${listItem.completed}" id=${listItem.id}>${listItem.title}<i class="bi bi-trash action js-action-delete"></i></li>`;
}

function getItemFromHTML(toDoItem) {
    return {
        id: toDoItem.id,
        title: toDoItem.firstChild.nodeValue,
        completed: toDoItem.dataset.completed,
    };
}

//LISTENERS

function createAddEventListener() {
    addButtonElement.addEventListener("click", () => {
        ToDosLogic.addNewTodo();
        cleanForm();
        list.scrollTop = list.scrollHeight;
    });
}

function createEditEventListener() {
    list.addEventListener("click", ToDosLogic.toggleStatusOnListItem);
}

function createDeleteEventListener() {
    list.addEventListener("click", (event) => {
        if (event.target.classList.contains("js-action-delete")) {
            ToDosLogic.deleteElement(event);
        }
    });
}

//UTILS

function editToDosRepositoryItem(currentItem) {
    const id = +(currentItem.id);
    const repositoryElement = toDosRepository.todos.find(todo => todo.id === id);
    console.log(repositoryElement);
    if (repositoryElement.completed === false) {
        repositoryElement.completed = true;
    } else {
        repositoryElement.completed = false;
    };
}

function cleanForm() {
    dataFormElement.reset();
}

init();

function init() {
    ToDosLogic.getToDoList();
    createAddEventListener();
    createEditEventListener();
    createDeleteEventListener();
}