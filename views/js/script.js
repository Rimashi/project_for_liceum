$(document).ready(() => {

    const $burgerIcon = $('.burger__icon');
    const $burgerMenu = $('.burger__menu');

    $burgerIcon.click(() => {
        $burgerIcon.toggleClass('active');
        $burgerMenu.toggleClass('active');
    });

    $(document).click(e => {
        if (!$(e.target).closest('.burger').length &&
            $burgerMenu.hasClass('active')) {

            $burgerIcon.toggleClass('active');
            $burgerMenu.toggleClass('active');
        }
    });


    let cookieBlock = `<div class='cookie_notification'>
    <p class='cookie_notification__text'>Мы используем Cookie на этом сайте</p>
    <button class='cookie_notification__accept'>Ладно</button></div>  `
    let wrapper = $('.wrapper')
    let cookieDate = localStorage.getItem('cookieDate');

    if (!cookieDate || (+cookieDate + 31536000000) < Date.now()) {

        $(cookieBlock).appendTo(wrapper);
    }

    let cookieNotification = $('.cookie_notification');
    $('.cookie_notification__accept').click(function () {
        localStorage.setItem('cookieDate', Date.now());
        cookieNotification.remove();
    })

    //загрузка файлов
    $('.hometask-for-day__download').click(function () {
        let links = decodeURIComponent($(this).val()).split(":");
        for (let i in links) {
            let url = "/download/" + encodeURIComponent(links[i]);
            forceDownload(url, links[i]);
        }
    });

});
//---------------ЗАГРУЗКАДАННЫХ----------------


$("button").click(function () {
    const $button = $(this);

    if (!$button.hasClass('active-button') && $button.hasClass('nonactive-button')) {
        toggleActiveButton();
        if ($button.hasClass('button-timetable__right')) {
            showAnusual();
        } else {
            hideAnusual();
        }

    }

    function toggleActiveButton() {
        $('.active-button').toggleClass('active-button nonactive-button');
        $button.toggleClass('active-button nonactive-button');
    }

    function showAnusual() {
        $('.anusual').css('display', 'block');
        setTimeout(() => {
            $('.anusual').toggleClass('active');
        }, 1);
    }

    function hideAnusual() {
        $('.anusual').toggleClass('active');
        setTimeout(() => {
            $('.anusual').css('display', 'none');
        }, 200);
    }

});


const modals = {
    "login": `
        <dialog class="modal-login _dialog" >
            <div class="modal-login__content-close content-close _black-close">
            </div>
            <div class="modal-login__login-img ">
                <img src="img/header/Logo.svg" alt="" class="_img-login">
            </div>
            <form method="post" class="modal-login__login-content login-content" name="loginForm">
                <input type="text" name="login" id="login" class="login-content__login-input" placeholder="Логин">
                <input type="password" name="pass" id="pass" class="login-content__login-input" placeholder="Пароль">
                <input type="submit" id="login_button" class="login-content__login-button login-button" value="Войти">
            </form>
        </dialog>
        `,

    'add-homework': `
        <dialog class="modal-add-homework _dialog">
            <div class="modal-add-homework__content-close content-close"></div>
            <h3 class="modal-add-homework__title-add-homework _title-modal">
              Добавление ДЗ
            </h3>
            <form method="post" class="modal-add-homework__content-add-homework content-add-homework">
              <div class="content-add-homework__left-add-homework left-add-homework">
                <div class="left-add-homework__select-subject-homework select-subject-homework">
                  <h4 class="select-subject-homework__title">Предмет:</h4>
                  <select name="subject" id="subject" class="select-subject-homework__select">
                    <option value="none">Предмет</option>
                  </select>
                </div>
                <div class="left-add-homework__select-day-homework select-day-homework">
                  <h4 class="select-day-homework__title">Дата сдачи:</h4>
                  <select name="date_homework" id="date_homework" class="select-day-homework__select">
                    <option value="none">Дата</option>
                  </select>
                </div>
                <label class="left-add-homework__add-homework-file add-homework-file">
                    <span class="add-homework-file__button">Добавить файл</span>
                    <input type="file" class="add-homework-file__input" id="upload" multiple>
                    <span class="add-homework-file__text">До 3-х файлов</span>
                </label>
                <button type="button" class="left-add-homework__button-upload-homework" id="add_hometask_button">
                  Добавить ДЗ
                </button>
              </div>
              <div class="content-add-homework__right-add-homework right-add-homework">
                <h4 class="right-add-homework__title">ДЗ:</h4>
                <textarea class="right-add-homework__textarea" id="homework_text" name="homework_text"></textarea>
              </div>
            </form>
        </dialog>
        `,

    'check-hometask': `
        <dialog class="modal-check-hometask _dialog">
            <div class="modal-check-hometask__content-close content-close"></div>
            <h3 class="modal-check-hometask__title-check-hometask _title-modal">
              Проверка ДЗ
            </h3>
            <form method="get" class="modal-check-hometask__content-table-list content-table-list">
                <div class="content-table-list__table-element-check table-element-check">        
                </div>
            </form>
        </dialog>
        `,

    'add-notice':
        `<dialog class="modal-add-notice  _dialog">
            <div class="modal-add-notice__content-close content-close"></div>
            <h3 class="modal-add-notice__title-add-notice _title-modal">
                Создать уведомление
            </h3>
            <form method="post" class="modal-add-notice__content-add-notice content-add-notice">
                <h4 class="content-add-notice__title">Уведомление:</h4>
                <textarea name="notification" id="notification" class="content-add-notice__textarea"></textarea>
                <input type="button" id="notification_add" class="content-add-notice__button" value="Создать уведомлeние">
            </form>
        </dialog> `,

    'add-event': `
       <dialog class="modal-add-event  _dialog">
          <div class="modal-add-event__content-close content-close"></div>
          <h3 class="modal-add-event__title-add-event _title-modal">
              Создать событие
          </h3>
          <form method="post" class="modal-add-event__content-add-event content-add-event">
              <div class="content-add-event__location-event location-event">
                  <h4 class="location-event__title">Место проведения:</h4>
                  <textarea name="location" id="location" class="location-event__textarea"></textarea>
              </div>
              <div class="content-add-event__date-event date-event">
                  <h4 class="date-event__title">Дата проведения:</h4>
                  <input name="date" id="event_date" type="date" class="date-event__textarea">    
              </div>
              <div class="content-add-event__text-event text-event">
                  <h4 class="text-event__title">Событие:</h4>
                  <textarea name="text" id="event_text" class="text-event__textarea"></textarea>
              </div>
              <input type="button" id="add_event" class="content-add-event__submit" value="Создать событие">
          </form>
       </dialog> 
          `,
};

function openModal(name) {
    $(modals[name]).prependTo(".wrapper");

    const dialog = document.querySelector('.modal-' + name);
    //const dialog = document.querySelector('.modal-admin-event');
    dialog.showModal();

    $('body').addClass('modal');

    // Закрытие по крестику
    $('.content-close').click(function () {
        dialog.close();
        $('body').toggleClass('modal')
        dialog.remove()
        location.reload();

    });
    // Закрытие по клавише Esc.
    $(document).keydown(function (e) {
        if (e.keyCode === 27 && $('body').hasClass('modal')) {
            e.stopPropagation();
            dialog.close();
            $('body').toggleClass('modal')
            dialog.remove()
            location.reload();
        }
    });


    // Закрытие по клику на фоне
    dialog.addEventListener('click', event => {
        if (event.target === event.currentTarget) {
            event.currentTarget.close()
            $('body').toggleClass('modal')
            dialog.remove()
            location.reload();
        }
    })
}

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


$('.login-button').click(() => {
    openModal('login');
    $('#login_button').on('click', function (event) {
        event.preventDefault();
        let login = $('#login').val();
        let pass = $('#pass').val();
        $("#login").removeClass("not-correct");
        $("#pass").removeClass("not-correct");
        $.ajax({
            type: "POST",
            url: "/login",
            data: {login: login, pass: pass},
            success: function (res) {
                if (res.error) {
                    switch (res.error) {
                        case "userNone":
                            $("#login").addClass("not-correct");
                            break;
                        case "passwordNone":
                            $("#pass").addClass("not-correct");
                            break;
                    }
                }
                if (res.success) {
                    return window.location.href = `/${res.success}`;
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', status, error);
            }
        })
    })
});

$('.unlogin-button').click(() => {
    $.get('/logout', function () {
        window.location.href = "/";
    })
});


$('.button-add-hometask').click(() => {
    let pathName = window.location.pathname;

    openModal('add-homework');

    if (pathName.includes("leader")) {
        $('.left-add-homework__add-homework-file').css('display', 'flex');
    } else {
        $('.left-add-homework__add-homework-file').css('display', 'none');
    }

    let subject_select = $('#subject');

    $.ajax({
        type: "GET",
        url: "/homework/subject",
        success: function (json) {
            let a = json.subjects;
            for (let i in a) {
                subject_select.append('<option value=' + a[i] + '>' + ucfirst(a[i]).replaceAll("_", " ") + '</option>');
            }
        }
    });
    subject_select.on('change', function (sub) {
        let subject = sub.target.value;
        let date = $('#date_homework');
        date.empty();
        $.ajax({
            type: "GET",
            url: "/homework/date",
            data: {subject: subject},
            success: function (data) {
                let dateJSON = data['dates'];
                for (let i in dateJSON) {
                    date.append('<option value=' + dateJSON[i] + '>' + dateJSON[i].split(".")[0] + "." + dateJSON[i].split(".")[1] + '</option>');
                }
            }
        })
    })

    $('.add-homework-file__input').on('change', function () {
        let file = this.files;

        let buf = "";

        for (const key in file) {
            if (key !== "length" && key !== "item") {
                buf += file[key].name + ', '
            }
        }
        $(this).closest('.add-homework-file').find('.add-homework-file__text').html(buf.slice(0, -2));
    });

    $('#add_hometask_button').click(() => {
        let date = $('#date_homework').val();
        let text = $('#homework_text').val().trim();
        let subject = subject_select.val();
        let file = $('#upload')[0].files;
        // let file = $('#upload').prop('files');
        let formData = new FormData();
        if (file.length > 0) {
            // formData.append('files', file[0]);
            $.each(file, function (key, value) {
                formData.append("files", value);
            });
        }

        $('#homework_text').removeClass('not-correct');
        if (text === "" || text === undefined) {
            $('#homework_text').addClass('not-correct');
        } else {
            if (date === "" || date === undefined) {
                alert('выберите дату и предмет');
            } else {
                if (subject === "" || subject === undefined) {
                    alert('выберите предмет');
                } else {

                    formData.append("date", date);
                    formData.append("subject", subject);
                    formData.append("text", text);

                    $.ajax({
                        url: '/homework/send',
                        type: 'POST',
                        processData: false,
                        contentType: false,
                        data: formData,
                        success: function (res) {
                            if (res.success) {
                                window.location.href = "/";
                            }
                            switch (res.error) {
                                case "no homework":
                                    alert('Вы не написали домашнее задание');
                                    break;
                                case "no subject":
                                    alert('Вы не выбрали предмет');
                                    break;
                                case "no date":
                                    alert("Вы не выбрали дату");
                                    break;
                                case "person has written":
                                    alert('Вы уже добавили задание на данный предмет и дату');
                                    break;
                                case "script":
                                    alert('Ай-ай-яй, скрипты писать нельзя, все равно ничего не получишь)');
                                    break;
                                case "large":
                                    alert('слишком многа букав');
                                    break;
                            }
                        }
                    });
                }
            }
        }
    })
});
//----------------------------------------------------------------------------------------------------------------------
$('.button-check-hometask').click(() => {
    openModal('check-hometask');
    let a = $(".content-table-list").empty();
    let buf = "";
    $.ajax({
        type: "GET",
        url: "/checkmodal",
        success: function (json) {
            let g = json['hometasks'];
            for (let i in g) {
                if (g[i].length > 0) {
                    let fileSt = '';
                    for (let file in g[i][4]) {
                        if ((Number(file) + 1) === g[i][4].length) {
                            fileSt += g[i][4][file];
                        } else {
                            fileSt += g[i][4][file] + ":";
                        }
                    }
                    buf += '<div class="content-table-list__table-element-check table-element-check" id="element_check_' + i + '">' +
                        '<div class="element-check__info-check-element info-check-element">' +
                        '   <div class="info-check-element__login" id="surname' + i + '">' + g[i][0] + '</div>\n' +
                        '        <div class="info-check-element__date" id="date' + i + '">' + g[i][1] + '</div>\n' +
                        '        <div class="info-check-element__subject" id="subject' + i + '" data-value="' + g[i][2] + '">' + ucfirst(g[i][2]).replaceAll("_", " ") + '</div>\n' +
                        '    </div>\n' +
                        '    <div class="element-check__content">' + g[i][3] + '</div>\n';
                    if (fileSt.length > 0) {
                        buf +=
                            '<button id="download" value="' + fileSt + '" class="hometask-for-day__download"></button>'

                    }
                    buf +=
                        '    <div class="element-check__function-table-element function-table-element">' +
                        '        <button type="button" name="add" id="add_' + i + '" class="function-table-element__function-button add_leader">Добавить</button>\n' +
                        '        <button type="button" name="delete" id="del_' + i + '" class="function-table-element__function-button delete_leader">Удалить</button>\n' +
                        '        <button type="button" name="ban" id="ban_' + i + '" class="function-table-element__function-button ban_leader">Бан</button>\n' +
                        '    </div>\n' +
                        '</div>'
                    a.append(buf);
                }
                buf = "";
            }
            $('.add_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                let kok = $('#surname' + id).text().toLowerCase();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).data('value');
                $.ajax({
                    type: "POST",
                    url: 'checkmodal/add',
                    data: {kok, kok1, kok2},
                    success: function (res) {
                        $('#element_check_' + id).remove();
                    }
                });
            });

            $('.delete_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                let kok = $('#surname' + id).text().toLowerCase();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).data('value');
                $.ajax({
                    type: "POST",
                    url: 'checkmodal/del',
                    data: {kok, kok1, kok2},
                    success: function (res) {
                        $('#element_check_' + id).remove();
                    }
                });
            });

            $('.ban_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                let kok = $('#surname' + id).text().toLowerCase();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).data('value');
                $.ajax({
                    type: "POST",
                    url: 'checkmodal/ban',
                    data: {kok, kok1, kok2},
                    success: function (res) {
                        $('#element_check_' + id).remove();
                    }
                });
            });

            $('#download').on('click', function (e) {
                e.stopPropagation();
                let links = decodeURIComponent($(this).val()).split(":");
                for (let i in links) {
                    let url = "/download/" + encodeURIComponent(links[i]);
                    forceDownload(url, links[i]);
                }
            });
        }
    });
});
//----------------------------------------------------------------------------------------------------------------------
$('.button-add-notice').click(() => {
    openModal('add-notice');
    let notice_button = $('#notification_add');
    notice_button.click(() => {
        let notify = $('#notification').val();
        $('#notification').removeClass("not-correct");
        if (notify === "" || notify === undefined) {
            $('#notification').addClass("not-correct");
            return;
        }
        $.ajax({
            url: '/notification',
            type: 'POST',
            data: {notify: notify},
            success: function (res) {
                if (res['error']) {
                    if (res['error'] === 'large') {
                        alert('слишком большое уведомление');
                    }
                    if (res['error'] === 'script') {
                        alert('скрипты писать нельзя за такое забирается админка');
                    }
                    return;
                }
                window.location.href = "/";
            }
        })
    })
});
$('.button-add-event').click(() => {
    openModal('add-event');
    let event_button = $('#add_event');
    event_button.click(() => {
        let event = $('#event_text').val();
        let location = $('#location').val();
        let date = $('#event_date').val();
        $('#event_text').removeClass('not-correct');
        $('#location').removeClass('not-correct');
        $('#event_date').removeClass('not-correct');
        if (event === "" || event === undefined) {
            $('#event_text').addClass('not-correct');
            return;
        } else {
            if (date === "" || date === undefined) {
                $('#event_date').addClass('not-correct');
                return;
            } else {
                if (location === "" || location === undefined) {
                    $('#location').addClass('not-correct');
                    return;
                }
            }
        }
        $.ajax({
            url: '/event',
            type: 'POST',
            data: {text: event, place: location, date: date},
            success: function (res) {
                if (res['error']) {
                    if (res['error'] === 'large') {
                        alert('слишком большое событие или наименование места');
                    }
                    if (res['error'] === 'script') {
                        alert('скрипты писать нельзя за такое забирается админка');
                    }
                    return;
                }
                window.location.href = "/";
            }
        })
    })
});

$('.add-logpas-inputs__add-logpas-button').click(() => {
    let login = $('#login').val().toLowerCase();
    let password = $('#pass').val();
    $('#login').removeClass('not-correct');
    $('#pass').removeClass('not-correct');
    if (login === "" || login === undefined) {
        $('#login').addClass('not-correct');
        return;
    } else {
        if (pass === "" || pass === undefined || pass.length <= 3) {
            $('#pass').addClass('not-correct');
            return;
        }
    }
    $.ajax({
        url: "/login/change",
        type: "POST",
        data: {login: login, pass: password},
        success: function (res) {
            window.location.href = "/";
        }
    });
})

function changeText(n) {
    $(".information-choices__button-choice").removeClass("choice-active");
    $("#choice-" + n).addClass("choice-active");
    $(".information-blocks").css("display", "none");
    $("#information-blocks-" + n).css("display", "flex");
}

//загрузка файлов
function forceDownload(url, fileName) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
        let urlCreator = window.URL || window.webkitURL;
        let imageUrl = urlCreator.createObjectURL(this.response);
        let tag = document.createElement('a');
        tag.href = imageUrl;
        tag.download = fileName;
        document.body.appendChild(tag);
        tag.click();
        document.body.removeChild(tag);
    }
    xhr.send();
}






