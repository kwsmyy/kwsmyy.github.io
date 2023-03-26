'use strict';

const todoBtn = document.getElementById('todobtn');
const todoList = document.getElementById('todolist');
const completeList = document.getElementById('completelist');
const todo = document.getElementById('todo');
todo.focus();

todoBtn.addEventListener('click', registerTodoList);

/*todoリストにユーザ入力を登録する処理*/
function registerTodoList(){
    if(todo.value !== ''){
        let newDiv = document.createElement('div');
        newDiv.className = 'todolistrow';
        let newChildDiv = document.createElement('div');
        newChildDiv.className = 'mytodo';
        let newTodo = document.createElement('p');
        newTodo.addEventListener('dblclick',editTodo);
        let addChildTodoBtn = createAddChildTodoBtn();
        let completeBtn = createCompleteBtn();
        let deleteBtn = createDleteBtn();
        let childTodoList = document.createElement('ul');
        newTodo.textContent = todo.value;
        newChildDiv.appendChild(newTodo);
        newChildDiv.appendChild(addChildTodoBtn);
        newChildDiv.appendChild(completeBtn);
        newChildDiv.appendChild(deleteBtn);
        newDiv.appendChild(newChildDiv);
        console.log(newDiv);
        newDiv.appendChild(childTodoList);
        todoList.appendChild(newDiv);
    }
    todo.focus();
    todo.value = '';
}

/*completeボタン生成*/
function createCompleteBtn(){
    let completeBtn = document.createElement('button');
    completeBtn.textContent = 'complete';
    completeBtn.addEventListener('click', clickCompleteBtn);
    return completeBtn;
}

/*deleteボタン生成*/
function createDleteBtn(){
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'delete';
    deleteBtn.addEventListener('click', clickDeleteBtn)
    return deleteBtn;
}

function createAddChildTodoBtn(){
    let addchildTodoBtn = document.createElement('button');
    addchildTodoBtn.textContent = '+';
    addchildTodoBtn.addEventListener('click', clickChildTodoAddBtn);
    return addchildTodoBtn;
}

function clickChildTodoAddBtn(e){
    let childTodoForm = document.createElement('input');
    let addChidTodoBtn = document.createElement('button');
    let ul = e.target.closest('.todolistrow').querySelector('ul');
    childTodoForm.type = 'text';
    addChidTodoBtn.textContent = 'add';
    addChidTodoBtn.addEventListener('click',clickAddChidTodoBtn);
    console.log(ul);
    ul.prepend(addChidTodoBtn);
    ul.prepend(childTodoForm);
}

function clickAddChidTodoBtn(e){
    let ChildTodoForm = e.target.previousElementSibling;
    let newP = document.createElement('p');
    let newLi = document.createElement('li');
    let checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    newP.textContent = ChildTodoForm.value;
    newP.addEventListener('dblclick',editTodo);
    newLi.appendChild(checkBox);
    newLi.appendChild(newP);
    if(newP.textContent !== ''){
    e.target.parentNode.appendChild(newLi);
    e.target.parentNode.querySelector('input[type="text"]').remove();
    e.target.parentNode.querySelector('button').remove();
    }
}

/*completeボタンクリックした時の処理*/
function clickCompleteBtn(e){
    let target = e.target.closest('.todolistrow');
    target.className = 'completelistrow';
    completeList.appendChild(target);
    e.target.textContent = 'return';
    e.target.removeEventListener('click', clickCompleteBtn); //completeボタンが押されたら一度イベントリスナーを解除して
    e.target.addEventListener('click', clickReturnBtn); //returnボタンのイベントリスナーを登録し直す
}

/*deleteボタン押した時の処理*/
function clickDeleteBtn(e){
    console.log(e.target.parentNode.parentNode);
    if (window.confirm('削除してもよろしいですか？')){
        e.target.parentNode.parentNode.remove();
    }
}

/*returnボタン押した時の処理*/
function clickReturnBtn(e){
    let target = e.target.closest('.completelistrow');
    target.className = 'todolistrow';
    todoList.appendChild(target);
    e.target.textContent = 'complete';
    e.target.removeEventListener('click', clickReturnBtn); //returnボタンが押されたら一度イベントリスナー解除して
    e.target.addEventListener('click', clickCompleteBtn); //completeボタンのイベントリスナーを登録し直す

}

/*todoをダブルクリックしたときその場編集する処理*/
function editTodo(e){
    console.log(e.target);
    let todo = e.target;
    let newP = document.createElement('p');
    let editForm = document.createElement('input');
    let editDoneBtn = document.createElement('button');
    editForm.type = 'text';
    editForm.value = todo.textContent;
    editDoneBtn.textContent = 'done';
    editDoneBtn.addEventListener('click', editDone);
    newP.appendChild(editForm);
    newP.appendChild(editDoneBtn);
    todo.replaceWith(newP);
}

/*その場編集が終わってdoneボタンがクリックされた時の処理*/
function editDone(e){
    let editForm = e.target.previousElementSibling;
    let newP = document.createElement('p');
    if(editForm.value !== ''){
        newP.textContent = editForm.value;
        newP.addEventListener('dblclick', editTodo);
        editForm.parentNode.replaceWith(newP);
    }
}