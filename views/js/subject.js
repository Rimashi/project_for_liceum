let subjects;
let hometasks;
let teachers;
$(document).ready(() => {
    let buf = "";
    let container = $(".subjects-block");
    $.ajax({
        url: '/subject/get',
        type: 'GET',
        success: function (res) {
            subjects = res.subjects;
            hometasks = res.hometasks;
            teachers = res.teachers;
            for (let key in subjects) {
                let is = 'нет';
                let hometask = res.hometasks[subjects[key]];
                if (hometask.length > 0)
                    for (let i in hometask) {
                        if (hometask[i]['text'].length) {
                            is = 'есть';
                            break;
                        }
                    }
                buf = "";
                buf += '<div class="subjects-block__subject-school subject-school" onclick="openModalSubject(`' + subjects[key] + '`)">';
                buf += '    <h3 class="subject-school__title">' + ucfirst(subjects[key]) + '</h3>';
                buf += '<div class="subject-school__homework-checked">ДЗ - ' + is + '</div>    </div>';
                container.append(buf);
            }
            const cards = [...document.querySelectorAll(".subject-school")];

            cards.forEach(el => {
                el.addEventListener("mousemove", fCardRotate);
                el.addEventListener("mouseout", fCardDefault);
            });

            function fCardRotate(ev) {
                this.style.transform = `perspective(2000px) rotatey(${(ev.offsetX - this.offsetWidth / 2) / 6}deg) rotatex(${((ev.offsetY - this.offsetHeight / 2) / 6) * -1}deg)`;
            }

            function fCardDefault() {
                this.style.transform = ``;
            }
        }
    });
});


function openModalSubject(subject) {
    let is = 'нет';
    let teacher = 'не указан';
    let classroom = 'не указан';
    if (hometasks[subject.toLowerCase()]) {
        for (let i in hometasks[subject.toLowerCase()]) {
            if (hometasks[subject.toLowerCase()][i]['text'].length) {
                is = 'есть';
                break;
            }
        }
    }
    if (teachers[subject.toLowerCase()] && teachers[subject.toLowerCase()].name) {
        teacher = teachers[subject.toLowerCase()].name;
        classroom = teachers[subject.toLowerCase()].classroom;
    }
    let div =
        `<dialog class="modal-subject  _dialog">
        <div class="modal-subject__content-close content-close"></div>
        <h3 class="modal-subject__title-modal-subject _title-modal">${ucfirst(subject)}</h3>
        <div class="modal-subject__content-subject content-subject">
            <div class="content-subject__left-content-subject left-content-subject">
                <div class="left-content-subject__teacher-inforamtion teacher-inforamtion">
                    <div class="teacher-inforamtion__name">Учитель: ${teacher}</div>
                    <div class="teacher-inforamtion__cabinet">Кабинет: ${classroom}</div>
                </div>
                <p class="left-content-subject__homework">Домашнее задание - ${is}</p>
           </div>`
    if (is === 'есть') {
        div += `<div class="content-subject__right-content-subject right-content-subject">
                        <h4 class="right-content-subject__title">Домашнее задание</h4>
                        <div class="hometask-for-days__list-hometask-for-days list-hometask-for-days">`
        for (let key in hometasks[subject]) {
            div += `            <div class="list-hometask-for-days__hometask-for-day hometask-for-day">
                                <div class="hometask-for-day__date">${hometasks[subject][key].date.split(".")[0] + "." + hometasks[subject][key].date.split(".")[1]}</div>
                                <div class="hometask-for-day__task">${hometasks[subject][key].text}</div>`
            let fileSt = '';
            let files = hometasks[subject][key].file;
            console.log(files);
            for (let i in files) {
                if ((Number(i) + 1) === files.length) {
                    fileSt += files[i];
                } else {
                    fileSt += hometasks[subject][key].file[i] + ":";
                }
            }
            if (fileSt.length > 0) {
                div += `<button id="download" value="${fileSt}" class="hometask-for-day__download"></button>`
            }
            div += "</div>";
        }
        div += "</div></div>";
    } else {
    }
    `</div>
  </dialog> `;

    $(div).prependTo(".wrapper");

    const dialog = document.querySelector('.modal-subject');
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

    //загрузка файлов
    $('.hometask-for-day__download').click(function () {
        let links = $(this).val().split(":");
        for (let i in links) {
            let url = "/download/" + encodeURIComponent(links[i]);
            forceDownload(url, links[i]);
        }
    });
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

function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}