//================================================MODALS================================================================

$(document).ready(function () {
    $(window).resize();
});
$(window).resize(function () {
    let height = Math.max($(window).height() - 360, 300);
    $(".content-table-list").css({"max-height": height + "px"});
});

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
            <input type="button" class="content-add-user__submit" id="add_new_user" value="Добавить">
        </form>
    </dialog>
`,
    "add-teachers":
        `
  <dialog class="modal-add-teachers  _dialog">
  <div class="modal-add-teachers__content-close content-close"></div>
  <h3 class="modal-add-teachers__title-add-teachers _title-modal">
      Добавление учителя
  </h3>
  <form class="modal-add-teachers__content-add-teachers content-add-teachers">
      <div class="content-add-teachers__teachers-function-surname teachers-function-surname">
          <h4 class="teachers-function-surname__label">Фамилия:</h4>
          <input type="text" id="teacher_surname" class="teachers-function-surname__textinput">
      </div>
      <div class="content-add-teachers__teachers-function-name teachers-function-name">
          <h4 class="teachers-function-name__label">Имя:</h4>
          <input type="text" id="teacher_name" class="teachers-function-name__textinput">
      </div>
      <div class="content-add-teachers__teachers-function-patronymic teachers-function-patronymic">
          <h4 class="teachers-function-patronymic__label">Отечество:</h4>
          <input type="text" id="teacher_lastname" class="teachers-function-patronymic__textinput">
      </div>
      <div class="content-add-teachers__teachers-function-surname teachers-function-surname">
          <h4 class="teachers-function-surname__label">Кабинет:</h4>
          <input type="number" id="classroom" class="teachers-function-surname__textinput" min="99" max="490">
      </div>     
      <div class="content-add-teachers__teachers-function-subject teachers-function-subject">
          <h4 class="teachers-function-subject__label">Предметы:</h4>
          <select name="" id="teacher_subjects" class="teachers-function-subject__select">
              <option value="none">-</option>
          </select>
      </div>      
      <button type="button" class="content-add-teachers__submit" id="add_new_teacher">Добавить</button>
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
            <input type="button" class="content-add-notice__button" value="Создать уведомлeние" id="add-notification">
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
            <input type="button" class="content-add-event__submit" id="add_event" value="Создать событие">
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
                <input type="submit" class="content-add-subject__button" value="Добавить предмет" id="add_subject">
            </form>
            <form class="modal-add-subject__content-change-subject content-change-subject" name="subjectsList" id="subjectsList">

            </form>
    </dialog>
`,
    'teachers-subject':
        `<dialog class="modal-teachers-subject  _dialog">
    <div class="modal-teachers-subject__content-close content-close"></div>
    <h3 class="modal-teachers-subject__title-teachers-subject _title-modal">
        Предметы
    </h3>
    <form class="modal-teachers-subject__content-teachers-subject content-teachers-subject">
        <h4 class="content-teachers-subject__title">Предмет:</h4>
        <select name="" id="other_sub_for_teacher" class="content-teachers-subject__select">
            <option value="">-</option>
            <option value="">Информатика</option>
        </select>
        <button type="button" class="content-teachers-subject__button" id="add_subject_teacher">Добавить предмет</button>
    </form>
    <form class="modal-teachers-subject__content-change-subject content-change-subject" id="list_of_subjects">
      <div class="content-change-subject__subject-change-block subject-change-block">
          <h5 class="subject-change-block__name">предмет</h5>
          <button type="button" class="subject-change-block__delete">Удалить</button>
      </div>
    </form>
    </dialog> `,
    'teachers-students':
        `<dialog class="modal-teachers-students  _dialog">
    <div class="modal-teachers-students__content-close content-close"></div>
    <h3 class="modal-teachers-students__title-teachers-students _title-modal">
        Ученики
    </h3>
    <form class="modal-teachers-students__content-teachers-students content-teachers-students">
        <select name="" id="teachers_sub_select" class="content-teachers-students__select">
            <option value="none">Предмет</option>
        </select>
        <div class="content-teachers-students__find-users find-users">
            <input type="text" class="find-users__text-input" id="find-surname" placeholder="Поиск по фамилии">
            <button class="find-users__button-find" id="find-student">Поиск</button>
        </div>
        <div class="content-teachers-students__user-function-rank user-function-rank">
            <select name="" id="teachers_class_select" class="user-function-rank__select">
                <option value="all">Все</option>
            </select>
        </div>
        <button type="button" class="content-teachers-students__submit" id="add_all_class">Добавить класс</button>
    </form>
    <form class="modal-teachers-students__content-change-students content-change-students">
            <div class="content-change-students__content-table-list content-table-list" id="stud_container">
            
            <div class="content-table-list__table-element-check table-element-check">
                <div class="element-check__info-check-element info-check-element">
                    <div class="info-check-element__fio">Масолыгин Максим</div>
                    <div class="info-check-element__class">10В</div>
                </div>
                <div class="element-check__function-table-element function-table-element">
                    <button class="function-table-element__function-button" id="add_stud_ + 'id' ">Добавить</button>
                    <button class="function-table-element__function-button" id="del_stud_ + 'id' ">Удалить</button>
                </div>
            </div>
            
        </div>
    </form>
    </dialog> `,

    'add-class': `
    <dialog class="modal-add-class  _dialog">
        <div class="modal-add-class__content-close content-close"></div>
            <h3 class="modal-add-class__title-add-class _title-modal">
                Добавить класс
            </h3>
            <form method="post" class="modal-add-class__content-add-class content-add-class">
                <h4 class="content-add-class__title">Класс:</h4>
                <input type="text" class="content-add-class__textinput" id="newClass">
                <input type="submit" class="content-add-class__button" value="Добавить класс" id="add_new_class">
            </form>
            <form class="modal-add-class__content-change-class content-change-class" id="classList">
                    
            </form>
    </dialog>
 `//
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
    //const dialog = document.querySelector('.modal-admin-event');
    dialog.showModal();

    $('body').addClass('modal');

    // Закрытие по крестику
    $('.content-close').click(function () {
        dialog.close();
        $('body').toggleClass('modal')
        dialog.remove()

    });


    // Закрытие по клавише Esc и Enter - send-button.
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
                    <button class="find-users__button-find" id="users_find">Поиск</button>
            </div>
            <div class="function-user-list__class-users class-users">
                <p class="class-users__text">Класс:</p>
                    <select class="class-users__select" id="user_classes">
                        <option value="all">Все</option>
                    </select>
                    <button class="class-users__button-add-user-admin button-add-user-admin">Добавить пользователя</button>
            </div>
        </div>
        <div class="user-list__content-table-list content-table-list" id="user_list">    
        </div>
        
        <label class="user-list__add-file-users add-file-users">

        <input type="file" class="add-file-users__input" id="students_add_file">
        <span class="add-file-users__text">Файл</span>

    
        <button class="add-file-users__button" id="add_file_students">Загрузить учеников</button>
    </label>
    
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
                <select class="class-users__select" id="timetable_class_select">
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
`,
    "teachers":
        `

<div class="right-block-admin__teachers-admin teachers-admin">

    <h3 class="teachers-admin__title">
        Учителя
    </h3>
    
      <div class="teachers-admin__function-teachers-admin function-teachers-admin">
            <div class="function-teachers-admin__find-users find-users">
                <input type="text" class="find-users__text-input" id="teacher_search_text" placeholder="Поиск по фамилии">
                <button class="find-users__button-find" id="teacher_search_but">Поиск</button>
            </div>

            <button class="teachers-admin__button-add-teachers-admin button-add-teachers-admin">Добавить учителя</button>

      </div>
      <div class="teachers-admin__content-table-list content-table-list" id="teachers_list">

        
      </div>
      <label class="teachers-admin__add-file-teachers add-file-teachers">

            <input type="file" class="add-file-teachers__input" id="teacher_add_file">
            <span class="add-file-teachers__text">Файл</span>

            
            <button class="add-file-teachers__button">Загрузить учителей</button>
      </label>
</div> `
}

//FUNCTION TO CHANGE SITE BLOCKS----------------------------------------------------------------------------------------
function change_site_block(name) {
    $(document).off("click");
    let main_block = $(".right-block-admin")
    main_block.empty();
    main_block.append(site_block[name]);

    let height = Math.max($(window).height() - 360, 300);
    $(".content-table-list").css({"max-height": height + "px"});
}

//==============================================SITE BLOCKS=============================================================

//==============================================USER LIST===============================================================

$('.button-list-user-admin').click(() => {
    change_site_block('list-user');

    $('.add-file-users__input').on('change', function () {
        let file = this.files[0];

        if (!file) {
            return;
        }

        let buf = file.name;
        $(this).closest('.add-file-users').find('.add-file-users__text').html(buf);
    });

    $('#add_file_students').click(async function () {
        let file = $('#students_add_file')[0].files;
        let formData = new FormData();
        console.log(file);
        if (!file) {
            return;
        }
        formData.append("file", file[0]);


        $.ajax({
            type: "POST",
            url: "admin/users/load",
            processData: false,
            contentType: false,
            data: formData,
            success: function (res) {
                if (res['link']) {
                    console.log(res['link']);
                    let cont = $('.add-file-users');
                    if ($('#download').length === 0) {
                        cont.append(
                            '<button id="download" value="' + res['link'] + '" class="add-file-users__download download"></button>'
                        );
                    } else {
                        $('#download').remove();
                        cont.append(
                            '<button id="download" value="' + res['link'] + '" class="add-file-users__download download"></button>'
                        );
                    }
                    $('#download').click(function () {
                        let link = $(this).val();
                        console.log("click");
                        let url = "/download/" + encodeURIComponent(link);
                        forceDownload(url, link);
                    });
                }
            }
        })
    })

//GET CLASSES AND SHOW ALL USERS-----------------------------------------------------------------------------------------
    let all_classes = [];
    Promise.resolve().then(() => {
        return new Promise((resolve, reject) => {
            get_classes().then(function (classes) {
                all_classes = classes;
                resolve();
            })
        })
    }).then(() => {
        return new Promise((resolve, reject) => {
            let class_selector = $('#user_classes');
            for (let i in all_classes) {
                class_selector.append(
                    '<option value="' + all_classes[i] + '">' + all_classes[i].replaceAll("_", "") + '</option>'
                )
            }
            resolve();
        })
    }).then(() => {
        return new Promise((resolve, reject) => {
            load_list_of_users("all");
            resolve();
        })
    }).then(() => {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: 'admin/users/get/file',
                success: function (res) {
                    console.log(res['link']);
                    if (res['link'] !== "none") {
                        let cont = $('.add-file-users');
                        if ($('#download').length === 0) {
                            cont.append(
                                '<button id="download" value="' + res['link'] + '" class="add-file-users__download download"></button>'
                            );
                        } else {
                            $('#download').remove();
                            cont.append(
                                '<button id="download" value="' + res['link'] + '" class="add-file-users__download download"></button>'
                            );
                        }
                        $('#download').click(function () {
                            let link = $(this).val();
                            console.log("click");
                            let url = "/download/" + encodeURIComponent(link);
                            forceDownload(url, link);
                        });
                    }
                    resolve();
                }
            })
        })
    })

//GET LIST OF USERS BY CLASS--------------------------------------------------------------------------------------------------

    $('#user_classes').change(function () {
        let class_ = $('#user_classes').val();
        load_list_of_users(class_);
    })

    $('#user_list').on('change', '.class-list', function (e) {
        let select_id = this.id.split("_")[1];
        let val = $('#class_' + select_id).val();
        let surName = $('#user_' + select_id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        $.ajax({
            type: "POST",
            url: "admin/users/class/change",
            data: {surname: surname, name: name, class: val},
            success: function (res) {
                console.log(res);
            }
        })
    })

//RESET PASSWORD BUTTON----------------------------------------------------------------------------------------------------------

    $('#user_list').on('click', '.resetPassBut', function () {
        let id = this.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).val();
        $.ajax({
            type: 'POST',
            url: "admin/user/password",
            data: {surname: surname, name: name, class: class_},
            success: function (res) {
                console.log(res['newPass']);
                alert("новый пароль пользователя - " + res['newPass']);
            }
        })
    })

    $('#user_list').on('click', '.delBut', function () {
        let id = this.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).val();
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
    $('#user_list').on('change', '.status_selector', function () {
        let id = this.id.split('_')[1];
        let surName = $('#user_' + id).text();
        let surname = surName.split(' ')[0].toLowerCase();
        let name = surName.split(' ')[1].toLowerCase();
        let class_ = $('#class_' + id).val();
        let status = this.value;
        $.ajax({
            type: 'POST',
            url: "admin/user/status",
            data: {surname: surname, name: name, class: class_, status: status},
            success: function (res) {

            }
        })
    })


//FIND USER BY SURNAME--------------------------------------------------------------------------------------------------
    $('#users_find').click(() => {
        let search_text = $('.find-users__text-input').val().trim().toLowerCase();
        console.log(search_text);
        let all_classes = [];
        Promise.resolve().then(() => {
            return new Promise((resolve, reject) => {
                get_classes().then(function (classes) {
                    all_classes = classes;
                    resolve();
                })
            })
        }).then(() => {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: 'POST',
                    url: "admin/users/find",
                    data: {surname: search_text},
                    success: function (res) {
                        let users_div = $('#user_list').empty();
                        console.log(res);
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
                            let st =
                                '<div class="content-table-list__table-element-check table-element-check" id="userNumber_0">\n' +
                                '     <div class="element-check__info-check-element info-check-element">\n' +
                                '          <div class="info-check-element__fio" id="user_0">' + ucfirst(res['surname']) + " " + ucfirst(res['name']) + '</div>\n' +
                                '                <select class="info-check-element__class-list class-list" id="class_0">\n' +
                                '                   <option value="' + res['class'] + '">' + res['class'].replaceAll("_", "") + '</option>';
                            for (let j in all_classes) {
                                st +=
                                    '                    <option value="' + all_classes[j] + '">' + all_classes[j].replaceAll("_", "") + '</option>'
                            }
                            st +=
                                '                </select>\n' +
                                '     </div>\n' +
                                '     <div class="element-check__function-table-element function-table-element">\n' +
                                '       <select class="function-table-element__function-list status_selector" id="status_0">\n' +
                                '           <option value="' + first_status + '">' + first_status + '</option>\n' +
                                '           <option value="' + sec_status + '">' + sec_status + '</option>\n' +
                                '       </select>\n' +
                                '       <button class="function-table-element__function-button resetPassBut" id="passbut_0">Сбросить пароль</button>\n' +
                                '       <button class="function-table-element__function-button delBut" id="delbut_0">Удалить</button>\n' +
                                '      </div>\n' +
                                '</div>'
                            users_div.append(st);
                        }
                        resolve();
                    }
                });
            })
        })
    });

//ADD USER MODAL--------------------------------------------------------------------------------------------------------
    $('.button-add-user-admin').click(() => {
        openModal('add-user');

        get_classes().then(function (classes) {
            let class_selector = $('.user-function-class__select');
            for (let i in classes) {
                class_selector.append(
                    '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                )
            }
        }, function (err) {
            console.error(err);
        })

        $('.password-input__reload').click(() => {
            $.ajax({
                type: 'GET',
                url: "admin/addmodal/getpass",
                success: function (res) {
                    let newPass = res['pass'];
                    $('.password-input__textinput').val(newPass);
                }
            })
        })

        $('#add_new_user').click((e) => {
            e.preventDefault();
            let name = $('#addName').val().trim().toLowerCase();
            let surname = $('#addSurname').val().trim().toLowerCase();
            let class_ = $('.user-function-class__select').val();
            let password = $('#addPassword').val();
            let status = $('.user-function-rank__select').val();
            if (class_ === "") {
                alert("выберите класс");
            } else {
                if (name === "" || surname === "" || password === "") {
                    alert("заполните все поля");
                } else {
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
                }
            }
        });
    });
})
;

//==============================================EVENTS==================================================================
$('.button-event-admin').click(() => {
    change_site_block('event');

//GET ALL EVENTS--------------------------------------------------------------------------------------------------------
    $.ajax({
        type: "GET",
        url: "admin/events/get",
        success: function (res) {
            let eventsList = $('#eventsList').empty();
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

//DELETE EVENT----------------------------------------------------------------------------------------------------------
    $('#eventsList').on('click', '.function-table-element__function-button', function (e) {
        e.preventDefault();

        let id = this.id.split('_')[1];
        let place = $('#place_' + id).text();
        let date = $('#date_' + id).text();
        let text = $('#text_' + id).text();
        $.ajax({
            type: "POST",
            url: "admin/events/del",
            data: {place: place, date: date, text: text},
            success: function (res) {
                if (res.del) {
                    $('#event_' + id).remove();
                } else {
                    alert('Произошла непредвиденная ошибка');
                }
            }
        })
    })

//ADD NEW EVENT --------------------------------------------------------------------------------------------------------
    $('.button-add-event-admin').click(() => {
        openModal('add-event');

        $('#add_event').click(function (e) {
            e.preventDefault();

            let event = $('#event_text').val().trim();
            let location = $('#location').val().trim();
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

//GET CLASSES-----------------------------------------------------------------------------------------------------------
    get_classes().then(function (classes) {
        let class_selector = $('.class-users__select');
        for (let i in classes) {
            class_selector.append(
                '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
            )
        }
    }, function (err) {
        console.error(err);
    })

    let selectedValue = "all";
    get_notice(selectedValue);

//GET NOTICE BY CLASS---------------------------------------------------------------------------------------------------
    $('#notice_class').change(function (e) {
        let selectedValue = $(this).val();
        get_notice(selectedValue);
    });

//DELETE NOTICE---------------------------------------------------------------------------------------------------------
    $('#noticeList').on('click', '.function-table-element__function-button', function (e) {
        e.preventDefault();
        let id = this.id.split('_')[1];
        let class_ = $('#notice_class_' + id).data('value');
        let text = $('#notice_text_' + id).text();
        $.ajax({
            type: "POST",
            url: "admin/notice/del",
            data: {class_: class_, text: text},
            success: function (res) {
                if (res.notify) {
                    $('#notice_' + id).remove();
                } else {
                    alert('Произошла непредвиденная ошибка');
                }
            }
        })
    })

//ADD NOTICE------------------------------------------------------------------------------------------------------------
    $('.button-add-notice-admin').click(() => {

        openModal('add-notice');

        $('#add-notification').click((e) => {
            e.preventDefault();
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
                        $('.button-notice-admin').trigger('click');
                    }
                }
            })
        })
    });
});

//===============================================TEACHERS===============================================================
$('.button-teachers-admin').click(() => {
    change_site_block('teachers')

    let teacher_container = $('#teachers_list').empty();
    $.ajax({
        url: 'admin/teacher/get',
        type: 'GET',
        success: function (res) {
            for (let i in res['teachers']) {
                teacher_container.append(
                    '<div class="content-table-list__table-element-check table-element-check" id="teacher_' + i + '">\n' +
                    '     <div class="element-check__info-check-element info-check-element">\n' +
                    '          <div class="info-check-element__fio" id="teacher-name_' + i + '" data-value="' + res['teachers'][i].surname + ' ' + res['teachers'][i].name + ' ' + res['teachers'][i].lastname + '">' + ucfirst(res['teachers'][i]['surname']) + " " + ucfirst(res['teachers'][i]['name'][0]) + "." + ucfirst(res['teachers'][i]['lastname'][0]) + ". " + res['teachers'][i]['classroom'] + ' каб.</div>\n' +
                    '     </div>\n' +
                    '     <div class="element-check__function-table-element function-table-element">\n' +
                    '          <button class="function-table-element__function-button" id="teacher-subjects_' + i + '">Предметы</button>\n' +
                    '          <button class="function-table-element__function-button" id="teacher-students_' + i + '">Ученики</button>\n' +
                    '          <button class="function-table-element__function-button" id="teacher-del_' + i + '">Удалить</button>\n' +
                    '     </div>\n' +
                    '</div>'
                )
            }
        }
    })


    $('.add-file-teachers__input').on('change', function () {
        let file = this.files[0];

        if (!file) {
            return;
        }

        let buf = file.name;
        $(this).closest('.add-file-teachers').find('.add-file-teachers__text').html(buf);
    });

    $(".add-file-teachers__button").click(async function () {
        let file = $('#teacher_add_file')[0].files;
        let formData = new FormData();
        console.log(file);
        if (!file) {
            return;
        }
        formData.append("file", file[0]);


        $.ajax({
            type: "POST",
            url: "admin/teacher/load",
            processData: false,
            contentType: false,
            data: formData,
            success: function () {

            }
        })
    })

// ADD NEW TEACHER------------------------------------------------------------------------------------------------------
    $('.button-add-teachers-admin').click(() => {
        openModal('add-teachers');

        let subject = $('#teacher_subjects').empty();

        get_subjects().then(subjects => {
            for (let i in subjects) {
                if (subjects[i].split('/').length > 1) {
                    subject.append(
                        '<option value="' + subjects[i].split('/')[0] + '"> ' + ucfirst(subjects[i].replaceAll("_", " ").split('/')[0]) + '</option>' +
                        '<option value="' + subjects[i].split('/')[1] + '"> ' + ucfirst(subjects[i].replaceAll("_", " ").split('/')[1]) + ' </option>'
                    )
                } else {
                    subject.append(
                        '<option value="' + subjects[i] + '"> ' + ucfirst(subjects[i].replaceAll("_", " ")) + '</option>'
                    )
                }

            }
        });

        $('#add_new_teacher').click(function (e) {
            e.preventDefault();
            let name = $('#teacher_name').val().trim().toLowerCase();
            let surname = $('#teacher_surname').val().trim().toLowerCase();
            let classroom = $('#classroom').val().trim();
            let lastname = $('#teacher_lastname').val().trim().toLowerCase();
            let subject = $('#teacher_subjects').val();

            $('#teacher_name').removeClass("not-correct");
            $('#teacher_surname').removeClass("not-correct");
            $('#teacher_lastname').removeClass("not-correct");
            $('#classroom').removeClass("not-correct");

            if (/^\s*$/.test(name)) {
                $('#teacher_name').addClass("not-correct");
            } else {
                if (/^\s*$/.test(surname)) {
                    $('#teacher_surname').addClass("not-correct");
                } else {
                    if (/^\s*$/.test(classroom) && /^\d+$/.test(classroom)) {
                        $('#classroom').addClass("not-correct");
                    } else {
                        if (/^\s*$/.test(lastname)) {
                            $('#lastname').addClass("not-correct");
                        } else {
                            $.ajax({
                                url: 'admin/teacher/add',
                                type: 'POST',
                                data: {
                                    name: name,
                                    surname: surname,
                                    lastname: lastname,
                                    subject: subject,
                                    classroom: classroom
                                },
                                success: function (res) {
                                    const dialog = document.querySelector('.modal-add-teachers');
                                    dialog.close();
                                    $('body').toggleClass('modal');
                                    dialog.remove();
                                    $('.button-teachers-admin').trigger('click');
                                }
                            })
                        }
                    }
                }
            }
        })
    });


    $('#teachers_list').on('click', '.function-table-element__function-button', function () {
        let buttonId = this.id;
        let teacher = $('#teacher-name_' + buttonId.split("_")[1]).data("value").toLowerCase();

        switch (buttonId.split("_")[0]) {
            case "teacher-students":
                openModal('teachers-students');

//GET SUBJECTS FOR THIS TEACHER-----------------------------------------------------------------------------------------
                let sub_selector = $('#teachers_sub_select').empty();
                let classes_teacher = $('#teachers_class_select');
                let stud_container = $('#stud_container').empty();


                Promise.resolve().then(() => {
                    return new Promise((resolve, reject) => {
                        $.ajax({
                            url: 'admin/teacher/subject/get',
                            type: 'POST',
                            data: {teacher: teacher},
                            success: function (res) {
                                let subjects = res['subjects'];
                                for (let i in subjects) {
                                    sub_selector.append(
                                        '<option value="' + subjects[i] + '">' + ucfirst(subjects[i].replaceAll("_", " ")) + '</option>'
                                    )
                                }
                                resolve();
                            }, error: reject
                        })
                    })
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        get_classes().then(function (classes) {
                            for (let i in classes) {
                                classes_teacher.append(
                                    '<option value="' + classes[i] + '">' + classes[i].replaceAll("_", "") + '</option>'
                                )
                            }
                            resolve();
                        }).catch(reject);
                    })
                }).then(() => {
                    get_students_for_teachers($('#teachers_class_select').val(), teacher, $('#teachers_sub_select').val()).then(({
                                                                                                                                     students_teacher,
                                                                                                                                     other_students
                                                                                                                                 }) => {
                        let m = 0;
                        for (let i in students_teacher) {
                            stud_container.append(
                                '<div class="content-table-list__table-element-check table-element-check">\n' +
                                '   <div class="element-check__info-check-element info-check-element">\n' +
                                '       <div class="info-check-element__fio" id="student-for-teacher_' + m + '" data-value="' + students_teacher[i][0] + ' ' + students_teacher[i][1] + '">' + ucfirst(students_teacher[i][0]) + " " + ucfirst(students_teacher[i][1]) + '</div>\n' +
                                '       <div class="info-check-element__class" data-value="' + students_teacher[i][2] + '" id="student-class-for-teacher_' + m + '">' + students_teacher[i][2].replaceAll("_", "") + '</div>\n' +
                                '   </div>\n' +
                                '   <div class="element-check__function-table-element function-table-element">\n' +
                                '       <button class="function-table-element__function-button" id="del-stud_ ' + m + '">Удалить</button>\n' +
                                '   </div>\n' +
                                '</div>'
                            )
                            m++;
                        }
                        for (let i in other_students) {
                            stud_container.append(
                                '<div class="content-table-list__table-element-check table-element-check">\n' +
                                '   <div class="element-check__info-check-element info-check-element">\n' +
                                '       <div class="info-check-element__fio" id="student-for-teacher_' + m + '" data-value="' + other_students[i][0] + ' ' + other_students[i][1] + '">' + ucfirst(other_students[i][0]) + " " + ucfirst(other_students[i][1]) + '</div>\n' +
                                '       <div class="info-check-element__class" data-value="' + other_students[i][2] + '" id="student-class-for-teacher_' + m + '">' + other_students[i][2].replaceAll("_", "") + '</div>\n' +
                                '   </div>\n' +
                                '   <div class="element-check__function-table-element function-table-element">\n' +
                                '       <button class="function-table-element__function-button" id="add-stud_ ' + m + '">Добавить</button>\n' +
                                '   </div>\n' +
                                '</div>'
                            )
                            m++;
                        }
                    }).catch(err => {
                        console.error("Ошибка при загрузке студентов:", err);
                    });
                }).catch(err => {
                    console.error("Ошибка во время последовательных запросов:", err);
                });


                $('#teachers_class_select').change(function () {
                    updateStudents(teacher)
                });

                $('#teachers_sub_select').change(function () {
                    updateStudents(teacher)
                });


//FIND STUDENT----------------------------------------------------------------------------------------------------------
                $('#find-student').click(function (e) {
                    e.preventDefault();
                    let surname = $('#find-surname').val().trim().toLowerCase();
                    $.ajax({
                        type: "POST",
                        url: "admin/teacher/student/find",
                        data: {surname: surname, teacher: teacher, subject: sub_selector.val()},
                        success: function (res) {
                            let student = res['student'];
                            stud_container.empty();
                            if (student[0].length === 1) {
                                stud_container.append('<h2>Такого ученика нет в базе :/</h2>');
                            } else {
                                if (student[0][3] === "no") {
                                    stud_container.append(
                                        '<div class="content-table-list__table-element-check table-element-check">\n' +
                                        '   <div class="element-check__info-check-element info-check-element">\n' +
                                        '       <div class="info-check-element__fio" id="student-for-teacher_0" data-value="' + student[0][0] + ' ' + student[0][1] + '">' + ucfirst(student[0][0]) + " " + ucfirst(student[0][1]) + '</div>\n' +
                                        '       <div class="info-check-element__class" data-value="' + student[0][2] + '" id="student-class-for-teacher_0">' + student[0][2].replaceAll("_", "") + '</div>\n' +
                                        '   </div>\n' +
                                        '   <div class="element-check__function-table-element function-table-element">\n' +
                                        '       <button class="function-table-element__function-button" id="add-stud_0">Добавить</button>\n' +
                                        '   </div>\n' +
                                        '</div>'
                                    )
                                } else {
                                    stud_container.append(
                                        '<div class="content-table-list__table-element-check table-element-check">\n' +
                                        '   <div class="element-check__info-check-element info-check-element">\n' +
                                        '       <div class="info-check-element__fio" id="student-for-teacher_0" data-value="' + student[0][0] + ' ' + student[0][1] + '">' + ucfirst(student[0][0]) + " " + ucfirst(student[0][1]) + '</div>\n' +
                                        '       <div class="info-check-element__class" data-value="' + student[0][2] + '" id="student-class-for-teacher_0">' + student[0][2].replaceAll("_", "") + '</div>\n' +
                                        '   </div>\n' +
                                        '   <div class="element-check__function-table-element function-table-element">\n' +
                                        '       <button class="function-table-element__function-button" id="del-stud_0">Удалить</button>\n' +
                                        '   </div>\n' +
                                        '</div>'
                                    )
                                }
                            }

                        }
                    })
                })
                $('#add_all_class').click(function () {
                    $.ajax({
                        type: "POST",
                        url: "admin/teacher/students/add/class",
                        data: {teacher: teacher, class: classes_teacher.val(), subject: sub_selector.val()},
                        success: function (res) {
                            updateStudents(teacher);
                        }
                    })
                })

                stud_container.on('click', '.function-table-element__function-button', function (e) {
                    let add_del = $(this).id;
                    e.preventDefault();
                    let student = $('#student-for-teacher_' + add_del.split('_')[1].trim()).data("value");
                    switch (add_del.split("_")[0]) {
                        case "add-stud":
                            $.ajax({
                                url: 'admin/teacher/student/add',
                                type: 'POST',
                                data: {teacher: teacher, student: student, subject: sub_selector.val()},
                                success: function (res) {
                                    updateStudents(teacher);
                                }
                            })
                            break;
                        case "del-stud":
                            $.ajax({
                                url: 'admin/teacher/student/del',
                                type: 'POST',
                                data: {teacher: teacher, student: student, subject: sub_selector.val()},
                                success: function (res) {
                                    updateStudents(teacher);
                                }
                            })
                            break;
                    }
                })
                break;

            case "teacher-subjects":
                openModal('teachers-subject');

                load_teachers_subject(teacher);

                $('#add_subject_teacher').click(function () {
                    $.ajax({
                        type: "POST",
                        url: "admin/teacher/subject/add",
                        data: {teacher: teacher, subject: $('#other_sub_for_teacher').val()},
                        success: function (res) {
                            load_teachers_subject(teacher);
                        }
                    })
                })

                $('#list_of_subjects').on('click', '.subject-change-block__delete', function () {
                    let sub_delBut_id = $(this).id;
                    let subject = $('#subject_' + sub_delBut_id.split("_")[1]).data('value');
                    $.ajax({
                        type: "POST",
                        url: "admin/teacher/subject/del",
                        data: {teacher: teacher, subject: subject},
                        success: function (res) {
                            load_teachers_subject(teacher);
                        }
                    })
                })

                break;

            case "teacher-del":
                let del_teacher = this.id;
                $.ajax({
                    type: "POST",
                    url: "admin/teacher/del",
                    data: {teacher: teacher},
                    success: function (res) {
                        if (res['teach']) {
                            $('#teacher_' + del_teacher.split("_")[1]).remove();
                            $('#teacher-subject_' + del_teacher.split("_")[1]).off();
                            $('#teacher-student_' + del_teacher.split("_")[1]).off();
                            $('#teacher-del_' + del_teacher.split("_")[1]).off();
                        }
                    }
                })

                break;
        }
    })

    $('#teacher_search_but').click(function () {
        let surname = $('#teacher_search_text').val().trim().toLowerCase();
        $.ajax({
            type: "POST",
            url: "admin/teacher/find",
            data: {surname: surname},
            success: function (res) {
                teacher_container.empty();
                for (let i in res['teachers']) {
                    teacher_container.append(
                        '<div class="content-table-list__table-element-check table-element-check" id="teacher_' + i + '">\n' +
                        '     <div class="element-check__info-check-element info-check-element">\n' +
                        '          <div class="info-check-element__fio" id="teacher-name_' + i + '" data-value="' + res['teachers'][i][0] + ' ' + res['teachers'][i][1] + ' ' + res['teachers'][i][2] + '">' + ucfirst(res['teachers'][i][0]) + " " + ucfirst(res['teachers'][i][1][0]) + "." + ucfirst(res['teachers'][i][2][0]) + ". " + res['teachers'][i][3] + ' каб.</div>\n' +
                        '     </div>\n' +
                        '     <div class="element-check__function-table-element function-table-element">\n' +
                        '          <button class="function-table-element__function-button" id="teacher-subjects_' + i + '">Предметы</button>\n' +
                        '          <button class="function-table-element__function-button" id="teacher-students_' + i + '">Ученики</button>\n' +
                        '          <button class="function-table-element__function-button" id="teacher-del_' + i + '">Удалить</button>\n' +
                        '     </div>\n' +
                        '</div>'
                    )
                }
            }
        })
    })

});

//==============================================TIMETABLE===============================================================
$('.button-timetable-admin').click(() => {
    change_site_block('timetable')

    get_classes().then(function (classes) {
        if (classes.length > 0) {
            let class_selector = $('#timetable_class_select').empty();
            for (let i in classes) {
                class_selector.append(
                    '<option value="' + classes[i] + '">' + classes[i].split("_")[0] + classes[i].split("_")[1] + '</option>'
                )
            }
            update_timetable(classes[0]);
        } else {
            let class_selector = $('#timetable_class_select');
            class_selector.append('<option value="none"> добавьте класс </option>');
        }
    }, function (err) {
        console.error(err);
        let class_selector = $('#timetable_class_select');
        class_selector.append('<option value="none"> добавьте класс </option>');
    })

//CHANGE CLASSES--------------------------------------------------------------------------------------------------------
    $('#timetable_class_select').change(function () {
        update_timetable($('#timetable_class_select').val());
    })

//CHANGE TIMETABLE------------------------------------------------------------------------------------------------------
    $('#week').on('change', '.line__select', function (e) {
        let selectedValue = $(this).val();
        let weekday = e.target.id.split('_')[0];
        let id = e.target.id.split('_')[2];
        let class_ = $('#timetable_class_select').val();
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

        let add_subjects = $('#subjectsList').empty();
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
        $('#subjectsList').on('click', '.subject-change-block__delete', function () {
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
                            let class_ = $('#timetable_class_select').val();
                            update_timetable(class_);
                        });
                    } else {
                        console.error("Элемент .modal-add-subject не найден.");
                    }
                }
            })
        });


//ADD SUBJECT-----------------------------------------------------------------------------------------------------------
        $('#add_subject').click(function (e) {
            e.preventDefault();
            let subject = $('#newSubject').val().trim().toLowerCase();
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
                    }
                }
            })
            const dialogElement = document.querySelector('.modal-add-subject');
            if (dialogElement) {
                dialogElement.addEventListener('close', function () {
                    update_timetable($('#timetable_class_select').val());
                });
            } else {
                console.error("Элемент .modal-add-subject не найден.");
            }
        })
    });


//ADD NEW CLASS---------------------------------------------------------------------------------------------------------
    $('.button-add-class').click(() => {
        openModal('add-class');

//GET CLASSES-----------------------------------------------------------------------------------------------------------
        let classes_list = $('#classList').empty();
        get_classes().then(function (classes) {
            for (let i in classes) {
                classes_list.append(
                    '<div class="content-change-class__class-change-block class-change-block" id="div_class' + i + '">\n' +
                    '   <h5 class="class-change-block__name" id="class_' + i + '" data-value="' + classes[i] + '">' + classes[i].replaceAll("_", "") + '</h5>\n' +
                    '   <button type="button" class="class-change-block__delete" id="delClasBut_' + i + '">Удалить</button>\n' +
                    '</div>'
                );
            }
        }, function (err) {
            console.error(err);
        })

//DELETE----------------------------------------------------------------------------------------------------------------
        $('#classList').on('click', '.class-change-block__delete', function (e) {
            e.preventDefault();
            let class_id = this.id.split("_")[1];
            let class_ = $('#class_' + class_id).data('value');
            $.ajax({
                type: "POST",
                url: "admin/timetable/delClass",
                data: {class_: class_},
                success: function (res) {
                    $('#div_class' + class_id).remove();
                }
            })

            const dialogElement = document.querySelector('.modal-add-class');
            if (dialogElement) {
                dialogElement.addEventListener('close', function () {
                    $('.button-timetable-admin').trigger('click');
                });
            }
        });

//ADD-------------------------------------------------------------------------------------------------------------------
        $('#add_new_class').click(function (e) {
            e.preventDefault();
            let class_ = $('#newClass').val().trim().toLowerCase();
            if (/^\s*$/.test(class_)) {
                alert("сначала введите название класса");
                return
            }
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
                        alert("Такой класс уже есть");
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

function get_classes() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "GET",
            url: "admin/users/class",
            success: function (res) {
                let classes = res['classes'];
                resolve(classes);
            },
            error: function (err) {
                reject(err);
            }
        })
    })
}

function get_students_for_teachers(class_, teacher, subject) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: "POST",
            url: "admin/teacher/student/get",
            data: {class: class_, teacher: teacher, subject: subject},
            success: function (res) {
                resolve({students_teacher: res['students_by'], other_students: res['other']});
            }, error: function (err) {
                reject(err);
            }
        })
    })
}

function updateStudents(teacher) {
    let class_ = $('#teachers_class_select').val();
    let subject = $('#teachers_sub_select').val();
    let stud_container = $('#stud_container').empty();
    get_students_for_teachers(class_, teacher, subject).then(({
                                                                  students_teacher,
                                                                  other_students
                                                              }) => {
        let m = 0;
        for (let i in students_teacher) {
            stud_container.append(
                '<div class="content-table-list__table-element-check table-element-check">\n' +
                '   <div class="element-check__info-check-element info-check-element">\n' +
                '       <div class="info-check-element__fio" id="student-for-teacher_' + m + '" data-value="' + students_teacher[i][0] + ' ' + students_teacher[i][1] + '">' + ucfirst(students_teacher[i][0]) + " " + ucfirst(students_teacher[i][1]) + '</div>\n' +
                '       <div class="info-check-element__class" data-value="' + students_teacher[i][2] + '" id="student-class-for-teacher_' + m + '">' + students_teacher[i][2].replaceAll("_", "") + '</div>\n' +
                '   </div>\n' +
                '   <div class="element-check__function-table-element function-table-element">\n' +
                '       <button class="function-table-element__function-button" id="del-stud_ ' + m + '">Удалить</button>\n' +
                '   </div>\n' +
                '</div>'
            )
            m++;
        }
        for (let i in other_students) {
            stud_container.append(
                '<div class="content-table-list__table-element-check table-element-check">\n' +
                '   <div class="element-check__info-check-element info-check-element">\n' +
                '       <div class="info-check-element__fio" id="student-for-teacher_' + m + '" data-value="' + other_students[i][0] + ' ' + other_students[i][1] + '">' + ucfirst(other_students[i][0]) + " " + ucfirst(other_students[i][1]) + '</div>\n' +
                '       <div class="info-check-element__class" data-value="' + other_students[i][2] + '" id="student-class-for-teacher_' + m + '">' + other_students[i][2].replaceAll("_", "") + '</div>\n' +
                '   </div>\n' +
                '   <div class="element-check__function-table-element function-table-element">\n' +
                '       <button class="function-table-element__function-button" id="add-stud_ ' + m + '">Добавить</button>\n' +
                '   </div>\n' +
                '</div>'
            )
            m++;
        }
    });
}

function update_timetable(class_) {
    $.ajax({
        type: 'POST',
        url: "admin/timetable/get",
        data: {class_: class_},
        success: function (r) {
            let week = $('#week').empty();
            let ru_week = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            let i = 0;

            get_subjects().then(subjects => {
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
                            '                       <option value="' + day[j] + '">' + ucfirst(day[j].replaceAll("_", " ")) + '</option>\n';
                        for (let subject in subjects) {
                            st += '                 <option value="' + subjects[subject] + '">' + ucfirst(subjects[subject].replaceAll("_", " ")) + '</option>\n'
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

function load_teachers_subject(teacher) {
    let other_subjects_select = $('#other_sub_for_teacher').empty();
    let sub_list = $('#list_of_subjects').empty();

    $.ajax({
        url: 'admin/teacher/subject/get',
        type: 'POST',
        data: {teacher: teacher},
        success: function (res) {
            let subjects = res['subjects'];
            for (let i in subjects) {
                sub_list.append(
                    '<div class="content-change-subject__subject-change-block subject-change-block">\n' +
                    '    <h5 class="subject-change-block__name" data-value="' + subjects[i] + '" id="subject_' + i + '">' + ucfirst(subjects[i].replaceAll("_", "")) + '</h5>\n' +
                    '    <button type="button" class="subject-change-block__delete" id="del-subject_' + i + '">Удалить</button>\n' +
                    '</div>'
                )
            }
        }
    })

    $.ajax({
        url: 'admin/teacher/othersubject/get',
        type: 'POST',
        data: {teacher: teacher},
        success: function (res) {
            let subjects = res['subjects'];
            for (let i in subjects) {
                other_subjects_select.append(
                    '<option value="' + subjects[i] + '">' + ucfirst(subjects[i].replaceAll("_", "")) + '</option>'
                )
            }
        }
    })
}

function load_list_of_users(class_) {
    let all_classes = [];
    Promise.resolve().then(() => {
        return new Promise((resolve, reject) => {
            get_classes().then(function (classes) {
                all_classes = classes;
                resolve();
            })
        })
    }).then(() => {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: "admin/users/list",
                data: {class: class_},
                success: function (response) {
                    let users_div = $('#user_list').empty();
                    if (response['users'].length > 0) {
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
                            let st =
                                '<div class="content-table-list__table-element-check table-element-check" id="userNumber_' + i + '">\n' +
                                '     <div class="element-check__info-check-element info-check-element">\n' +
                                '          <div class="info-check-element__fio" id="user_' + i + '">' + ucfirst(res[i][0]) + " " + ucfirst(res[i][1]) + '</div>\n' +
                                '                <select class="info-check-element__class-list class-list" id="class_' + i + '">\n' +
                                '                   <option value="' + res[i][2] + '">' + res[i][2].replaceAll("_", "") + '</option>';
                            for (let j in all_classes) {
                                st +=
                                    '                    <option value="' + all_classes[j] + '">' + all_classes[j].replaceAll("_", "") + '</option>'
                            }
                            st +=
                                '                </select>\n' +
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
                            users_div.append(st);
                        }
                    }
                }
            }).catch(err => {
                console.error("ошибка загрузки студентов" + err);
            })
        })
    })
}

//загрузка файлов с сервера
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