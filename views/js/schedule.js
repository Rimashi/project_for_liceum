const c = ['Понедельник', "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const f = ['monday', "tuesday", "wednesday", "thursday", "friday", "saturday"];
const a = $('.schedule-tables');
const b = $('.select-schedule');

function ucfirst(str) {
    const regex = /\/+/i;
    if (regex.test(str)) {
        let sub1 = str.split("/")[0].charAt(0).toUpperCase() + str.split("/")[0].slice(1);
        let sub2 = str.split("/")[1].charAt(0).toUpperCase() + str.split("/")[1].slice(1);
        return sub1 + "/" + sub2;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function load_schedule(stud_class, json) {
    json = json.filter(function (n) {
        if (n.class === stud_class) {
            return n;
        }
    })[0];


    for (let s in c) {
        let subject_today = json[f[s]].split(' ')
        a.append('<div class="schedule-tables__schedule-table schedule-table"><h3 class="schedule-table__title">' + c[s] + '</h3> <table class="schedule-table__table table"><tbody id="' + (s + "-table") + '">');
        let k = $('#' + s + "-table");
        for (let g in subject_today) {
            k.append('<tr class="table__line line"><td class="line__column-1">' + (Number(g) + 1) + '.' + '</td><td class="line__column-2">' + ucfirst(subject_today[g].slice(2).replaceAll('_', ' ')) + '</td></tr>')
        }
    }
    b.append('</div>');
}

let json1;

$(document).ready(() => {
    $.ajax({
        type: "GET",
        url: "/schedule/get",
        success: function (json) {
            for (g in json) {
                b.append('<option value=' + json[g].class + '>' + json[g].class.replaceAll('_', ' ') + '</option>');
            }
            load_schedule(json[0].class, json)
            json1 = json;
        }
    });
});

b.on('change', function (e) {
    a.empty();
    load_schedule(e.target.value, json1)
});
