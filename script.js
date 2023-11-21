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

function checkExistingUser(username, password) {
    return fetch('https://api.github.com/repos/butovamia/diplom/contents/users.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const existingUsersString = atob(data.content);
            let existingUsers;

            try {
                existingUsers = JSON.parse(existingUsersString);

                if (!Array.isArray(existingUsers)) {
                    existingUsers = [existingUsers];
                }
            } catch (error) {
                existingUsers = [];
            }

            // Проверяем, существует ли пользователь с таким именем и паролем
            const userExists = existingUsers.some(user => user.username === username && user.password === password);

            if (userExists) {
                // Найден пользователь, сохраняем информацию в localStorage
                const foundUser = existingUsers.find(user => user.username === username && user.password === password);
                localStorage.setItem('usersData', JSON.stringify(foundUser));
            }

            return userExists; // Возвращаем флаг существования пользователя
        });
}


function login(event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Реализуйте логику входа на стороне клиента
    console.log("Вход выполнен с логином: " + username);

    // Вызываем функцию для проверки существующего пользователя
    checkExistingUser(username, password)
        .then(userExists => {
            if (userExists) {
                console.log("Вход выполнен успешно.");


                // После успешного входа
                document.getElementById("loginForm").style.display = "none"; // Скрываем форму входа
                window.location.href = "maininterface.html"; // Перенаправляем на страницу maininterface.html


                // Также вы можете обновить содержимое главного интерфейса или выполнить другие действия

                return true;
            } else {
                console.log("Пользователь не найден или неверный пароль.");
                return false;
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке пользователя:', error);
            return false;
        });
}



function register(event) {
    event.preventDefault();
    var newUsername = document.getElementById("newUsername").value;
    var newPassword = document.getElementById("newPassword").value;
    // Добавлен код для получения выбранной роли
    var role = document.getElementById("role").value;

    // Проверка наличия пользователя перед регистрацией
    checkExistingUser(newUsername)
        .then(exists => {
            if (exists) {
                console.log("Пользователь уже существует");
            } else {
                console.log("Пользователь зарегистрирован с логином: " + newUsername + " и ролью: " + role);
                // Сохраните данные в локальном хранилище или другом месте по вашему выбору
                saveUserDataLocally(newUsername, newPassword, role);
                // Отправите данные на GitHub (замените на свои данные)
                sendToGitHub(newUsername, newPassword, role);
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке существующего пользователя:', error);
        });
}

function saveUserDataLocally(username, password, role) {
    // Создаем объект с данными пользователя
    const userData = {
        username: username,
        password: password,
        role: role, // Добавлена роль пользователя
    };

    // Конвертируем объект в строку JSON
    const userDataString = JSON.stringify(userData);

    // Сохраняем строку JSON в localStorage
    localStorage.setItem('userData', userDataString);

    console.log('Данные пользователя успешно сохранены локально.');
}

// ...

function sendToGitHub(username, password, role) {
    const githubToken = 'ghp_B25NgQ3Z8M7k9tU5dlD5Kc';

    const data = {
        username: encodeURIComponent(username),
        password: encodeURIComponent(password),
        role: encodeURIComponent(role),
    };

    const content = btoa(JSON.stringify([data]));

    fetch('https://api.github.com/repos/butovamia/diplom/contents/users.json')
        .then(response => response.json())
        .then(existingData => {
            const existingUsersString = atob(existingData.content);
            let existingUsers;

            try {
                existingUsers = JSON.parse(existingUsersString);

                if (!Array.isArray(existingUsers)) {
                    existingUsers = [existingUsers];
                }
            } catch (error) {
                existingUsers = [];
            }

            const userExists = existingUsers.some(user => user.username === data.username);

            if (userExists) {
                console.log('Пользователь с таким именем уже существует.');
            } else {
                existingUsers.push(data);

                const updatedContent = btoa(JSON.stringify(existingUsers));

                fetch('https://api.github.com/repos/butovamia/diplom/contents/users.json', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken + 'cSi0obAX0fKZVB'}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Добавление нового пользователя',
                        content: updatedContent,
                        sha: existingData.sha,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Данные успешно отправлены на GitHub:', data);
                    })
                    .catch(error => {
                        console.error('Ошибка при обновлении данных на GitHub:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Ошибка при получении предыдущей версии файла:', error);
        });
}