$(document).on('change', '#person_rating', function (e) {
    let val = $('#person_rating').val();
    $.ajax({
        type: 'POST',
        url: "rating/change",
        data: {val: val},
        success: function (res) {
            //console.log(res);
            let rate = $('#rating');
            rate.empty();
            for (let i = 0; i < res['rating'].length; i++) {
                rate.append(
                    '<tr class="table__line line">\n' +
                    '   <td class="line__column-1">\n' +
                    '      ' + (i + 1) + "." + '' +
                    '   </td>\n' +
                    '   <td class="line__column-2">\n' +
                    '      ' + res['rating'][i][1] + " " + res['rating'][i][0] + '' +
                    '   </td>\n' +
                    '   <td class="line__column-3">\n' +
                    '      ' + res['rating'][i][2] + '' +
                    '   </td>\n' +
                    '   <td class="line__column-4">' + res['rating'][i][3] + '</td>\n' +
                    '</tr>'
                )
            }
            rate.append(
                '<tr class="table__line line">\n' +
                '   <td class="line__column-separation"><span class="separation-line"></span></td>\n' +
                '</tr>'
            );
            rate.append(
                '<tr class="table__line line">\n' +
                '   <td class="line__column-1">\n' +
                '      ' + res['userRating'][0] + "." + '' +
                '   </td>\n' +
                '   <td class="line__column-2">Ты</td>\n' +
                '   <td class="line__column-3">\n' +
                '      ' + res['userRating'][1].split("_")[0] + res['userRating'][1].split("_")[1] + '' +
                '   </td>\n' +
                '   <td class="line__column-4">\n' +
                '      ' + res['userRating'][2] + '' +
                '   </td>\n' +
                '</tr>'
            )
        }
    })
});


$(document).on('change', '#classes', function (e) {
    let val = $('#classes').val();
    $.ajax({
        type: 'POST',
        url: "rating/change/class",
        data: {class_: val},
        success: function (res) {
            let classes_rate = $('#classes');
            classes_rate.empty();
            for (let i in res['data'][1]) {
                classes_rate.append(
                    '<option value="' + res['data'][1][i] + '">' + res['data'][1][i] + '</option>'
                );
            }
            let classes = $('#class_rate');
            classes.empty();
            for (let i = 0; i < res['data'][0].length; i++) {
                classes.append(
                    '<tr class="table__line line">\n' +
                    '   <td class="line__column-1">' + (i + 1) + '.</td>\n' +
                    '   <td class="line__column-2">' + res['data'][0][i][0].split("_")[0] + res['data'][0][i][0].split("_")[1] + '</td>\n' +
                    '   <td class="line__column-4">' + res['data'][0][i][1] + '</td>\n' +
                    '</tr>'
                );
            }
        }
    })
});