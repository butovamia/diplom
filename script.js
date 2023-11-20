function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function login(event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    // Реализуйте логику входа на стороне клиента
    console.log("Вход выполнен с логином: " + username);
}

function register(event) {
    event.preventDefault();
    var newUsername = document.getElementById("newUsername").value;
    var newPassword = document.getElementById("newPassword").value;
    // Реализуйте логику регистрации на стороне клиента
    console.log("Пользователь зарегистрирован с логином: " + newUsername);
    // Сохраните данные в локальном хранилище или другом месте по вашему выбору
    saveUserDataLocally(newUsername, newPassword);
    // Отправите данные на GitHub (замените на свои данные)
    sendToGitHub(newUsername, newPassword);
}

function saveUserDataLocally(username, password) {
    // Создаем объект с данными пользователя
    const userData = {
        username: username,
        password: password,
    };

    // Конвертируем объект в строку JSON
    const userDataString = JSON.stringify(userData);

    // Сохраняем строку JSON в localStorage
    localStorage.setItem('userData', userDataString);

    console.log('Данные пользователя успешно сохранены локально.');
}


function sendToGitHub(username, password) {
    // Это пример. Не храните токен на стороне клиента в реальном приложении!
    const githubToken = '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';

    const data = {
        username: username,
        password: password,
    };

    const content = btoa(JSON.stringify(data));

    fetch('https://api.github.com/repos/in7264/miadiplom/contents/users.json', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'Добавление данных пользователя',
            content: content,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Данные успешно отправлены на GitHub:', data);
    })
    .catch(error => {
        console.error('Ошибка при отправке данных на GitHub:', error);
    });
}
