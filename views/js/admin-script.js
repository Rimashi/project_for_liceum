//================================================MODALS================================================================

//DICTIONARY WITH MODALS------------------------------------------------------------------------------------------------
const modals = {
    "add-user": `
    <dialog class="modal-add-user  _dialog">
        <div class="modal-add-user__content-close content-close"></div>
        <h3 class="modal-add-user__title-add-user-event _title-modal">
            Добавление пользователя
        </h3>
        <form class="modal-add-user__content-add-user content-add-user">
            <div class="content-add-user__user-function-name user-function-name">
                <h4 class="user-function-name__label">Имя:</h4>
                <input type="text" class="user-function-name__textinput" id="addName" required>
            </div>
            <div class="content-add-user__user-function-surname user-function-surname">
                <h4 class="user-function-surname__label">Фамилия:</h4>
                <input type="text" class="user-function-surname__textinput" id="addSurname" required>
            </div>
            <div class="content-add-user__user-function-class user-function-class">
                <h4 class="user-function-class__label">Класс:</h4>
                <select class="user-function-class__select">
                    <option value="">-</option>
                </select>
            </div>
            <div class="content-add-user__user-function-password user-function-password">
                <h4 class="user-function-password__label">Пароль:</h4>
                <div class="user-function-password__password-input password-input">
                    <input type="text" class="password-input__textinput" id="addPassword" required>
                    <button type="button" class="password-input__reload"></button>
                </div>
            </div>
            <div class="content-add-user__user-function-rank user-function-rank">
                <h4 class="user-function-rank__label">Должность:</h4>
                <select class="user-function-rank__select">
                    <option value="student">Ученик</option>
                    <option value="leader">Модератор</option>
                </select>
            </div>
            <input type="button" class="content-add-user__submit" id="addButton" value="Добавить">
        </form>
    </dialog>
`,
    'add-notice': `
    <dialog class="modal-add-notice  _dialog">
        <div class="modal-add-notice__content-close content-close"></div>
        <h3 class="modal-add-notice__title-add-notice _title-modal">
            Создать уведомление
        </h3>
        <form class="modal-add-notice__content-add-notice content-add-notice">
            <h4 class="content-add-notice__title">Уведомление:</h4>
            <textarea class="content-add-notice__textarea" id="notification"></textarea>
            <input type="button" class="content-add-notice__button" value="Создать уведомлeние" id="create_notice">
        </form>
    </dialog>
`,
    'add-event': `
    <dialog class="modal-add-event  _dialog">
        <div class="modal-add-event__content-close content-close"></div>
        <h3 class="modal-add-event__title-add-event _title-modal">
            Создать событие
        </h3>
        <form class="modal-add-event__content-add-event content-add-event">
            <div class="content-add-event__location-event location-event">
                <h4 class="location-event__title">Место проведения:</h4>
                <textarea class="location-event__textarea" id="location"></textarea>
            </div>
            <div class="content-add-event__date-event date-event">
                <h4 class="date-event__title">Дата проведения:</h4>
                <input name="date" type="date" class="date-event__textarea" id="event_date">
            </div>
            <div class="content-add-event__text-event text-event">
                <h4 class="text-event__title">Событие:</h4>
                <textarea class="text-event__textarea" id="event_text"></textarea>
            </div>
            <input type="button" class="content-add-event__submit" id="addEvent" value="Создать событие">
        </form>
    </dialog> 
`,
    'add-subject': `
    <dialog class="modal-add-subject  _dialog">
        <div class="modal-add-subject__content-close content-close"></div>
            <h3 class="modal-add-subject__title-add-subject _title-modal">
                Добавить предмет
            </h3>
            <form method="post" class="modal-add-subject__content-add-subject content-add-subject">
                <h4 class="content-add-subject__title">Предмет:</h4>
                <input type="text" class="content-add-subject__textinput" id="newSubject">
                <input type="button" class="content-add-subject__button" value="Добавить предмет" id="addSubjectButton">
            </form>
            <form class="modal-add-subject__content-change-subject content-change-subject" name="subjectsList" id="subjectsList">

            </form>
    </dialog>
`,
    'add-class': `
    <dialog class="modal-add-class  _dialog">
        <div class="modal-add-class__content-close content-close"></div>
            <h3 class="modal-add-class__title-add-class _title-modal">
                Добавить класс
            </h3>
            <form method="post" class="modal-add-class__content-add-class content-add-class">
                <h4 class="content-add-class__title">Класс:</h4>
                <input type="text" class="content-add-class__textinput" id="newClass">
                <input type="button" class="content-add-class__button" value="Добавить класс" id="addClasssButton">
            </form>
            <form class="modal-add-class__content-change-class content-change-class" id="classList">
                    
            </form>
    </dialog>
 `
};

//==============================================FUNCTIONS===============================================================

//LOGOUT----------------------------------------------------------------------------------------------------------------
$('.unlogin-button').click(() => {
    $.get('/logout', function () {
        window.location.href = "/";
    })
});


//-----------------------------------------------MODALS-----------------------------------------------------------------

//OPEN------------------------------------------------------------------------------------------------------------------
function openModal(name) {
    $(modals[name]).prependTo(".wrapper");

    const dialog = document.querySelector('.modal-' + name);
    dialog.showModal();

    $('body').addClass('modal');

    // Закрытие по крестику
    $('.content-close').click(function () {
        dialog.close();
        $('body').toggleClass('modal')
        dialog.remove()

    });
    // Закрытие по клавише Esc.
    $(document).keydown(function (e) {
        if (e.keyCode === 27 && $('body').hasClass('modal')) {
            e.stopPropagation();
            dialog.close();
            $('body').toggleClass('modal')
            dialog.remove()

        }
    });
    // Закрытие по клику на фоне
    dialog.addEventListener('click', event => {
        if (event.target === event.currentTarget) {
            event.currentTarget.close()
            $('body').toggleClass('modal')
            dialog.remove()

        }
    })
}

//TO MAKE FIRST LETTER UP-----------------------------------------------------------------------------------------------
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


//==============================================SITE BLOCKS=============================================================

//DICTIONARY WITH SITE BLOCKS-------------------------------------------------------------------------------------------
const site_block = {
    "list-user": `
    <div class="right-block-admin__user-list user-list">
        <h3 class="user-list__title">
            Список пользователей
        </h3>
        <div class="user-list__function-user-list function-user-list">
            <div class="function-user-list__find-users find-users">
                <input type="text" class="find-users__text-input" placeholder="Поиск по фамилии">
                    <button class="find-users__button-find">Поиск</button>
            </div>
            <div class="function-user-list__class-users class-users">
                <p class="class-users__text">Класс:</p>
                    <select class="class-users__select">
                        <option value="all">Все</option>
                    </select>
                    <button class="class-users__button-add-user-admin button-add-user-admin">Добавить пользователя</button>
            </div>
        </div>
        <div class="user-list__content-table-list content-table-list" id="user_list">    
        </div>
    </div> 
`,
    "event": `
    <div class="right-block-admin__event-list event-list">
        <h3 class="event-list__title">
            Лицейские события
        </h3>
        <div class="event-list__function-event-list function-event-list">
            <button class="function-event-list__button-add-event-admin button-add-event-admin">Добавить событие</button>
        </div>
        <div class="event-list__content-table-list content-table-list" id="eventsList">
            
        </div>
    </div> 
`,
    "notice": `
    <div class="right-block-admin__notice-list notice-list">
        <h3 class="notice-list__title">
            Уведомления
        </h3>
        <div class="notice-list__function-notice-list function-notice-list">
            <div class="function-notice-list__class-users class-users">
                <p class="class-users__text">Класс:</p>
                <select class="class-users__select" id="notice_class">
                    <option value="all">Все</option>
                </select>
            </div>
            <button class="function-notice-list__button-add-notice-admin button-add-notice-admin">Добавить уведомлние</button>
        </div>
        <div class="notice-list__content-table-list content-table-list" id="noticeList">

        </div>
    </div>  
`,
    "timetable": `
    <div class="right-block-admin__timetable-content timetable-content">
        <h3 class="timetable-content__title">
            Расписание
        </h3>
        <div class="timetable-content__function-timetable-content function-timetable-content">
            <div class="function-timetable-content__class-users class-users">
                <p class="class-users__text">Класс:</p>
                <select class="class-users__select">
                </select>
            </div>
            <button class="function-timetable-content-list__button-add-subject-admin button-add-subject-admin">Добавить предмет</button>
            <button class="function-timetable-content-list__button-add-class button-add-class">Добавить класс</button>
        </div>
        <div class="function-timetable-content__content-block content-block">
            <div class="schedule-function__schedule-tables schedule-tables" id="week">
  
           </div>
        </div>
    </div> 
`
}

//FUNCTION TO CHANGE SITE BLOCKS----------------------------------------------------------------------------------------
function change_site_block(name) {
    let main_block = $(".right-block-admin")
    main_block.empty()
    main_block.append(site_block[name]);
}

//==============================================SITE BLOCKS=============================================================

//==============================================USER LIST===============================================================

$('.button-list-user-admin').click(() => {
    change_site_block('list-user');

//GET CLASSES AND SHOW ALL USERS-----------------------------------------------------------------------------------------

    $.ajax({
        type: 'GET',
        url: "admin/users/class",
        success: function (res) {
            let classes = res['classes'];
            let class_selector = $('.class-users__select');
            for (let i in classes) {
                class_selector.append(
                    '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                )
            }
        }
    })
    $.ajax({
        type: 'POST',
        url: "admin/users/list",
        data: {class: "all"},
        success: function (response) {
            let users_div = $('#user_list');
            users_div.empty();
            if (response) {
                let res = response['users'];
                for (let i in res) {
                    let first_status = "";
                    let sec_status = "";
                    if (res[i][3] === "student") {
                        first_status = "Ученик";
                        sec_status = "Модератор";
                    } else {
                        first_status = "Модератор";
                        sec_status = "Ученик";
                    }
                    users_div.append(
                        '<div class="content-table-list__table-element-check table-element-check" id="userNumber_' + i + '">\n' +
                        '     <div class="element-check__info-check-element info-check-element">\n' +
                        '          <div class="info-check-element__fio" id="user_' + i + '">' + ucfirst(res[i][0]) + " " + ucfirst(res[i][1]) + '</div>\n' +
                        '          <div class="info-check-element__class" id="class_' + i + '" data-value="' + res[i][2] + '">\n' + res[i][2].split("_")[0] + res[i][2].split("_")[1] + '</div>\n' +
                        '     </div>\n' +
                        '     <div class="element-check__function-table-element function-table-element">\n' +
                        '       <select class="function-table-element__function-list status_selector" id="status_' + i + '">\n' +
                        '           <option value="' + first_status + '">' + first_status + '</option>\n' +
                        '           <option value="' + sec_status + '">' + sec_status + '</option>\n' +
                        '       </select>\n' +
                        '       <button class="function-table-element__function-button resetPassBut" id="passbut_' + i + '">Сбросить пароль</button>\n' +
                        '       <button class="function-table-element__function-button delBut" id="delbut_' + i + '">Удалить</button>\n' +
                        '      </div>\n' +
                        '</div>'
                    )
                }
            }
        }
    })

//GET LIST OF USERS BY CLASS--------------------------------------------------------------------------------------------------

    $(document).on('change', '.class-users__select', function () {
        let class_ = $('.class-users__select').val();
        $.ajax({
            type: 'POST',
            url: "admin/users/list",
            data: {class: class_},
            success: function (response) {
                let users_div = $('#user_list');
                users_div.empty();
                if (response) {
                    let res = response['users'];
                    for (let i in res) {
                        let first_status = "";
                        let sec_status = "";
                        if (res[i][3] === "student") {
                            first_status = "Ученик";
                            sec_status = "Модератор";
                        } else {
                            first_status = "Модератор";
                            sec_status = "Ученик";
                        }
                        users_div.append(
                            '<div class="content-table-list__table-element-check table-element-check" id="userNumber_' + i + '">\n' +
                            '     <div class="element-check__info-check-element info-check-element">\n' +
                            '          <div class="info-check-element__fio" id="user_' + i + '">' + ucfirst(res[i][0]) + " " + ucfirst(res[i][1]) + '</div>\n' +
                            '          <div class="info-check-element__class" id="class_' + i + '" data-value="' + res[i][2] + '">' + res[i][2].split("_")[0] + res[i][2].split("_")[1] + '</div>\n' +
                            '     </div>\n' +
                            '     <div class="element-check__function-table-element function-table-element">\n' +
                            '       <select class="function-table-element__function-list status_selector" id="status_' + i + '">\n' +
                            '           <option value="' + first_status + '">' + first_status + '</option>\n' +
                            '           <option value="' + sec_status + '">' + sec_status + '</option>\n' +
                            '       </select>\n' +
                            '       <button class="function-table-element__function-button resetPassBut" id="passbut_' + i + '">Сбросить пароль</button>\n' +
                            '       <button class="function-table-element__function-button delBut" id="delbut_' + i + '">Удалить</button>\n' +
                            '      </div>\n' +
                            '</div>'
                        )
                    }
                }
            }
        })
    })

//RESET PASSWORD BUTTON----------------------------------------------------------------------------------------------------------

    $(document).on('click', '.resetPassBut', function (e) {
        let id = e.target.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).data('value');
        $.ajax({
            type: 'POST',
            url: "admin/user/password",
            data: {surname: surname, name: name, class: class_},
            success: function (res) {
                alert("новый пароль пользователя - " + res['newPass']);
                return
            }
        })
    })

//DELETE USERS BUTTON------------------------------------------------------------------
    $(document).on('click', '.delBut', function (e) {
        let id = e.target.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).data('value');
        $.ajax({
            type: 'POST',
            url: "admin/user/delete",
            data: {surname: surname, name: name, class: class_},
            success: function (res) {
                if (res['result']) {
                    $('#userNumber_' + id).remove();
                } else {
                    alert("непредвиденная ошибка");
                }
            }
        })
    })


//CHANHGE USER'S STATUS----------------------------------------------------------------------------------------------------
    $(document).on('change', '.status_selector', function (e) {
        let id = e.target.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).data('value');
        let status = e.target.value;
        $.ajax({
            type: 'POST',
            url: "admin/user/status",
            data: {surname: surname, name: name, class: class_, status: status},
            success: function (res) {
                // а зачем обновлять или что-то делать?? оно и так норм себя чувствует
            }
        })
    })


//FIND USER BY SURNAME-----------------------------------------------------------------------------------------------
    $('.find-users__button-find').click(() => {
        let search_text = $('.find-users__text-input').val().trim();
        $.ajax({
            type: 'POST',
            url: "admin/users/find",
            data: {surname: search_text},
            success: function (res) {
                let users_div = $('#user_list');
                users_div.empty();
                let i = '0';
                if (res) {
                    if (res['status'] === "none") {
                        users_div.append('<h1>Пользователь не найден, проверьте корректность записи</h1>');
                    } else {
                        let first_status = "";
                        let sec_status = "";
                        if (res["status"] === "student") {
                            first_status = "Ученик";
                            sec_status = "Модератор";
                        } else {
                            first_status = "Модератор";
                            sec_status = "Ученик";
                        }
                        users_div.append(
                            '<div class="content-table-list__table-element-check table-element-check">\n' +
                            '<div class="element-check__info-check-element info-check-element">\n' +
                            '     <div class="info-check-element__fio" id="user_' + i + '">' + ucfirst(res['surname']) + " " + ucfirst(res['name']) + '</div>\n' +
                            '     <div class="info-check-element__class" id="class_' + i + '" data-value="' + res["class"] + '">' + res["class"].split("_")[0] + res["class"].split("_")[1] + '</div>\n' +
                            '</div>\n' +
                            '<div class="element-check__function-table-element function-table-element">\n' +
                            '       <select class="function-table-element__function-list status_selector" id="status_' + i + '">\n' +
                            '           <option value="' + first_status + '">' + first_status + '</option>\n' +
                            '           <option value="' + sec_status + '">' + sec_status + '</option>\n' +
                            '       </select>\n' +
                            '       <button class="function-table-element__function-button resetPassBut" id="passbut_' + i + '">Сбросить пароль</button>\n' +
                            '       <button class="function-table-element__function-button delBut" id="delbut_' + i + '">Удалить</button>\n' +
                            '</div>\n' +
                            '</div>'
                        )
                    }
                }
            }
        });
    });

//ADD USER MODAL-------------------------------------------------------------
    $('.button-add-user-admin').click(() => {
        openModal('add-user');
        $.ajax({
            type: 'GET',
            url: "admin/users/class",
            success: function (res) {
                let classes = res['classes'];
                let class_selector = $('.user-function-class__select');
                for (let i in classes) {
                    class_selector.append(
                        '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                    )
                }
            }
        })
        let genereteBut = $('.password-input__reload');

        genereteBut.click(() => {
            $.ajax({
                type: 'GET',
                url: "admin/addmodal/getpass",
                success: function (res) {
                    let newPass = res['pass'];
                    $('.password-input__textinput').val(newPass);
                }
            })
        })

        let add_button = $('#addButton');
        add_button.click(() => {
            let name = $('#addName').val().trim().toLowerCase();
            let surname = $('#addSurname').val().trim().toLowerCase();
            let class_ = $('.user-function-class__select').val();
            let password = $('#addPassword').val();
            let status = $('.user-function-rank__select').val();
            console.log(class_, status);
            if (class_ === "") {
                alert("выберите класс");
            }
            if (name === "" || surname === "" || password === "")
                alert("заполните все поля");
            console.log(name, surname, password);
            $.ajax({
                url: "registration",
                type: "POST",
                data: {
                    name: name,
                    surname: surname,
                    pass: password,
                    class_: class_,
                    status: status
                },
                success: function (res) {
                    const dialog = document.querySelector('.modal-add-user');
                    dialog.close();
                    $('body').toggleClass('modal');
                    dialog.remove();
                    $('.button-list-user-admin').trigger('click');
                }
            });
        });
    });
});

//==============================================EVENTS==================================================================
$('.button-event-admin').click(() => {
    change_site_block('event');
    $.ajax({
        type: "GET",
        url: "admin/events/get",
        success: function (res) {
            let eventsList = $('#eventsList');
            eventsList.empty();
            let events = res['events'];
            for (let i in events) {
                eventsList.append(
                    '<div class="content-table-list__table-element-check table-element-check" id="event_' + i + '">\n' +
                    '   <div class="element-check__info-check-element info-check-element">\n' +
                    '       <div class="info-check-element__name-event" id="text_' + i + '">' + events[i][0] + '</div>\n' +
                    '       <div class="info-check-element__date-event" id="date_' + i + '">' + events[i][1] + '</div>\n' +
                    '       <div class="info-check-element__event-location" id="place_' + i + '">' + events[i][2] + '</div>\n' +
                    '   </div>\n' +
                    '   <div class="element-check__function-table-element function-table-element">\n' +
                    '       <button class="function-table-element__function-button" id="eventDel_' + i + '">Удалить</button>\n' +
                    '   </div>\n' +
                    '</div>'
                )
            }
        }
    })

    $(document).on('click', '.function-table-element__function-button', function (e) {
        let id = e.target.id.split('_')[1];
        let place = $('#place_' + id).text();
        let date = $('#date_' + id).text();
        let text = $('#text_' + id).text();
        $.ajax({
            type: "POST",
            url: "admin/events/del",
            data: {place: place, date: date, text: text},
            success: function (res) {
                if (res.del)
                    $('#event_' + id).remove();
                else {
                    alert('Произошла непредвиденная ошибка');
                }
            }
        })
    })


    $('.button-add-event-admin').click(() => {
        openModal('add-event');
        let event_button = $('#addEvent');
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
                url: 'admin/events/add',
                type: 'POST',
                data: {text: event, place: location, date: date},
                success: function (res) {
                    const dialog = document.querySelector('.modal-add-event');
                    dialog.close();
                    $('body').toggleClass('modal');
                    dialog.remove();
                    $('.button-event-admin').trigger('click');
                }
            })
        })
    });

});

//============================================NOTIFICATION==============================================================
$('.button-notice-admin').click(() => {
    change_site_block('notice')
    $.ajax({
        type: 'GET',
        url: "admin/users/class",
        success: function (res) {
            let classes = res['classes'];
            let class_selector = $('.class-users__select');
            for (let i in classes) {
                class_selector.append(
                    '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                )
            }
        }
    })

    let selectedValue = "all";
    get_notice(selectedValue);

//GET NOTICE BY CLASS---------------------------------------------------------------------------------------------------
    $(document).on('change', '.class-users__select', function (e) {
        let selectedValue = $(this).val();
        get_notice(selectedValue);
    });

//DELETE NOTICE---------------------------------------------------------------------------------------------------------
    $(document).on('click', '.function-table-element__function-button', function (e) {
        let id = e.target.id.split('_')[1];
        let class_ = $('#notice_class_' + id).data('value');
        let text = $('#notice_text_' + id).text();
        $.ajax({
            type: "POST",
            url: "admin/notice/del",
            data: {class_: class_, text: text},
            success: function (res) {
                if (res.notice)
                    $('#notice_' + id).remove();
                else {
                    alert('Произошла непредвиденная ошибка');
                }
            }
        })
    })

//ADD NOTICE------------------------------------------------------------------------------------------------------------
    $('.button-add-notice-admin').click(() => {
        let class_ = $('#notice_class').val();
        openModal('add-notice');
        $('#create_notice').click(() => {
            let notify = $('#notification').val();
            $('#notification').removeClass("not-correct");
            if (notify === "" || notify === undefined) {
                $('#notification').addClass("not-correct");
                return;
            }
            $.ajax({
                url: 'admin/notice/add',
                type: 'POST',
                data: {text: notify},
                success: function (res) {
                    const dialog = document.querySelector('.modal-add-notice');
                    if (dialog) {
                        dialog.close();
                        $('body').toggleClass('modal');
                        dialog.remove();
                        $('.button-notice-admin').trigger('click'); //что-то не то
                        $('#notice_class').val(class_);
                    }
                }
            })
        })
    });

});
//===============================================TEACHERS===============================================================
// $('.button-teacher').click(() => {
//     change_site_block('teacher');
//
//     $('.button-add-teacher').click(() => {
//         openModal('add-teacher');
//         let name = $('#teacher_name').val();
//         let surname = $('#teacher_surname').val();
//         let subject = $('#teacher_subject').val();
//         let classroom = $('#teacher_classroom').val();

//         $('#teacher_name').removeClass("not-correct");
//         $('#teacher_surname').removeClass("not-correct");
//         $('#teacher_subject').removeClass("not-correct");
//         $('#teacher_classroom').removeClass("not-correct");
//         if (name === "" || name === undefined) {
//             $('#teacher_name').addClass("not-correct");
//             return;
//         } else {
//             if (surname === "" || surname === undefined) {
//                 $('#teacher_surname').addClass("not-correct");
//                 return;
//             } else {
//                 if (subject === "" || subject === undefined) {
//                     $('#teacher_subject').addClass("not-correct");
//                     return;
//                 } else {
//проверку для класса сделай
//                     $.ajax({
//                         url: 'admin/teacher/add',
//                         type: 'POST',
//                         data: {name: name, surname: surname, subject: subject,classroom:classroom},
//                         success: function (res) {
//                             //pass
//                         }
//                     })
//                 }
//             }
//         }
//     });
// });

//==============================================TIMETABLE===============================================================
$('.button-timetable-admin').click(() => {
    change_site_block('timetable')

//GET CLASSES-----------------------------------------------------------------------------------------------------------

    $.ajax({
        type: 'GET',
        url: "admin/users/class",
        success: function (res) {
            let classes = res['classes'];
            let class_selector = $('.class-users__select');
            for (let i in classes) {
                class_selector.append(
                    '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                )
            }
            update_timetable(res['classes'][0]);
        }
    })

//CHANGE CLASSES--------------------------------------------------------------------------------------------------------
    $(document).on('change', '.class-users__select', function (e) {
        let class_ = $('.class-users__select').val();
        update_timetable(class_);
    })

//CHANGE TIMETABLE------------------------------------------------------------------------------------------------------
    $(document).on('change', '.line__select', function (e) {
        let selectedValue = $(this).val();
        let weekday = e.target.id.split('_')[0];
        let id = e.target.id.split('_')[2];
        let class_ = $('.class-users__select').val();
        $.ajax({
            type: "POST",
            url: 'admin/timetable/change',
            data: {class_: class_, weekday: weekday, number: id, subject: selectedValue},
            success: function (res) {
                update_timetable(class_);
            }
        })
    });


//ADD SUBJECT MODAL-----------------------------------------------------------------------------------------------------
    $('.button-add-subject-admin').click(() => {
        openModal('add-subject');
        let add_subjects = $('#subjectsList');
        add_subjects.empty();
        get_subjects().then(subjects => {
            for (let i in subjects) {
                add_subjects.append(
                    '<div class="content-change-subject__subject-change-block subject-change-block" id="subject_' + i + '">\n' +
                    '     <h5 class="subject-change-block__name">' + subjects[i].replaceAll("_", " ") + '</h5>\n' +
                    '     <input type="button" class="subject-change-block__delete" name="' + subjects[i] + '" id="' + i + '" value="Удалить">\n' +
                    '</div>'
                );
            }
        })
//DELETE SUBJECT--------------------------------------------------------------------------------------------------------

        $(document).on('click', '.subject-change-block__delete', function () {
            let subject = $(this).attr('name');
            let id = $(this).attr('id');
            let div = $('#subject_' + id);
            $.ajax({
                type: 'POST',
                url: 'admin/timetable/modal/del',
                data: {subject: subject},
                success: function (res) {
                    div.remove();
                    const dialogElement = document.querySelector('.modal-add-subject');
                    if (dialogElement) {
                        dialogElement.addEventListener('close', function () {
                            let class_ = $('.class-users__select').val();
                            update_timetable(class_);
                        });
                    } else {
                        console.error("Элемент .modal-add-subject не найден.");
                    }
                }
            })
        });


//ADD SUBJECT-----------------------------------------------------------------------------------------------------------
        let addSubBut = $('#addSubjectButton');
        addSubBut.click(() => {
            let subject = $('#newSubject').val().trim();
            if (/^\s*$/.test(subject)) {
                alert("сначала введите название предмета");
                return
            }
            $.ajax({
                type: 'POST',
                url: 'admin/timetable/addSubject',
                data: {subject: subject},
                success: function (res) {
                    if (res['added']) {
                        const dialog = document.querySelector('.modal-add-subject');
                        dialog.close();
                        $('body').toggleClass('modal')
                        dialog.remove()
                        $('.button-add-subject-admin').click();
                    } else {
                        alert("Такой предмет уже есть");
                        return;
                    }
                    const dialogElement = document.querySelector('.modal-add-subject');
                    if (dialogElement) {
                        dialogElement.addEventListener('close', function () {
                            let class_ = $('.class-users__select').val();
                            update_timetable(class_);
                        });
                    } else {
                        console.error("Элемент .modal-add-subject не найден.");
                    }
                }
            })
        })
    });


//ADD NEW CLASS---------------------------------------------------------------------------------------------------------
    $('.button-add-class').click(() => {
        openModal('add-class');

//GET CLASSES-----------------------------------------------------------------------------------------------------------
        let classes_list = $('#classList');
        classes_list.empty();
        $.ajax({
            type: "GET",
            url: "admin/users/class",
            success: function (res) {
                let classes = res['classes'];
                for (let i in classes) {
                    classes_list.append(
                        '<div class="content-change-class__class-change-block class-change-block" id="div_class' + i + '">\n' +
                        '   <h5 class="class-change-block__name" id="class_' + i + '">' + classes[i] + '</h5>\n' +
                        '   <button type="button" class="class-change-block__delete" id="delClasBut_' + i + '">Удалить</button>\n' +
                        '</div>'
                    );
                }
            }
        })
//DELETE----------------------------------------------------------------------------------------------------------------
        $(document).on('click', '.class-change-block__delete', function (e) {
            let class_id = e.target.id.split('_')[1];
            let class_ = $('#class_' + class_id).text();
            let classes = $('.class-users__select').val();
            $.ajax({
                type: "POST",
                url: "admin/timetable/delClass",
                data: {class_: class_},
                success: function (res) {
                    $('#div_class' + class_id).remove();
                    const dialogElement = document.querySelector('.modal-add-class');
                    if (dialogElement) {
                        dialogElement.addEventListener('close', function () {
                            $('.button-timetable-admin').trigger('click');
                        });
                    }
                }
            })
        });

//ADD-------------------------------------------------------------------------------------------------------------------
        let addClassBut = $('#addClasssButton');
        addClassBut.click(() => {
            let class_ = $('#newClass').val().trim();
            if (/^\s*$/.test(class_)) {
                alert("сначала введите название предмета");
                return
            } else {
                $.ajax({
                    type: 'POST',
                    url: 'admin/timetable/addClass',
                    data: {class_: class_},
                    success: function (res) {
                        if (res['class_']) {
                            const dialog = document.querySelector('.modal-add-class');
                            dialog.close();
                            $('body').toggleClass('modal')
                            dialog.remove()
                            $('.button-add-class').click();
                        } else {
                            alert("класс уже существует или вы ввели некорректное значение :/");
                            return;
                        }
                        const dialogElement = document.querySelector('.modal-add-class');
                        if (dialogElement) {
                            dialogElement.addEventListener('close', function () {
                                $('.button-timetable-admin').trigger('click');
                            });
                        } else {
                            console.error("Элемент .modal-add-class не найден.");
                        }
                    }
                })
            }
        })
    });
});


function get_subjects() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: 'admin/timetable/getSubject',
            success: function (res) {
                let response = res['subjects'];
                let subjects = Array.isArray(response) ? response : [response];
                resolve(subjects);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}

function update_timetable(class_) {
    $.ajax({
        type: 'POST',
        url: "admin/timetable/get",
        data: {class_: class_},
        success: function (r) {
            let week = $('#week');
            let ru_week = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            let i = 0;

            get_subjects().then(subjects => {
                week.empty();
                let st = '';
                for (let weekday in r) {
                    st += '<div class="schedule-tables__schedule-table schedule-table" id="' + weekday + '">\n' +
                        '   <h3 class="schedule-table__title">' + ru_week[i] + '</h3>\n' +
                        '       <table class="schedule-table__table table">\n';

                    let day = r[weekday];
                    let num = 0;
                    for (let j in day) {
                        num += 1;
                        st += '           <tr class="table__line line">\n' +
                            '               <td class="line__column-1">' + num + '.</td>\n' +
                            '               <td class="line__column-2">\n' +
                            '                   <select class="line__select" id="' + weekday + '_subject_' + num + '">\n' +
                            '                       <option value="' + day[j] + '">' + day[j].replaceAll("_", " ") + '</option>\n';
                        for (let subject in subjects) {
                            st += '                 <option value="' + subjects[subject] + '">' + subjects[subject].replaceAll("_", " ") + '</option>\n'
                        }
                        st += '                   </select>\n' +
                            '               </td>\n' +
                            '           </tr>\n';
                    }

                    st += '       </table>\n' +
                        '</div>';
                    i += 1;
                }
                week.append(st);
            });
        }
    })
}

function get_notice(class_) {
    let list_of_notice = $('#noticeList');
    $.ajax({
        type: 'POST',
        url: "admin/notice/get",
        data: {class_: class_},
        success: function (res) {
            list_of_notice.empty();
            let notices = res['notify'];
            for (let i in notices) {
                let true_class = '';
                if (notices[i][0] === "all") {
                    true_class = "all";
                } else {
                    true_class = notices[i][0].split("_")[0] + notices[i][0].split("_")[1];
                }
                list_of_notice.append(
                    '<div class="content-table-list__table-element-check table-element-check" id="notice_' + i + '">\n' +
                    '   <div class="element-check__info-check-element info-check-element">\n' +
                    '      <div class="info-check-element__text" id="notice_text_' + i + '">' + notices[i][1] + '</div>\n' +
                    '      <div class="info-check-element__class" id="notice_class_' + i + '" data-value="' + notices[i][0] + '">' + true_class + '</div> \n' +
                    '   </div>\n' +
                    '   <div class="element-check__function-table-element function-table-element">\n' +
                    '      <button class="function-table-element__function-button" id="noticeDelBut_' + i + '">Удалить</button>\n' +
                    '   </div>\n' +
                    '</div>'
                )
            }
        }
    });
}