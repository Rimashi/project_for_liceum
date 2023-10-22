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
        <form method="post" class="modal-login__login-content login-content">
            <input type="text" name="login" class="login-content__login-input" placeholder="Логин">
            <input type="password" name="pass" class="login-content__login-input" placeholder="Пароль">
            <input type="submit" class="login-content__login-button login-button" value="Войти">
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
              <select name="date" class="select-day-homework__select">
                <option value="none">Дата</option>
              </select>
            </div>
            <input type="submit" class="left-add-homework__button-upload-homework" value="Добавить ДЗ" id="add_homework_button">
          </div>
          <div class="content-add-homework__right-add-homework right-add-homework">
            <h4 class="right-add-homework__title">ДЗ:</h4>
            <textarea class="right-add-homework__textarea" name="homework_text"></textarea>
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
        <textarea name="notification" class="content-add-notice__textarea"></textarea>
        <input type="submit" class="content-add-notice__button" value="Создать уведомлeние">
<!--        <button class="content-add-notice__button">Создать уведомлeние</button>-->
    </form>
  </dialog> `,

    'add-event':
        `
  <dialog class="modal-add-event  _dialog">
  <div class="modal-add-event__content-close content-close"></div>
  <h3 class="modal-add-event__title-add-event _title-modal">
      Создать событие
  </h3>
  <form method="post" class="modal-add-event__content-add-event content-add-event">
      <div class="content-add-event__location-event location-event">
          <h4 class="location-event__title">Место проведения:</h4>
          <textarea name="location" class="location-event__textarea"></textarea>
      </div>
      <div class="content-add-event__date-event date-event">
          <h4 class="date-event__title">Дата проведения:</h4>
          <input name="date" type="date" class="date-event__textarea">

      </div>
      <div class="content-add-event__text-event text-event">
          <h4 class="text-event__title">Событие:</h4>
          <textarea name="text" class="text-event__textarea"></textarea>
      </div>
      <input type="submit" class="content-add-event__submit" value="Создать событие">
      <!--<button class="content-add-event__submit">Создать событие</button>-->
  </form>
</dialog> 
  `,
    'admin-event':
        `
  <dialog class="modal-admin-event  _dialog">
  <div class="modal-admin-event__content-close content-close"></div>
  <h3 class="modal-admin-event__title-add-event _title-modal">
      Лицейские события
  </h3>
  <form method="post" class="modal-admin-event__content-add-event content-add-event">
      <div class="content-add-event__location-event location-event">
          <h4 class="location-event__title">Место проведения:</h4>
          <textarea class="location-event__textarea"></textarea>
      </div>
      <div class="content-add-event__date-event date-event">
          <h4 class="date-event__title">Дата проведения:</h4>
          <textarea class="date-event__textarea"></textarea>

      </div>
      <div class="content-add-event__text-event text-event">
          <h4 class="text-event__title">Событие:</h4>
          <textarea class="text-event__textarea"></textarea>
      </div>
      <input type="submit" value="Создать событие" class="content-add-event__submit">
  </form>
  <form method="get" class="modal-admin-event__content-table-list content-table-list">
    <div class="content-table-list__table-element-check table-element-check">
      
      
      
    </div>
  

</form>
</dialog> 
`
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


$('.login-button').click(() => {
    openModal('login')
});

$('.unlogin-button').click(() => {
    $.get('/logout', function () {
        window.location.href = "/";
    })
});


$('.button-add-hometask').click(() => {
    openModal('add-homework');
    let b = $('.select-subject-homework__select')

    $.ajax({
        type: "GET",
        url: "/student/modal",
        success: function (json) {
            let a = json.subjects;
            for (let i in a) {
                b.append('<option value=' + a[i].replace(" ", "_") + '>' + a[i] + '</option>');

            }
        }

    });
    b.on('change', function (e) {

        let subject = e.target.value;
        //console.log(subject)
        let f = $('.select-day-homework__select');
        f.empty();
        $.ajax({
            type: "GET",
            url: "/student/modal/date",
            data: {subject: subject},
            success: function (data) {

                let dateJSON = data.dates;

                for (let i in dateJSON) {
                    f.append('<option value=' + dateJSON[i] + '>' + dateJSON[i] + '</option>');

                }
            }, error: function (xhr, status, error) {
                console.error(xhr.responseText);
                console.log("пустой json");
            }
        })
    })
});

$('.button-check-hometask').click(() => {
    openModal('check-hometask');
    let a = $('.content-table-list');
    a.empty();
    $.ajax({
        type: "GET",
        url: "/leader/checkmodal",
        success: function (json) {
            let g = json['hometasks'];
            for (let i in g) {
                if (g[i].length > 0)
                    a.append('<div class="content-table-list__table-element-check table-element-check" id="element_check_' + i + '">' +
                        '<div class="element-check info-check-element">' +
                        '   <div class="info-check-element__login" id="surname' + i + '">' + g[i][0] + '</div>\n' +
                        '        <div class="info-check-element__date" id="date' + i + '">' + g[i][1] + '</div>\n' +
                        '        <div class="info-check-element__subject" id="subject' + i + '">' + g[i][2] + '</div>\n' +
                        '    </div>\n' +
                        '    <div class="element-check__content">' + g[i][3] + '</div>\n' +
                        '\n' +
                        '    <div class="element-check__function-table-element function-table-element">\n' +

                        '        <button type="button" name="add" id="add_' + i + '" class="function-table-element__function-button add_leader">Добавить</button>\n' +
                        '        <button type="button" name="delete" id="del_' + i + '" class="function-table-element__function-button delete_leader">Удалить</button>\n' +
                        '        <button type="button" name="ban" id="ban_' + i + '" class="function-table-element__function-button ban_leader">Бан</button>\n' +
                        '    </div>\n' +
                        '</div>')
            }
            $('.add_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                console.log(id);
                let kok = $('#surname' + id).text();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).text();
                console.log(kok, kok1, kok2);
                $.ajax({
                    type: "GET",
                    url: '/leader/modal/add',
                    dataType: "json",
                    processData: true,
                    contentType: false,
                    data: {data: {kok, kok1, kok2}},
                    success: function (res) {
                        console.log(res);
                    }
                });
                $('#element_check_' + id).remove();
            });

            $('.delete_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                console.log(id);
                let kok = $('#surname' + id).text();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).text();
                console.log(kok, kok1, kok2);
                $.ajax({
                    type: "GET",
                    url: '/leader/modal/del',
                    dataType: "json",
                    processData: true,
                    contentType: false,
                    data: {data: {kok, kok1, kok2}},
                    success: function (res) {
                        console.log(res);
                    }
                });
                $('#element_check_' + id).remove();
            });

            $('.ban_leader').on('click', function (e) {
                let id = e.target.id.split('_')[1];
                console.log(id);
                let kok = $('#surname' + id).text();
                let kok1 = $('#date' + id).text();
                let kok2 = $('#subject' + id).text();
                console.log(kok, kok1, kok2);
                $.ajax({
                    type: "GET",
                    url: '/leader/modal/ban',
                    dataType: "json",
                    processData: true,
                    contentType: false,
                    data: {data: {kok, kok1, kok2}},
                    success: function (res) {
                        console.log(res);
                    }
                });
                $('#element_check_' + id).remove();
            });
        }
    });


});

$('.button-add-notice').click(() => {
    openModal('add-notice');
});
$('.button-add-event').click(() => {
    openModal('add-event');
});


$('.button-event-admin').click(() => {
    openModal('admin-event');
    let a = $('.content-table-list');
    a.empty();
    $.ajax({
        type: "GET",
        url: "/admin/eventModal",
        success: function (json) {
            let g = json['events'];
            console.log(g);
            for (let i in g) {
                console.log(g[i]['place']);
                if (g[i].length > 0)
                    a.append(
                        '<div class="content-table-list__table-element-check table-element-check" id="element_check_' + i + '">' +
                        '        <div class="element-check__info-check-element info-check-element">\n' +
                        '            <div class="info-check-element__date" id="text' + i + '">g[i]["text"]</div>\n' +
                        '            <div class="info-check-element__date-event" id="date' + i + '">g[i]["date"]</div>\n' +
                        '            <div class="info-check-element__event-location" id="place' + i + '">g[i]["place"]</div>\n' +
                        '        </div>' +
                        //'    <div class="element-check__content">номер 12-32 </div>' +

                        '    <div class="element-check__function-table-element function-table-element">\n' +
                        '        <button class="function-table-element__function-button" name="delete" id="del_' + i + '">Удалить</button>' +
                        '        <button class="function-table-element__function-button" name="ban" id="ban_' + i + '">Бан</button>' +
                        '   </div>' +
                        '</div>');
            }
            //     $('.delete_leader').on('click', function (e) {
            //         let id = e.target.id.split('_')[1];
            //         console.log(id);
            //         let kok = $('#surname' + id).text();
            //         let kok1 = $('#date' + id).text();
            //         let kok2 = $('#subject' + id).text();
            //         console.log(kok, kok1, kok2);
            //         $.ajax({
            //             type: "GET",
            //             url: '/leader/modal/del',
            //             dataType: "json",
            //             processData: true,
            //             contentType: false,
            //             data: {data: {kok, kok1, kok2}},
            //             success: function (res) {
            //                 console.log(res);
            //             }
            //         });
            //         $('#element_check_' + id).remove();
            //     });
            //
            //     $('.ban_leader').on('click', function (e) {
            //         let id = e.target.id.split('_')[1];
            //         console.log(id);
            //         let kok = $('#surname' + id).text();
            //         let kok1 = $('#date' + id).text();
            //         let kok2 = $('#subject' + id).text();
            //         console.log(kok, kok1, kok2);
            //         $.ajax({
            //             type: "GET",
            //             url: '/leader/modal/ban',
            //             dataType: "json",
            //             processData: true,
            //             contentType: false,
            //             data: {data: {kok, kok1, kok2}},
            //             success: function (res) {
            //                 console.log(res);
            //             }
            //         });
            //         $('#element_check_' + id).remove();
            //     });
        }
    });


});

$('.button-hometask-admin').click(() => {
    openModal('add-homework');
});


