// scriptmain.js
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
    
        // Отображаем оферы при загрузке страницы
        showOffers();
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
    document.getElementById(tabName).style.display = "block";
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
        companyName: companyName,
        offerName: offerName,
        salary: salary,
        language: language,
        technologies: technologies,
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
            const updatedContent = btoa(JSON.stringify(existingOffers));
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
            let offers;

            try {
                offers = JSON.parse(offersString);

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