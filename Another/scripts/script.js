const bookshelf = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOK_APPS_D";

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const submitForm = document.getElementById("inputBook");
    const searchBook = document.getElementById("searchBook");
    const bookName = document.getElementById("searchBookTitle");

    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
        swal("Good job!", "Buku Berhasil Ditambahkan!", "success");
        informasiBuku();
    });

    searchBook.addEventListener("submit", function (event) {
        event.preventDefault();
        cariBuku(bookName);
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
    informasiBuku();
});

function addBook() {
    const judul = document.getElementById("inputBookTitle").value;
    const penulis = document.getElementById("inputBookAuthor").value;
    const tahun = document.getElementById("inputBookYear").value;
    const bookIsComplete = document.getElementById("inputBookIsComplete").checked;
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, judul, penulis, tahun, bookIsComplete, false);
    bookshelf.push(bookObject);

    informasiBuku()
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, checkBox, isComplete) {
    return {
        id,
        title,
        author,
        year,
        checkBox,
        isComplete
    }
}

function makeBook(bookObject) {
    const textTitle = document.createElement("h3");
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement("p");
    textAuthor.innerText = `Author: ${bookObject.author}`;

    const textYear = document.createElement("p");
    textYear.innerText = `Year: ${bookObject.year}`;

    const textContainer = document.createElement("article");
    textContainer.classList.add("book_item");
    textContainer.append(textTitle, textAuthor, textYear);

    if (bookObject.isComplete) {
        const action = document.createElement("div");
        action.classList.add("action");

        const undoButton = document.createElement("button");
        undoButton.innerText = "Belum selesai dibaca";
        undoButton.classList.add("green");
        undoButton.addEventListener("click", function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.innerText = "Hapus buku";
        trashButton.classList.add("red");
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookObject.id);
        });

        action.append(undoButton, trashButton);
        textContainer.append(action);
    } else if (bookObject.checkBox == true) {
        const action = document.createElement("div");
        action.classList.add("action");

        const undoButton = document.createElement("button");
        undoButton.innerText = "Belum selesai dibaca";
        undoButton.classList.add("green");
        undoButton.addEventListener("click", function () {
            undoTaskFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.innerText = "Hapus buku";
        trashButton.classList.add("red");
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookObject.id);
        });

        action.append(undoButton, trashButton);
        textContainer.append(action);
    } else {
        const action = document.createElement("div");
        action.classList.add("action");

        const checkButton = document.createElement("button");
        checkButton.innerText = "Selesai dibaca";
        checkButton.classList.add("green");
        checkButton.addEventListener("click", function () {
            addTaskToCompleted(bookObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.innerText = "Hapus buku";
        trashButton.classList.add("red");
        trashButton.addEventListener("click", function () {
            removeTaskFromCompleted(bookObject.id);
        });
        action.append(checkButton, trashButton);
        textContainer.append(action);
    }

    return textContainer;
}

function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget === null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    informasiBuku();
}

function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget === null) return;
    bookTarget.isComplete = false;
    bookTarget.checkBox = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    informasiBuku();
}

function removeTaskFromCompleted(bookId) {
    let yakin = confirm("Anda yakin ingin menghapus?");

    if (yakin) {
        const bookTarget = findBookIndex(bookId);
        if (bookTarget === -1) return;
        bookshelf.splice(bookTarget, 1);
        swal("Good job!", "Buku Berhasil Dihapus!", "success");
        informasiBuku();
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    } else {
        return
    }
}

function findBook(bookId) {
    for (bookItem of bookshelf) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (index in bookshelf) {
        if (bookshelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function informasiBuku(){
    let total = 0;
    let belum = 0;
    let selesai = 0;

    const numberTotal = document.querySelector(".numberTotal");
    const numberBelum = document.querySelector(".numberBelum");
    const numberSelesai = document.querySelector(".numberSelesai");

    for(let rakBuku of bookshelf){
        total++;

        if(rakBuku.isComplete == true || rakBuku.checkBox == true){
            selesai += 1;
        } else{
            belum += 1;
        }
    }

    numberTotal.innerHTML = total;
    numberBelum.innerHTML = belum;
    numberSelesai.innerHTML = selesai
}

function cariBuku(bookName) {
    if (bookshelf != "") {
        for (index in bookshelf) {
            if (bookshelf[index].title === bookName.value) {
                swal(`Buku ${bookshelf[index].title} TERSEDIA`, '', "success");
                return;
            }
            else {
                swal(`Maaf! Buku ${bookName.value} TIDAK TERSEDIA`, "Pastikan Anda Telah Mengisi Judul dengan Benar!", "warning");
                return;
            }
        }
    } else {
        swal("Maaf! Rak Buku Kosong!", '', "error");
    }
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(bookshelf);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const inComplete = document.getElementById("incompleteBookshelfList");
    inComplete.innerHTML = "";
    const complete = document.getElementById("completeBookshelfList");
    complete.innerHTML = "";

    for (bookItem of bookshelf) {
        const bookElement = makeBook(bookItem);

        if (bookItem.isComplete == false && bookItem.checkBox == false) {
            inComplete.append(bookElement);
        }
        else if (bookItem.checkBox == true) {
            complete.append(bookElement);
        }
        else {
            complete.append(bookElement);
        }
    }
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (let book of data) {
            bookshelf.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}