'use strict';

const todoList = document.querySelector('#todolist ul');
const doneList = document.querySelector('#donelist ul');
const todoInput = document.getElementById('todo');
const memoInput = document.getElementById('memo');
const clientInput = document.getElementById('client');
const startdateInput = document.getElementById('startdate');
const enddateInput = document.getElementById('enddate');
const priorityInput = document.getElementById('priority');
const submitBtn = document.getElementById('submit');
const form = document.querySelector('form');

const clearBtn = document.querySelector('.clearbutton');
clearBtn.addEventListener('click', clearDB);


//dbオブジェクトを格納する変数の宣言
let db;

//データベースをオープンするためのリクエストオブジェクトを作成
const openRequest = window.indexedDB.open('todo_db',1);

//リクエスト失敗時のハンドラー
openRequest.addEventListener('error', function(){
    console.log('データベースのオープンに失敗しました。');
    window.alert('アクセスエラー。ページをリロードしてください。改善しない場合は管理者に問い合わせてください');
})

//リクエスト成功時のハンドラー
openRequest.addEventListener('success', function(){
    console.log('データベースのオープンに成功しました。');

    db = openRequest.result;

    displayTodoList();

})

//データベースがまだ存在していない時のハンドラー
openRequest.addEventListener('upgradeneeded', function(e){
    db = e.target.result;

    //オブジェクトストア(テーブル)の生成
    //一意なキーとしてidを使用
    const objectStore = db.createObjectStore('todo_os', {keyPath:'id', autoIncrement:true});
    
    //子todo用のオブジェクトストア
    const objectStoreSub = db.createObjectStore('childTodo_os',{keyPath:'id', autoIncrement:true});
    
    //オブジェクトストアにどんなインデックス（データ項目）を格納するのか定義
    objectStore.createIndex('todo','todo',{unique:false});
    objectStore.createIndex('memo','memo',{unique:false});
    objectStore.createIndex('client','client',{unique:false});
    objectStore.createIndex('startdate','startdate',{unique:false});
    objectStore.createIndex('enddate','enddate',{unique:false});
    objectStore.createIndex('priority','priority',{unique:false});
    objectStore.createIndex('createdate','createdate',{unique:false});
    objectStore.createIndex('doneflg','doneflg',{unique:false});

    //子todo用のオブジェクトストアのインデックスの定義
    //親タスクと紐づけるために、親タスクのidを格納する
    objectStoreSub.createIndex('childtodo','childtodo',{unique:false});
    objectStoreSub.createIndex('parenttodoid','parenttodoid',{unique:false});
    objectStoreSub.createIndex('donechildflg','donechildflg',{unique:false});

    console.log('データベースのセットアップが完了しました');
})

form.addEventListener('submit', addTodoDB);

function addTodoDB(e){

    //フォーム送信のアクションをキャンセルしリロードをしないようにする。
    e.preventDefault();

    //フォームのフィールドに入力された値を取得し、DBに挿入できるようにオブジェクトに格納する
    let createDate = new Date();
    createDate = `${createDate.getFullYear()}/${(createDate.getMonth()+1)}/${createDate.getDate()} ${createDate.getHours().toString().padStart(2, '0')}:${createDate.getMinutes().toString().padStart(2, '0')}:${createDate.getSeconds().toString().padStart(2, '0')}`;
    const newTodo = {todo:todoInput.value, memo:memoInput.value, client:clientInput.value, startdate:startdateInput.value, enddate:enddateInput.value, priority:priorityInput.value, createdate:createDate, doneflg:'F'};
    //読み書き用のデータベーストランザクションを開いて、データの追加に備える
    //indexedDBでのデータベースの操作はトランザクションを使用しなければならない
    const transaction = db.transaction(['todo_os'], 'readwrite');
    
    //オブジェクトストアを呼び出し、変数に格納
    const objectStore = transaction.objectStore('todo_os');

    //newTodoをオブジェクトストアに追加するリクエスト
    const addRequest = objectStore.add(newTodo);

    addRequest.addEventListener('success', function(){
        todoInput.value = '';
        memoInput.value = '';
        clientInput.value = '';
        startdateInput.value = '';
        enddateInput.value = '';
    })

    transaction.addEventListener('complete', function(){
        console.log('データベースへの追加が完了しました。');
        displayTodoList();
    })

    transaction.addEventListener('error', function(){
        console.log('データベースへの追加が失敗しました。');
    })

}

function addChildTodo(e){
    const parentTodoId = Number(e.target.parentNode.getAttribute('data-todo-id'));
    const otherForm = document.querySelectorAll('.addchildtodoform, .editform');
    const pTags = document.querySelectorAll('h3,p');

    //子todoの追加の間は編集できなくする
    pTags.forEach(function(pTag){
        pTag.removeEventListener('dblclick', editTodo)
    })

    //複数の子todoフォームが開かないようにする
    if(!otherForm[0]){
    const newpTag = document.createElement('p');
    const addChildTodoForm = document.createElement('input');
    const addChildTodoFormLabel = document.createElement('label');
    addChildTodoForm.type = 'text';
    addChildTodoFormLabel.textContent = '小タスク: ';
    const editDoneBtn = document.createElement('button');
    editDoneBtn.textContent = 'done';
    editDoneBtn.classList.add('editdonebtn')
    newpTag.appendChild(addChildTodoFormLabel);
    newpTag.appendChild(addChildTodoForm);
    newpTag.appendChild(editDoneBtn);
    newpTag.classList.add('addchildtodoform');
    e.target.parentNode.appendChild(newpTag);

    editDoneBtn.addEventListener('click', function(){
        if(addChildTodoForm.value !== ''){
        const newChildTodo = {childtodo:addChildTodoForm.value, parenttodoid:parentTodoId, donechildflg:'F'};
        console.log(newChildTodo);

        const transaction = db.transaction(['childTodo_os'], 'readwrite');
    
        //オブジェクトストアを呼び出し、変数に格納
        const objectStore = transaction.objectStore('childTodo_os');
    
        //newTodoをオブジェクトストアに追加するリクエスト
        const addRequest = objectStore.add(newChildTodo);
    
        transaction.addEventListener('complete', function(){
            console.log('小タスクのデータベースへの追加が完了しました。');
            displayTodoList();
        })
    
        transaction.addEventListener('error', function(){
            console.log('小タスクのデータベースへの追加が失敗しました。');
        })
    } else {
        window.alert('値を入力してください');
    }
    })
    }

}



function displayTodoList(){

    //表示が更新されるたびにtodoList（li要素）を全削除
    //これしないとデータベースの中身が重複して表示されてしまう
    while(todoList.firstChild){
        todoList.removeChild(todoList.firstChild);
    }

    while(doneList.firstChild){
        doneList.removeChild(doneList.firstChild);
    }

    //read onlyでオブジェクトストアをオープン
    const objectStore = db.transaction('todo_os').objectStore('todo_os');
    
    //カーソルをオープンする。カーソルはデータベース内のデータを全て舐めて反復処理をする。
    objectStore.openCursor().addEventListener('success', function(e){
        //カーソルへの参照を変数に格納。.resultでカーソル１件、１件の結果がかえる
        const cursor = e.target.result;
        //オブジェクトストアに反復処理をするデータが残っているか判定
        if(cursor){
            //表示するhtml要素の準備
            const li = document.createElement('li');
            const todoh3tag = document.createElement('h3');
            const memoPtag = document.createElement('p');
            const clientPtag = document.createElement('p');
            const startdatePtag = document.createElement('p');
            const enddatePtag = document.createElement('p');
            const priorityPtag = document.createElement('p');
            const createDatePtag = document.createElement('p');
            createDatePtag.classList.add('createdate');
            
            //その場編集した後にデータベースに格納するため、htmlの要素にデータベースのキー名を格納しておく
            todoh3tag.setAttribute('data-todo-key', 'todo');
            memoPtag.setAttribute('data-todo-key', 'memo');
            clientPtag.setAttribute('data-todo-key', 'client');
            startdatePtag.setAttribute('data-todo-key', 'startdate');
            enddatePtag.setAttribute('data-todo-key', 'enddate');
            priorityPtag.setAttribute('data-todo-key', 'priority');

            //その場編集のイベントリスナー
            todoh3tag.addEventListener('dblclick', editTodo);
            memoPtag.addEventListener('dblclick', editTodo);
            clientPtag.addEventListener('dblclick', editTodo);
            startdatePtag.addEventListener('dblclick', editTodo);
            enddatePtag.addEventListener('dblclick', editTodo);
            priorityPtag.addEventListener('dblclick', editTodo)

            //html要素にデータベースから取得した値を入れる
            todoh3tag.textContent = cursor.value.todo;
            memoPtag.textContent = cursor.value.memo;
            clientPtag.textContent = `依頼者: ${cursor.value.client}`;
            startdatePtag.textContent = `開始日: ${cursor.value.startdate}`;
            enddatePtag.textContent = `終了日: ${cursor.value.enddate}`;
            priorityPtag.textContent = `優先度: ${cursor.value.priority}`;
            createDatePtag.textContent = cursor.value.createdate;
            


            //li要素とデータベースのidを紐づけて削除処理などに利用する！！！
            li.setAttribute('data-todo-id', cursor.value.id);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('deletebtn');
            deleteBtn.addEventListener('click', deleteTodo);

            const doneBtn = document.createElement('button');
            doneBtn.classList.add('donebtn');
            doneBtn.addEventListener('click', doneTodo);

            const returnBtn = document.createElement('button');
            returnBtn.classList.add('returnbtn');
            returnBtn.addEventListener('click', returnTodo);

            const plusBtn = document.createElement('button');
            plusBtn.classList.add('plusbtn');
            plusBtn.addEventListener('click', addChildTodo);

            li.appendChild(todoh3tag);
            li.appendChild(memoPtag);
            li.appendChild(clientPtag);
            li.appendChild(startdatePtag);
            li.appendChild(enddatePtag);
            li.appendChild(priorityPtag);
            li.appendChild(createDatePtag);
            li.appendChild(deleteBtn);

            //子todo表示処理
            //親todoIDで子todoをデータベースから検索し、表示させている
            const objectStoreSub = db.transaction('childTodo_os').objectStore('childTodo_os');
            const parentTodoId = cursor.value.id;
            const parentTodoIdIndex = objectStoreSub.index("parenttodoid");
            const getParentTodoId = parentTodoIdIndex.getAll(parentTodoId);
            getParentTodoId.addEventListener('success', function(e){
                const childTodos = e.target.result;
                if (childTodos.length !== 0) {
                    console.log('子タスクあり');
                    const childUl = document.createElement('ul');
                    const hr = document.createElement('hr');
                    childUl.appendChild(hr);
                    childUl.classList.add('childtodolist');
                    childTodos.forEach(function(childtodo){
                        console.log(childtodo);
                        const childLi = document.createElement('li');
                        const childP = document.createElement('p');
                        childP.textContent = childtodo.childtodo;
                        const checkBox = document.createElement('input');
                        checkBox.type = 'checkbox';
                        const deleteChildBtn = document.createElement('button');
                        deleteChildBtn.classList.add('deletechildbtn');
                        deleteChildBtn.addEventListener('click', deleteChildTodo);
                        childLi.setAttribute('data-childtodo-id', childtodo.id);
                        childLi.appendChild(checkBox);
                        childLi.appendChild(childP);
                        childLi.appendChild(deleteChildBtn);
                        childUl.appendChild(childLi);
                        
                        //子todoの完了状態　未完了状態を変更するイベントリスナー
                        checkBox.addEventListener('change', doneChildTodo);

                        //子todoの完了フラグが立っていたら、チェックボックスをチェックした状態で表示するための処理
                        if(childtodo.donechildflg === 'T'){
                            checkBox.checked = true;
                        } else if (childtodo.donechildflg === 'F'){
                            checkBox.checked = false;
                        }
                    })
                    li.appendChild(childUl);
                } else {
                    console.log('小タスクなし');
                }
            })
            
            if(cursor.value.doneflg === 'F'){
                li.appendChild(plusBtn);
                li.appendChild(doneBtn);
            //優先度によってli要素のスタイル変更
                if(cursor.value.priority === '高'){
                    li.style.border = '2px solid crimson';
                } else if(cursor.value.priority === '中') {
                    li.style.border = '2px solid coral';
                } else {
                    li.style.border = '2px solid limegreen';
                }
                todoList.appendChild(li);
            } else if (cursor.value.doneflg === 'T'){
                li.appendChild(returnBtn);
                li.style.backgroundColor = 'rgb(102, 205, 170)';
                doneList.appendChild(li);
            }
            
            //カーソルの次の項目に処理を進める！！！！！！！！！！
            cursor.continue();
        }
    })


}




function deleteTodo(e){

    if(window.confirm('このtodoを削除しますか？')){
    const deleteTodoId = Number(e.target.parentNode.getAttribute('data-todo-id'));

    const transaction = db.transaction(['todo_os'],'readwrite');
    const objectStore = transaction.objectStore('todo_os');
    const deleteRequest = objectStore.delete(deleteTodoId);

    transaction.addEventListener('complete', function(){
        displayTodoList();
    })
    }
}

function deleteChildTodo(e){
    if(window.confirm('この小タスクを削除しますか？')){
        const deleteChildTodoId = Number(e.target.parentNode.getAttribute('data-childtodo-id'));

        const transaction = db.transaction(['childTodo_os'],'readwrite');
        const objectStore = transaction.objectStore('childTodo_os');
        const deleteRequest = objectStore.delete(deleteChildTodoId);
    
        transaction.addEventListener('complete', function(){
            displayTodoList();
        })
    }
}


function doneTodo(e){
    const doneTodoId = Number(e.target.parentNode.getAttribute('data-todo-id'));
    const transaction = db.transaction(['todo_os'],'readwrite');
    const objectStore = transaction.objectStore('todo_os');

    objectStore.openCursor(IDBKeyRange.only(doneTodoId)).addEventListener('success', function(e){
        const cursor = e.target.result;

        if(cursor){
            cursor.value.doneflg = 'T';
            const updateRequest = cursor.update(cursor.value);
            updateRequest.addEventListener('success', function(){
                console.log('doneリストへの移動が完了しました');
                displayTodoList();
            })
        }
    })
}


function returnTodo(e){
    const returnTodoId = Number(e.target.parentNode.getAttribute('data-todo-id'));
    
    const transaction = db.transaction(['todo_os'],'readwrite');
    const objectStore = transaction.objectStore('todo_os');

    objectStore.openCursor(IDBKeyRange.only(returnTodoId)).addEventListener('success', function(e){
        const cursor = e.target.result;

        if(cursor){
            cursor.value.doneflg = 'F';
            const updateRequest = cursor.update(cursor.value);
            updateRequest.addEventListener('success', function(){
                console.log('doneリストのtodoをtodoリストに戻しました');
                displayTodoList();
            })
        }
    })
}


//子todoの完了フラグをチェックボックスによって変更する処理
function doneChildTodo(e){
    const checked = e.target.checked;
    const childTodoId = Number(e.target.parentNode.getAttribute('data-childtodo-id'));
    const transaction = db.transaction(['childTodo_os'],'readwrite');
    const objectStore = transaction.objectStore('childTodo_os');

    objectStore.openCursor(IDBKeyRange.only(childTodoId)).addEventListener('success', function(e){
        const cursor = e.target.result;
        if(cursor){
            if(checked){
                cursor.value.donechildflg = 'T';
                const updateRequest = cursor.update(cursor.value);
                updateRequest.addEventListener('success', function(){
                    console.log('子タスクのフラグを完了に変更しました');
                })
            } else {
                cursor.value.donechildflg = 'F';
                const updateRequest = cursor.update(cursor.value);
                updateRequest.addEventListener('success', function(){
                    console.log('子タスクのフラグを未完了に変更しました');
                })
            }
        }
    })
}

function editTodo(e){

    const pTags = document.querySelectorAll('h3,p');

    const editTodoId = Number(e.target.parentNode.getAttribute('data-todo-id'));
    const editTodoKey = e.target.getAttribute('data-todo-key');

    const editTarget = e.target;
    
    const editPtag = document.createElement('p');
    
    let editForm;
    
    const editLabel = document.createElement('label');
    
    const editDoneBtn = document.createElement('button');
    editDoneBtn.textContent = 'done';
    editDoneBtn.classList.add('editdonebtn')

    if(editTodoKey === 'todo'){
        editForm = document.createElement('input');
        editForm.type = 'text';
        editForm.value = editTarget.textContent;
        editLabel.textContent = 'タスク:';
        editPtag.appendChild(editLabel);
    } else if(editTodoKey === 'memo'){
        editForm = document.createElement('textarea');
        editForm.value = editTarget.textContent;
        editLabel.textContent = 'メモ:';
        editPtag.appendChild(editLabel);
    } else if(editTodoKey === 'client'){
        editForm = document.createElement('input');
        editForm.type = 'text';
        editForm.value = editTarget.textContent.replace('依頼者: ','');
        editLabel.textContent = '依頼者:';
        editPtag.appendChild(editLabel);
    } else if(editTodoKey === 'startdate'){
        editForm = document.createElement('input');
        editForm.type = 'date';
        editForm.value = editTarget.textContent.replace('開始日: ','');
        editLabel.textContent = '開始日:';
        editPtag.appendChild(editLabel);
    } else if(editTodoKey === 'enddate'){
        editForm = document.createElement('input');
        editForm.type = 'date';
        editForm.value= editTarget.textContent.replace('終了日: ','');
        editLabel.textContent = '終了日:';
        editPtag.appendChild(editLabel);
    } else if(editTodoKey === 'priority'){
        editForm = document.createElement('select');
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        const option3 = document.createElement('option');
        option1.textContent = '高';
        option2.textContent = '中';
        option3.textContent = '低';
        editForm.appendChild(option1);
        editForm.appendChild(option2);
        editForm.appendChild(option3);
        editLabel.textContent = '優先度:';
        editPtag.appendChild(editLabel);
    }

    editPtag.classList.add('editform');
    editPtag.appendChild(editForm);
    editPtag.appendChild(editDoneBtn);
    editTarget.replaceWith(editPtag);

    //即時編集フォーム開いてる間はほかの編集フォームは開けないようにする
    pTags.forEach(function(pTag){
        pTag.removeEventListener('dblclick', editTodo)
    })
    

    editDoneBtn.addEventListener('click', function(){
        if(editForm.value !== ''){
        const editFormInput = editForm.value;
        
        const transaction = db.transaction(['todo_os'],'readwrite');
        const objectStore = transaction.objectStore('todo_os')

        objectStore.openCursor(IDBKeyRange.only(editTodoId)).addEventListener('success', function(e){
            const cursor = e.target.result;
    
            if(cursor){
                //ここ、cursor.value.editTodoKeyにして詰まった。基本がなってない。
                cursor.value[editTodoKey] = editFormInput;
                const updateRequest = cursor.update(cursor.value);
                updateRequest.addEventListener('success', function(){
                    console.log('todoの即時編集処理が完了しました');
                    displayTodoList();
                })
            }
        })
    } else {
        window.alert('値を入力してください');
    }
    })
}



function clearDB(){
    if(window.confirm('データを全て削除します。よろしいですか？')){
        const DBDeleteRequest = window.indexedDB.deleteDatabase("todo_db");

        DBDeleteRequest.addEventListener('error', function(){
            console.log('データベースの削除に失敗しました');
        })

        DBDeleteRequest.addEventListener('success', function(){
            console.log('データベースの削除が完了しました');
            displayTodoList();
        })
    }
}



/*
function addTodo(e){
    e.preventDefault();
    console.log(priorityInput.value);
    const li = document.createElement('li');
    const todoh3tag = document.createElement('h3');
    const memoPtag = document.createElement('p');
    const clientPtag = document.createElement('p');
    const datePtag = document.createElement('p');
    const priorityPtag = document.createElement('p');
    const createDate = new Date();
    const createDatePtag = document.createElement('p');
    createDatePtag.classList.add('createdate');

    todoh3tag.textContent = todoInput.value;
    memoPtag.textContent = memoInput.value;
    clientPtag.textContent = `依頼者:${clientInput.value}`;
    datePtag.textContent = `開始日: ${startdateInput.value} 終了日: ${enddateInput.value}`;
    priorityPtag.textContent = `優先度: ${priorityInput.value}`;
    createDatePtag.textContent = `${createDate.getFullYear()}/${(createDate.getMonth()+1)}/${createDate.getDate()} ${createDate.getHours()}:${createDate.getMinutes()}:${createDate.getSeconds()}`;

    if(priorityInput.value === '高'){
        li.style.border = '5px solid crimson';
    } else if( priorityInput.value === '中') {
        li.style.border = '5px solid coral';
    } else {
        li.style.border = '5px solid limegreen';
    }

    li.appendChild(todoh3tag);
    li.appendChild(memoPtag);
    li.appendChild(clientPtag);
    li.appendChild(datePtag);
    li.appendChild(priorityPtag);
    li.appendChild(createDatePtag);

    todoList.appendChild(li);
}
*/

/* 
childTodo_os
id 一意
todocreatedate 親todoのcreatedateを取ってきて格納する（親todoに紐づけて表示する時に使う）
childtodo フォームで入力されたテキストを格納する
*/