//#region interaction
document.addEventListener('DOMContentLoaded', function () {
    // Отримуємо дані про користувача з локального сховища
    const userDataString = localStorage.getItem('usersData');

    if (userDataString) {
        // Перетворимо рядок JSON на об'єкт
        const userData = JSON.parse(userDataString);

        // Відображаємо дані про користувача в інтерфейсі
        document.getElementById("username").textContent = `Логін: ${userData.username}`;
        document.getElementById("userRole").textContent = `Роль: ${decodeURIComponent(userData.role)}`;
    }

    // За замовчуванням відкриваємо першу вкладку
    document.getElementById("Tab1").style.display = "block";
    document.getElementById("Tab5").style.display = "none";

    // Відображаємо офери під час завантаження сторінки
    showOffers();

    // Відображаємо персонал під час завантаження сторінки
    showRooms();
    showVacancies() 
    showPersonnelForMatching()
    showAcceptedOffers();
});


// setInterval(() => {
//     showOffers();
//     showPersonnel();
//     showAcceptedOffers();
// }, 20000); 




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

    // Встановлюємо текст повідомлення
    notificationMessage.textContent = message;

    // Показуємо повідомлення
    notification.classList.remove('hide');

    // Через 5 секунд приховуємо повідомлення
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// Функція приховування повідомлення
function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hide');
}
//#endregion

//#region offer
function createOffer(event) {
    event.preventDefault();

    // Отримуємо значення полів із форми
    const deviceName = document.getElementById("deviceName").value;
    const deviceCategory = document.getElementById("deviceCategory").value;
    const price = document.getElementById("price").value;
    const description = document.getElementById("description").value;
    const photo = document.getElementById("photo").value;

    // Створюємо об'єкт із даними офферу
    const offerData = {
        deviceName: encodeURI(deviceName),
        deviceCategory: encodeURI(deviceCategory),
        price: encodeURI(price),
        description: encodeURI(description),
        photo: encodeURI(photo),
    };

    showNotification('Прилад успішно створено!');

    // Надсилаємо дані на сервер (замініть на свої дані та вкажіть правильний шлях до offers.json)
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

            // Додаємо новий оффер
            existingOffers.push(offerData);

            // Оновлюємо вміст файлу з урахуванням нових даних
            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingOffers)))).replace(/.{76}/g, "$&\n");
            const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

            fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Додавання нового офферу',
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
}

function showOffers() {
    // Отримуємо дані про оферу з файлу offers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при отриманні даних із сервера');
            }
            return response.json();
        })
        .then(data => {
            const offersString = atob(data.content);
            const decodedOffersString = decodeURIComponent(offersString);
            let offers;

            try {
                offers = JSON.parse(decodedOffersString);

                if (!Array.isArray(offers)) {
                    offers = [offers];
                }
            } catch (error) {
                offers = [];
            }

            // Очищаємо список оферов
            const offersList = document.getElementById('offers');
            offersList.innerHTML = '';

            // Отримуємо значення обраної категорії для фільтрації
            const categoryFilter = document.getElementById('categoryFilter').value;

            // Виводимо кожен офер, який відповідає обраній категорії або усім категоріям
            offers.forEach((offer, index) => {
                if (categoryFilter === 'all' || offer.deviceCategory === categoryFilter) {
                    const offerItem = document.createElement('div');
                    offerItem.classList.add('offer-item');

                    const content = `
                        <p>Назва приладу: ${offer.deviceName}</p>
                        <p>Категорія приладу: ${offer.deviceCategory}</p>
                        <p>Ціна: ${offer.price}</p>
                        <p>Опис: ${offer.description}</p>
                        <img src="${offer.photo}" class="zoomable-image" alt="Фото приладу"> 
                        <button class="delete-button" onclick="deleteOffer(${index})">Видалити</button>
                    `;

                    offerItem.innerHTML = content;
                    offersList.appendChild(offerItem);
                }
            });
        })
        .catch(error => {
            console.error('Помилка при отриманні даних про оферу:', error);
        });
}

// Функція для фільтрації приладів за категоріями
function filterOffers() {
    showOffers();
}

// Перший виклик для відображення приладів при завантаженні сторінки
showOffers();

function deleteOffer(index) {
    // Отримуємо дані про поточні офери з файлу offers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при отриманні даних із сервера');
            }
            return response.json();
        })
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

            // Видаляємо офер за індексом
            existingOffers.splice(index, 1);

            // Оновлюємо вміст файлу з урахуванням нових даних
            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingOffers)))).replace(/.{76}/g, "$&\n");
            const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

            // Надсилаємо оновлені дані на сервер
            fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Видалення офера',
                    content: updatedContent,
                    sha: existingData.sha,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Офер успішно видалено:', data);
                    // Обновлюємо відображення після видалення
                    showOffers();
                })
                .catch(error => {
                    console.error('Помилка при оновленні даних на GitHub:', error);
                });
        })
        .catch(error => {
            console.error('Помилка при отриманні попередньої версії файлу:', error);
        });
}

//#endregion

//#region personal
    // Змінна для відстеження кількості полів для кімнат
    let roomCounter = 1;

    // Функція для додавання нового поля для введення даних про кімнату
    function addRoomField() {
        const roomFields = document.getElementById('roomFields');

        const roomField = document.createElement('div');
        roomField.innerHTML = `
            <label for="roomName${roomCounter}">Назва кімнати ${roomCounter}:</label>
            <input type="text" id="roomName${roomCounter}" required>
            <label for="roomArea${roomCounter}">Площа кімнати ${roomCounter} (м²):</label>
            <input type="number" id="roomArea${roomCounter}" required min="0">
        `;

        roomFields.appendChild(roomField);
        roomCounter++;
    }

    // Функція для збору даних про кімнати та їх відправки на сервер
    function submitRooms(event) {
        event.preventDefault();
    
        const roomsData = [];
    
        for (let i = 1; i < roomCounter; i++) {
            const roomName = document.getElementById(`roomName${i}`).value;
            const roomArea = document.getElementById(`roomArea${i}`).value;
            const apartmentId = document.getElementById('apartmentId').value; // Додатково зчитуємо id квартири
            const apartmentImage = document.getElementById('apartmentImage').value; // Додатково зчитуємо посилання на картинку квартири
    
            roomsData.push({
                roomName: encodeURI(roomName),
                roomArea: encodeURI(roomArea),
                apartmentId: encodeURI(apartmentId), // Додаємо ідентифікатор квартири для кожної кімнати
                apartmentImage: encodeURI(apartmentImage), // Додаємо посилання на зображення квартири
            });
        }
    
        // Отримуємо дані про квартири з сервера
        fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
            .then(response => response.json())
            .then(existingData => {
                const existingApartmentsString = atob(existingData.content);
                let existingApartments;
    
                try {
                    existingApartments = JSON.parse(existingApartmentsString);
    
                    if (!Array.isArray(existingApartments)) {
                        existingApartments = [existingApartments];
                    }
                } catch (error) {
                    existingApartments = [];
                }
    
                // Шукаємо квартиру з відповідним id
                const apartmentIndex = existingApartments.findIndex(apartment => apartment.id === roomsData[0].apartmentId);
    
                if (apartmentIndex !== -1) { // Якщо знайдено квартиру з відповідним id
                    // Додаємо кімнати до відповідної квартири
                    if (!existingApartments[apartmentIndex].rooms) {
                        existingApartments[apartmentIndex].rooms = [];
                    }
                    roomsData.forEach(room => {
                        existingApartments[apartmentIndex].rooms.push(room);
                    });
                } else {
                    // Створюємо нову квартиру та додаємо кімнати до неї
                    const newApartment = {
                        id: roomsData[0].apartmentId,
                        image: roomsData[0].apartmentImage, // Додаємо посилання на зображення квартири
                        rooms: roomsData,
                    };
                    existingApartments.push(newApartment);
                }
    
                // Оновлюємо вміст файлу з урахуванням нових даних
                const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingApartments)))).replace(/.{76}/g, "$&\n");
                const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';
    
                fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Додавання нових кімнат',
                        content: updatedContent,
                        sha: existingData.sha,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Дані успішно відправлені на GitHub:', data);
                        // Оновлюємо відображення після додавання кімнат
                        // Можна додати додатковий функціонал для оновлення відображення, якщо потрібно
                    })
                    .catch(error => {
                        console.error('Помилка при оновленні даних на GitHub:', error);
                    });
            })
            .catch(error => {
                console.error('Помилка при отриманні попередньої версії файлу:', error);
            });
    
        showNotification('Кімнати успішно збережені!');
    }
    
    
    

    function showRooms() {
        // Отримуємо дані про квартири із файлу apartments.json
        fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Помилка при отриманні даних із сервера');
                }
                return response.json();
            })
            .then(data => {
                const apartmentsString = atob(data.content);
                const decodedApartmentsString = decodeURIComponent(apartmentsString);
    
                let apartments;
    
                try {
                    apartments = JSON.parse(decodedApartmentsString);
    
                    if (!Array.isArray(apartments)) {
                        apartments = [apartments];
                    }
                } catch (error) {
                    apartments = [];
                }
    
                // Очищаємо список квартир
                const apartmentsList = document.getElementById('roomsList');
                apartmentsList.innerHTML = '';
    
                // Виводимо кожну квартиру
                apartments.forEach((apartment, index) => {
                    const apartmentItem = document.createElement('div');
                    apartmentItem.classList.add('apartment-item');
    
                    const roomsContent = apartment.rooms.map(room => `
                        <p>Назва кімнати: ${room.roomName}</p>
                        <p>Площа кімнати: ${room.roomArea} м²</p>
                    `).join('');
    
                    const content = `
                        <div class="apartment-info">
                            <p>Квартира №${apartment.id}</p>
                            ${roomsContent}
                            <img class="zoomable-image" src="${apartment.image}" alt="Картинка квартири">
                        </div>
                        <button class="delete-button" onclick="deleteApartment(${index})">Видалити квартиру</button>
                    `;
    
                    apartmentItem.innerHTML = content;
                    apartmentsList.appendChild(apartmentItem);
                });
    
                // Викликаємо функцію для приближення зображень
                setupImageZoom();
            })
            .catch(error => {
                console.error('Помилка при отриманні даних про квартири:', error);
            });
    }
    
    function setupImageZoom() {
        const zoomableImages = document.querySelectorAll('.zoomable-image');
        zoomableImages.forEach(image => {
            image.addEventListener('click', () => {
                image.classList.toggle('zoomed');
            });
        });
    }
    
    // Викликаємо функцію для показу квартир при завантаженні сторінки
    showRooms();
    
    
    function deleteApartment(index) {
        // Отримуємо дані про квартири із файлу apartments.json
        fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Помилка при отриманні даних із сервера');
                }
                return response.json();
            })
            .then(data => {
                const apartmentsString = atob(data.content);
    
                let apartments;
    
                try {
                    apartments = JSON.parse(apartmentsString);
    
                    if (!Array.isArray(apartments)) {
                        apartments = [apartments];
                    }
                } catch (error) {
                    apartments = [];
                }
    
                // Видаляємо квартиру за індексом
                apartments.splice(index, 1);
    
                // Оновлюємо вміст файлу з урахуванням нових даних
                const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(apartments)))).replace(/.{76}/g, "$&\n");
                const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';
    
                fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Видалення квартири',
                        content: updatedContent,
                        sha: data.sha,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Квартиру успішно видалено:', data);
                        // Оновлюємо відображення після видалення
                        showRooms();
                    })
                    .catch(error => {
                        console.error('Помилка при оновленні даних на GitHub:', error);
                    });
            })
            .catch(error => {
                console.error('Помилка при отриманні даних про квартири:', error);
            });
    }
    
    
    

// function registerEmployee(event) {
//     event.preventDefault();

//     //Отримуємо значення полів із форми
//     const firstName = document.getElementById("firstName").value;
//     const lastName = document.getElementById("lastName").value;
//     const middleName = document.getElementById("middleName").value;
//     const birthYear = document.getElementById("birthYear").value;
//     const experience = document.getElementById("experience").value;
//     const employeeTechnologies = document.getElementById("employeeTechnologies").value;
//     const expectedSalary = document.getElementById("expectedSalary").value;

//     // Створюємо об'єкт із даними про співробітника
//     const employeeData = {
//         firstName: encodeURI(firstName),
//         lastName: encodeURI(lastName),
//         middleName: encodeURI(middleName),
//         birthYear: encodeURI(birthYear),
//         experience: encodeURI(experience),
//         technologies: encodeURI(employeeTechnologies),
//         expectedSalary: encodeURI(expectedSalary),
//     };
    

//     // Надсилаємо дані на сервер (замініть на свої дані та вкажіть правильний шлях до employees.json)
//     fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
//         .then(response => response.json())
//         .then(existingData => {
//             const existingEmployeesString = atob(existingData.content);
//             let existingEmployees;

//             try {
//                 existingEmployees = JSON.parse(existingEmployeesString);

//                 if (!Array.isArray(existingEmployees)) {
//                     existingEmployees = [existingEmployees];
//                 }
//             } catch (error) {
//                 existingEmployees = [];
//             }

//             // Додаємо нового співробітника
//             existingEmployees.push(employeeData);

//             // Оновлюємо вміст файлу з урахуванням нових даних
//             const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingEmployees)))).replace(/.{76}/g, "$&\n");
//             const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';
//             console.log('Отправляемые данные:', JSON.stringify(existingEmployees));

//             fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json', {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     message: 'Додавання нового співробітника',
//                     content: updatedContent,
//                     sha: existingData.sha,
//                 }),
//             })

//                 .then(response => response.json())
//                 .then(data => {
//                     console.log('Дані успішно відправлені на GitHub:', data);
//                     showPersonnel();
//                 })
//                 .catch(error => {
//                     console.error('Ошибка при оновленні даних на GitHub:', error);
//                 });
//         })
//         .catch(error => {
//             console.error('Ошибка при отриманні попередньої версії файлу:', error);
//         });

//     showNotification('Працівник успішно зареєстрований!');
// }

// function showPersonnel() {
//     // Отримуємо дані про персонал із файлу employees.json
//     fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Помилка при отриманні даних із сервера');
//             }
//             return response.json();
//         })
//         .then(data => {
//             const personnelString = atob(data.content);
//             const decodedPersonnelString = decodeURIComponent(personnelString);

//             let personnel;

//             try {
//                 personnel = JSON.parse(decodedPersonnelString);

//                 if (!Array.isArray(personnel)) {
//                     personnel = [personnel];
//                 }
//             } catch (error) {
//                 personnel = [];
//             }

//             // Очищаємо список персоналу
//             const personnelList = document.getElementById('personnelList');
//             personnelList.innerHTML = '';

//             // Виводимо кожного співробітника
//             personnel.forEach((person, index) => {
//                 const personItem = document.createElement('div');
//                 personItem.classList.add('personel-item');

//                 const content = `
//                     <p>Ім'я: ${person.firstName}</p>
//                     <p>Прізвище: ${person.lastName}</p>
//                     <p>Рік народження: ${person.birthYear}</p>
//                     <p>Стаж: ${person.experience}</p>
//                     <p>Очікувана зарплатня: ${person.expectedSalary}</p>
//                     <button class="delete-button" onclick="deletePerson(${index})">Удалить</button>
//                 `;

//                 personItem.innerHTML = content;
//                 personnelList.appendChild(personItem);
//             });
//         })
//         .catch(error => {
//             console.error('Помилка при отриманні даних про персонал:', error);
//         });
// }

// function deletePerson(index) {
//     // Отримуємо дані про персонал із файлу employees.json
//     fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Помилка при отриманні даних із сервера');
//             }
//             return response.json();
//         })
//         .then(data => {
//             const personnelString = atob(data.content);

//             let personnel;

//             try {
//                 personnel = JSON.parse(personnelString);

//                 if (!Array.isArray(personnel)) {
//                     personnel = [personnel];
//                 }
//             } catch (error) {
//                 personnel = [];
//             }

//             // Видаляємо співробітника за індексом                  
//             personnel.splice(index, 1);

//             // Оновлюємо вміст файлу з урахуванням нових даних
//             const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(personnel)))).replace(/.{76}/g, "$&\n");
//             const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

//             fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json', {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     message: 'Видалення співробітника',
//                     content: updatedContent,
//                     sha: data.sha,
//                 }),
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     console.log('Співробітник успішно видалено:', data);
//                     // Оновлюємо відображення після видалення
//                     showPersonnel();
//                 })
//                 .catch(error => {
//                     console.error('Помилка при оновленні даних на GitHub:', error);
//                 });
//         })
//         .catch(error => {
//             console.error('Помилка при отриманні даних про персонал:', error);
//         });
// }


//#endregion

//#region vacancies
function showVacancies() {
    // Отримуємо дані про вакансії з файлу offers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/offers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при отриманні даних із сервера');
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

            // Очищаємо список вакансій
            const vacanciesContainer = document.getElementById('vacanciesContainer');
            vacanciesContainer.innerHTML = '';

            // Виводимо кожну вакансію
            vacancies.forEach((vacancy, index) => {
                const vacancyItem = document.createElement('div');
                vacancyItem.classList.add('vacancy-item');
                vacancyItem.id = `vacancy_${index}`;
                vacancyItem.draggable = true;
                vacancyItem.innerHTML = `
                    <p>Компанія: ${vacancy.deviceName}</p>
                    <p>Оффер: ${vacancy.deviceCategory}</p>
                    <p>Зарплата: ${vacancy.price}</p>
                    <p>Мова: ${vacancy.description}</p>
                    <p>Технології: ${vacancy.photo}</p>
                `;
                vacanciesContainer.appendChild(vacancyItem);

                // Додаємо обробник події кліка на вакансію
                vacancyItem.addEventListener('click', () => {
                    // Забираємо виділення з усіх вакансій
                    document.querySelectorAll('.vacancy-item').forEach(item => item.classList.remove('selected'));
                    // Добавляємо/видаляємо клас "selected" поточної вакансії
                    vacancyItem.classList.toggle('selected');
                });
            });
        })
        .catch(error => {
            console.error('Помилка при отриманні даних про вакансії:', error);
        });
}

function showPersonnelForMatching() {
    // Отримуємо дані про персонал із файлу employees.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/employees.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Помилка при отриманні даних із сервера');
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

            // Очищаємо список персоналу
            const personnelContainer = document.getElementById('employeesContainer');
            personnelContainer.innerHTML = '';

            // Виводимо кожного співробітника
            personnel.forEach((person, index) => {
                const personItem = document.createElement('div');
                personItem.classList.add('person-item');
                personItem.id = `employee_${index}`;
                personItem.draggable = true;
                personItem.innerHTML = `
                    <p>Ім'я: ${person.firstName}</p>
                    <p>Прізвище: ${person.lastName}</p>
                    <p>По-батькові: ${person.middleName}</p>
                    <p>Рік народження: ${person.birthYear}</p>
                    <p>Стаж: ${person.experience}</p>
                    <p>Освоєні технології: ${person.technologies}</p>
                    <p>Очікувана зарплатня: ${person.expectedSalary}</p>
                `;
                personnelContainer.appendChild(personItem);

                // Додаємо обробник події кліка на співробітника
                personItem.addEventListener('click', () => {
                    // Перемикаємо клас "selected" для поточного співробітника
                    personItem.classList.toggle('selected');
                });
            });
        })
        .catch(error => {
            console.error('Помилка при отриманні даних про персонал:', error);
        });
}

function handleMatchingConfirmation() {
    // Отримуємо обрану вакансію та обраних співробітників
    const selectedVacancy = document.querySelector('.vacancy-item.selected');
    const selectedEmployees = document.querySelectorAll('.person-item.selected');

    // Перевіряємо, що вакансія та співробітники обрані
    if (selectedVacancy && selectedEmployees.length > 0) {
        // Створюємо об'єкт для зберігання даних про підтверджені відповідності
        const confirmedMatches = {
            vacancy: {
                deviceName: selectedVacancy.querySelector('p:nth-child(1)').textContent,
                deviceCategory: selectedVacancy.querySelector('p:nth-child(2)').textContent,
                price: selectedVacancy.querySelector('p:nth-child(3)').textContent,
                description: selectedVacancy.querySelector('p:nth-child(4)').textContent,
                photo: selectedVacancy.querySelector('p:nth-child(5)').textContent,
            },
            employees: [],
        };

        // Додаємо дані про кожного обраного співробітника
        selectedEmployees.forEach(employee => {
            confirmedMatches.employees.push({
                firstName: employee.querySelector('p:nth-child(1)').textContent,
                lastName: employee.querySelector('p:nth-child(2)').textContent,
                middleName: employee.querySelector('p:nth-child(3)').textContent,
                birthYear: employee.querySelector('p:nth-child(4)').textContent,
                experience: employee.querySelector('p:nth-child(5)').textContent,
                technologies: employee.querySelector('p:nth-child(6)').textContent,
                expectedSalary: employee.querySelector('p:nth-child(7)').textContent,
            });
        });

        // Зберігаємо підтверджені відповідності
        saveDataToAcceptedOffers(confirmedMatches);

        // Після завершення операцій очищаємо обраних співробітників та вакансію
        selectedEmployees.forEach(employee => {
            employee.classList.remove('selected');
        });

        selectedVacancy.classList.remove('selected');

        // Показуємо повідомлення про підтверджені відповідності
        showNotification('Підтверджено відповідність вакансії та співробітників');

        // Оновлюємо відображення вакансій та персоналу
        showVacancies();
        showPersonnelForMatching();
    } else {
        // Показуємо повідомлення, якщо вакансія або співробітники не вибрані
        showNotification('Виберіть вакансію та хоча б одного співробітника для підтвердження');
    }
}



// Функція збереження даних у файл acceptedoffers.json
function saveDataToAcceptedOffers(data) {
    fetch('https://api.github.com/repos/butovamia/diplom/contents/acceptedoffers.json')
        .then(response => response.json())
        .then(existingData => {
            const existingMatchesString = new TextDecoder('utf-8').decode(Uint8Array.from(atob(existingData.content), c => c.charCodeAt(0)));
            let existingMatches;

            try {
                existingMatches = JSON.parse(existingMatchesString);

                if (!Array.isArray(existingMatches)) {
                    existingMatches = [existingMatches];
                }
            } catch (error) {
                existingMatches = [];
            }

            // Додаємо нові підтверджені відповідності
            existingMatches.push(data);

            // Оновлюємо вміст файлу з урахуванням нових даних
            const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(existingMatches)))).replace(/.{76}/g, "$&\n");
            const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

            fetch('https://api.github.com/repos/butovamia/diplom/contents/acceptedoffers.json', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Додавання нових підтверджених відповідностей',
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
}

// Код для додавання слухача події до кнопки
document.addEventListener('DOMContentLoaded', function () {
    const confirmButton = document.getElementById('confirmButton5');
    if (confirmButton) {
        confirmButton.addEventListener('click', handleMatchingConfirmation);
    }
});

// Додавання/видалення класу "selected" при натисканні на вакансію
document.addEventListener('click', function(event) {
    const vacancyItem = event.target.closest('.vacancy-item');
    if (vacancyItem) {
        // Забираємо виділення з усіх вакансій
        document.querySelectorAll('.vacancy-item').forEach(item => item.classList.remove('selected'));
        // Додаємо/видаляємо клас "selected" поточної вакансії
        vacancyItem.classList.toggle('selected');
    }
});

// Додавання/видалення класу "selected" при натисканні на співробітника
document.addEventListener('click', function(event) {
    const personnelItems = document.querySelectorAll('.person-item');

    // Перебираємо кожен елемент персоналу
    personnelItems.forEach(personItem => {
        // Додаємо обробник події кліка
        personItem.addEventListener('click', () => {
            // Перемикаємо клас "selected" для поточного елемента
            personItem.classList.toggle('selected');
        });
    });
});


//#endregion

//#region endoffers

function showAcceptedOffers() {
    // Отримуємо дані про підтверджені відповідності з файлу acceptedoffers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/acceptedoffers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const acceptedOffersString = data.content;
            const decodedAcceptedOffersString = new TextDecoder('utf-8').decode(Uint8Array.from(atob(acceptedOffersString), c => c.charCodeAt(0)));
            let acceptedOffers;

            try {
                acceptedOffers = JSON.parse(decodedAcceptedOffersString);

                if (!Array.isArray(acceptedOffers)) {
                    acceptedOffers = [acceptedOffers];
                }
            } catch (error) {
                acceptedOffers = [];
            }

            // Очищаємо список підтверджених відповідностей
            const acceptedOffersContainer = document.getElementById('acceptedOffersContainer');
            acceptedOffersContainer.innerHTML = '';

            // Виводимо кожну підтверджену відповідність
            acceptedOffers.forEach((match, index) => {
                const matchItem = document.createElement('div');
                matchItem.classList.add('match-item');
                matchItem.id = `match_${index}`;
            
                // Створюємо див для вакансії
                const vacancyInfo = document.createElement('div');
                vacancyInfo.classList.add('vacancy-info');
                vacancyInfo.innerHTML = `
                    <p>Вакансія:</p>
                    <p>${match.vacancy.deviceName}</p>
                    <p>${match.vacancy.deviceCategory}</p>
                    <p>${match.vacancy.price}</p>
                    <p>${match.vacancy.description}</p>
                    <p>${match.vacancy.photo}</p>
                `;
            
                // Додаємо див вакансії в основний елемент
                matchItem.appendChild(vacancyInfo);
            
                // Створюємо див для співробітників
                const employeesInfo = document.createElement('div');
                employeesInfo.classList.add('employees-info');
                employeesInfo.innerHTML = '<p>Співробітники:</p>';
            
                // Виводимо кожного співробітника для цієї підтвердженої відповідності
                match.employees.forEach(employee => {
                    const employeeInfo = document.createElement('div');
                    employeeInfo.classList.add('employee-info');
                    employeeInfo.innerHTML = `
                        <p>${employee.firstName}</p>
                        <p>${employee.lastName}</p>
                        <p>${employee.birthYear}</p>
                        <p>${employee.experience}</p>
                        <p>${employee.expectedSalary}</p>
                    `;
                    employeesInfo.appendChild(employeeInfo);
                });
            
                // Додаємо див співробітників в основний елемент
                matchItem.appendChild(employeesInfo);
            
                // Додаємо кнопку "Видалити"
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Видалити';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', () => {
                    // Викликаємо функцію видалення за індексом або іншим ідентифікатором
                    deleteMatch(index); // Замініть на ваш метод видалення
                });
                matchItem.appendChild(deleteButton);
            
                // Додаємо основний елемент у контейнер
                acceptedOffersContainer.appendChild(matchItem);
            });
        })
        .catch(error => {
            console.error('Помилка при отриманні даних про підтверджені відповідності:', error);
        });
}

function deleteMatch(index) {
// Отримуємо дані про підтверджені відповідності з файлу acceptedoffers.json
    fetch('https://api.github.com/repos/butovamia/diplom/contents/acceptedoffers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных с сервера');
            }
            return response.json();
        })
        .then(data => {
            const acceptedOffersString = data.content;
            const decodedAcceptedOffersString = new TextDecoder('utf-8').decode(Uint8Array.from(atob(acceptedOffersString), c => c.charCodeAt(0)));
            let acceptedOffers;

            try {
                acceptedOffers = JSON.parse(decodedAcceptedOffersString);

                if (!Array.isArray(acceptedOffers)) {
                    acceptedOffers = [acceptedOffers];
                }
            } catch (error) {
                acceptedOffers = [];
            }

            // Видаляємо підтверджену відповідність за індексом
            if (index >= 0 && index < acceptedOffers.length) {
                acceptedOffers.splice(index, 1);

                // Обновляем файл acceptedoffers.json с учетом удаления
                const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(acceptedOffers)))).replace(/.{76}/g, "$&\n");
                const githubToken = 'ghp_9XtTEFkHDDfhiY3Iik1O63';

                fetch('https://api.github.com/repos/butovamia/diplom/contents/acceptedoffers.json', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${githubToken + 'IGHVFxc41z25Xe'}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Видалення підтвердженої відповідності',
                        content: updatedContent,
                        sha: data.sha,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Підтверджену відповідність успішно видалено:', data);

                        // Обновляем отображение
                        showAcceptedOffers();
                    })
                    .catch(error => {
                        console.error('Помилка при оновленні даних на GitHub:', error);
                    });
            }
        })
        .catch(error => {
            console.error('Помилка при отриманні даних про підтверджені відповідності:', error);
        });
}

//#endregion