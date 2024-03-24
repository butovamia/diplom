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
                showNotification('Помилка при отриманні даних із сервера');
                throw new Error('Помилка при отриманні даних із сервера');
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

            // Перевіряємо, чи існує користувач з таким ім'ям та паролем
            const userExists = existingUsers.some(user => user.username === username && user.password === password);

            if (userExists) {
                // Знайдено користувача, зберігаємо інформацію в localStorage
                const foundUser = existingUsers.find(user => user.username === username && user.password === password);
                localStorage.setItem('usersData', JSON.stringify(foundUser));
            }

            return userExists; // Повертаємо існуваннуючого користувача
        });
}


function login(event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;


    // Викликаємо функцію для перевірки існуючого користувача
    checkExistingUser(username, password)
        .then(userExists => {
            if (userExists) {
                console.log("Вхід виконано успішно.");


                // Після успішного входу
                document.getElementById("loginForm").style.display = "none"; // Приховуємо форму входу
                window.location.href = "maininterface.html"; // Перенаправляємо на сторінку maininterface.html

                return true;
            } else {
                console.log("Користувача не знайдено або неправильний пароль.");
                showNotification('Користувача не знайдено або неправильний пароль.');
                return false;
            }
        })
        .catch(error => {
            console.error('Помилка під час перевірки користувача', error);
            showNotification('Помилка під час перевірки користувача');
            return false;
        });
}



function register(event) {
    event.preventDefault();
    var newUsername = document.getElementById("newUsername").value;
    var newPassword = document.getElementById("newPassword").value;
    var role = document.getElementById("role").value;

    // Перевірка наявності користувача перед реєстрацією
    checkExistingUser(newUsername)
        .then(exists => {
            if (exists) {
                console.log("Користувач вже існує");
            } else {
                console.log("Користувач зареєстрований з логіном: "+ newUsername +" та роллю: "+ role);
                // Збереження даних в локальному сховищі
                saveUserDataLocally(newUsername, newPassword, role);
                // Відправка даних на GitHub 
                sendToGitHub(newUsername, newPassword, role);
            }
        })
        .catch(error => {
            showNotification('Помилка під час перевірки існуючого користувача');
            console.error('Помилка під час перевірки існуючого користувача:', error);
        });
}

function saveUserDataLocally(username, password, role) {
    // Створюємо об'єкт із даними користувача
    const userData = {
        username: username,
        password: password,
        role: role,
    };

    // Конвертуємо об'єкт у рядок JSON
    const userDataString = JSON.stringify(userData);

    // Зберігаємо рядок JSON в localStorage
    localStorage.setItem('userData', userDataString);

    console.log('Дані користувача успішно збережені локально.');
}

function sendToGitHub(username, password, role) {
    const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

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
                console.log("Користувач із таким ім'ям вже існує.");
                showNotification("Користувач із таким ім'ям вже існує.");
            } else {
                showNotification("Користувач зареєстрований");
                existingUsers.push(data);

                const updatedContent = btoa(JSON.stringify(existingUsers));

                fetch('https://api.github.com/repos/butovamia/diplom/contents/users.json', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Додавання нового користувача',
                        content: updatedContent,
                        sha: existingData.sha,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Дані успішно відправлені на GitHub:', data);
                    })
                    .catch(error => {
                        console.error('Помилка при оновленні даних на GitHub:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Ошибка при получении предыдущей версии файла:', error);
        });
}

function showNotification(message, isSuccess = true) {
    // Створення елемент сповіщення
    const notification = document.createElement('div');
    notification.className = isSuccess ? 'notification success' : 'notification error';
    notification.textContent = message;

    // Додавання повідомлення до тіла
    document.body.appendChild(notification);

    // Установлення тайм-ауту, щоб видалити сповіщення через певний час (наприклад, 3 секунди)
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
