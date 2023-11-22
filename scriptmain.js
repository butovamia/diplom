//#region interaction
document.addEventListener('DOMContentLoaded', function () {
    // Получаем данные о пользователе из локального хранилища
    const userDataString = localStorage.getItem('usersData');

    if (userDataString) {
        // Преобразуем строку JSON в объект
        const userData = JSON.parse(userDataString);

        // Отображаем данные о пользователе в интерфейсе
        document.getElementById("username").textContent = `Логин: ${userData.username}`;
        document.getElementById("userRole").textContent = `Роль: ${decodeURIComponent(userData.role)}`;
    }

    // По умолчанию открываем первую вкладку
    document.getElementById("Tab1").style.display = "block";
    document.getElementById("Tab5").style.display = "none";

    // Отображаем оферы при загрузке страницы
    showOffers();

    // Отображаем персонал при загрузке страницы
    showPersonnel();
    showVacancies() 
    showPersonnelForMatching()
});


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
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " active";
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    // Устанавливаем текст уведомления
    notificationMessage.textContent = message;

    // Показываем уведомление
    notification.classList.remove('hide');

    // Через 5 секунд скрываем уведомление
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// Функция для скрытия уведомления
function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hide');
}
//#endregion

//#region offer
function createOffer(event) {
    event.preventDefault();

    // Получаем значения полей из формы
    const companyName = document.getElementById("companyName").value;
    const offerName = document.getElementById("offerName").value;
    const salary = document.getElementById("salary").value;
    const language = document.getElementById("language").value;
    const technologies = document.getElementById("technologies").value;

    // Создаем объект с данными оффера
    const offerData = {
        companyName: encodeURI(companyName),
        offerName: encodeURI(offerName),
        salary: encodeURI(salary),
        language: encodeURI(language),
        technologies: encodeURI(technologies),
    };
    showNotification('Офер успешно создан!');

    // Отправляем данные на сервер (замените на свои данные и укажите правильный путь к offers.json)
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => response.json())
        .then(existingData => {
            const existingOffersString = atob(existingData.content);
            let existingOffers;

            try {
                existingOffers = JSON.parse(existingOffersString);

                if (!Array.isArray(existingOffers)) {
                    existingOffers = [existingOffers];
                }
            } catch (error) {
                existingOffers = [];
            }

            // Добавляем новый оффер
            existingOffers.push(offerData);

            // Обновляем содержимое файла с учетом новых данных
            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingOffers)))).replace(/.{76}/g, "$&\n");
            const githubToken = 'ghp_B25NgQ3Z8M7k9tU5dlD5Kc';

            fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken + 'cSi0obAX0fKZVB'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Добавление нового оффера',
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
        })
        .catch(error => {
            console.error('Ошибка при получении предыдущей версии файла:', error);
        });

}

function showOffers() {
    // Получаем данные о оферах из файла offers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const offersString = atob(data.content);
            const decodedoffersString = decodeURIComponent(offersString);
            let offers;

            try {
                offers = JSON.parse(decodedoffersString);

                if (!Array.isArray(offers)) {
                    offers = [offers];
                }
            } catch (error) {
                offers = [];
            }

            // Очищаем список оферов
            const offersList = document.getElementById('offers');
            offersList.innerHTML = '';

            // Выводим каждый офер
            offers.forEach(offer => {
                const offerItem = document.createElement('div');
                offerItem.classList.add('offer-item');

                const content = `
                    <p>Компания: ${offer.companyName}</p>
                    <p>Офер: ${offer.offerName}</p>
                    <p>Зарплата: ${offer.salary}</p>
                    <p>Язык: ${offer.language}</p>
                    <p>Технологии: ${offer.technologies}</p>
                `;

                offerItem.innerHTML = content;
                offersList.appendChild(offerItem);
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных о оферах:', error);
        });
}
//#endregion

//#region personal
function registerEmployee(event) {
    event.preventDefault();

    // Получаем значения полей из формы
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const middleName = document.getElementById("middleName").value;
    const birthYear = document.getElementById("birthYear").value;
    const experience = document.getElementById("experience").value;
    const employeeTechnologies = document.getElementById("employeeTechnologies").value;
    const expectedSalary = document.getElementById("expectedSalary").value;

    // Создаем объект с данными о сотруднике
    const employeeData = {
        firstName: encodeURI(firstName),
        lastName: encodeURI(lastName),
        middleName: encodeURI(middleName),
        birthYear: encodeURI(birthYear),
        experience: encodeURI(experience),
        technologies: encodeURI(employeeTechnologies),
        expectedSalary: encodeURI(expectedSalary),
    };
    

    // Отправляем данные на сервер (замените на свои данные и укажите правильный путь к employees.json)
    fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
        .then(response => response.json())
        .then(existingData => {
            const existingEmployeesString = atob(existingData.content);
            let existingEmployees;

            try {
                existingEmployees = JSON.parse(existingEmployeesString);

                if (!Array.isArray(existingEmployees)) {
                    existingEmployees = [existingEmployees];
                }
            } catch (error) {
                existingEmployees = [];
            }

            // Добавляем нового сотрудника
            existingEmployees.push(employeeData);

            // Обновляем содержимое файла с учетом новых данных
            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingEmployees)))).replace(/.{76}/g, "$&\n");
            const githubToken = 'ghp_B25NgQ3Z8M7k9tU5dlD5Kc';
            console.log('Отправляемые данные:', JSON.stringify(existingEmployees));

            fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken + 'cSi0obAX0fKZVB'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Добавление нового сотрудника',
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
        })
        .catch(error => {
            console.error('Помилка при отриманні попередньої версії файлу:', error);
        });

    showNotification('Працівник успішно зареєстрований!');
}

function showPersonnel() {
    // Получаем данные о персонале из файла employees.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const personnelString = atob(data.content);
            const decodedPersonnelString = decodeURIComponent(personnelString);

            let personnel;

            try {
                personnel = JSON.parse(decodedPersonnelString);

                if (!Array.isArray(personnel)) {
                    personnel = [personnel];
                }
            } catch (error) {
                personnel = [];
            }

            // Очищаем список персонала
            const personnelList = document.getElementById('personnelList');
            personnelList.innerHTML = '';

            // Выводим каждого сотрудника
            personnel.forEach(person => {
                const personItem = document.createElement('div');
                personItem.classList.add('person-item');

                const content = `
                    <p>Ім'я: ${person.firstName}</p>
                    <p>Прізвище: ${person.lastName}</p>
                    <p>Рік народження: ${person.birthYear}</p>
                    <p>Стаж: ${person.experience}</p>
                    <p>Очікувана зарплатня: ${person.expectedSalary}</p>
                `;

                personItem.innerHTML = content;
                personnelList.appendChild(personItem);
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных о персонале:', error);
        });
}

//#endregion

//#region vacancies
function showVacancies() {
    // Получаем данные о вакансиях из файла offers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const vacanciesString = atob(data.content);
            const decodedVacanciesString = decodeURIComponent(vacanciesString);
            let vacancies;

            try {
                vacancies = JSON.parse(decodedVacanciesString);

                if (!Array.isArray(vacancies)) {
                    vacancies = [vacancies];
                }
            } catch (error) {
                vacancies = [];
            }

            // Очищаем список вакансий
            const vacanciesContainer = document.getElementById('vacanciesContainer');
            vacanciesContainer.innerHTML = '';

            // Выводим каждую вакансию
            vacancies.forEach((vacancy, index) => {
                const vacancyItem = document.createElement('div');
                vacancyItem.classList.add('vacancy-item');
                vacancyItem.id = `vacancy_${index}`;
                vacancyItem.draggable = true;
                vacancyItem.innerHTML = `
                    <p>Компания: ${vacancy.companyName}</p>
                    <p>Офер: ${vacancy.offerName}</p>
                    <p>Зарплата: ${vacancy.salary}</p>
                    <p>Язык: ${vacancy.language}</p>
                    <p>Технологии: ${vacancy.technologies}</p>
                `;
                vacanciesContainer.appendChild(vacancyItem);
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных о вакансиях:', error);
        });
}

function showPersonnelForMatching() {
    // Получаем данные о персонале из файла employees.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const personnelString = atob(data.content);
            const decodedPersonnelString = decodeURIComponent(personnelString);
            let personnel;

            try {
                personnel = JSON.parse(decodedPersonnelString);

                if (!Array.isArray(personnel)) {
                    personnel = [personnel];
                }
            } catch (error) {
                personnel = [];
            }

            // Очищаем список персонала
            const personnelContainer = document.getElementById('employeesContainer');
            personnelContainer.innerHTML = '';

            // Выводим каждого сотрудника
            personnel.forEach((person, index) => {
                const personItem = document.createElement('div');
                personItem.classList.add('person-item');
                personItem.id = `employee_${index}`;
                personItem.draggable = true;
                personItem.innerHTML = `
                    <p>Ім'я: ${person.firstName}</p>
                    <p>Прізвище: ${person.lastName}</p>
                    <p>Рік народження: ${person.birthYear}</p>
                    <p>Стаж: ${person.experience}</p>
                    <p>Очікувана зарплатня: ${person.expectedSalary}</p>
                `;
                personnelContainer.appendChild(personItem);
            });
        })
        .catch(error => {
            console.error('Ошибка при получении данных о персонале:', error);
        });
}


function handleMatchingConfirmation() {
    // Получаем выбранную вакансию и выбранных сотрудников
    const selectedVacancy = document.querySelector('.vacancy-item.selected');
    const selectedEmployees = document.querySelectorAll('.employee-item.selected');

    // Проверяем, что вакансия и сотрудники выбраны
    if (selectedVacancy && selectedEmployees.length > 0) {
        // Создаем объект для хранения данных о подтвержденных соответствиях
        const confirmedMatches = {
            vacancy: {
                companyName: selectedVacancy.dataset.companyName,
                offerName: selectedVacancy.dataset.offerName,
                salary: selectedVacancy.dataset.salary,
                language: selectedVacancy.dataset.language,
                technologies: selectedVacancy.dataset.technologies,
            },
            employees: [],
        };

        // Добавляем данные о каждом выбранном сотруднике
        selectedEmployees.forEach(employee => {
            confirmedMatches.employees.push({
                firstName: employee.dataset.firstName,
                lastName: employee.dataset.lastName,
                middleName: employee.dataset.middleName,
                birthYear: employee.dataset.birthYear,
                experience: employee.dataset.experience,
                technologies: employee.dataset.technologies,
                expectedSalary: employee.dataset.expectedSalary,
            });
        });

        // Здесь вы можете выполнить необходимые действия с подтвержденными соответствиями,
        // например, отправить данные на сервер, обновить файлы и т. д.

        // После завершения операций очищаем выбранных сотрудников и вакансию
        selectedEmployees.forEach(employee => {
            employee.classList.remove('selected');
            // Здесь вы также можете удалить сотрудника из employees.json
        });

        selectedVacancy.classList.remove('selected');
        // Здесь вы также можете удалить вакансию из offers.json

        // Показываем уведомление о подтвержденных соответствиях
        showNotification('Подтверждены соответствия вакансии и сотрудников.');

        // Обновляем отображение вакансий и персонала
        showVacancies();
        showPersonnel();
    } else {
        // Показываем уведомление, если вакансия или сотрудники не выбраны
        showNotification('Выберите вакансию и хотя бы одного сотрудника для подтверждения.');
    }
}

// Добавление/удаление класса "selected" при клике на вакансию
document.addEventListener('click', function(event) {
    const vacancyItem = event.target.closest('.vacancy-item');
    if (vacancyItem) {
        // Убираем выделение со всех вакансий
        document.querySelectorAll('.vacancy-item').forEach(item => item.classList.remove('selected'));
        // Добавляем/удаляем класс "selected" текущей вакансии
        vacancyItem.classList.toggle('selected');
    }
});

// Добавление/удаление класса "selected" при клике на сотрудника
document.addEventListener('click', function(event) {
    const personnelItems = document.querySelectorAll('.person-item');

    // Перебираем каждый элемент персонала
    personnelItems.forEach(personItem => {
        // Добавляем обработчик события клика
        personItem.addEventListener('click', () => {
            // Переключаем класс "selected" для текущего элемента
            personItem.classList.toggle('selected');
        });
    });
});


//#endregion