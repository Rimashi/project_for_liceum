let gMouseDownX = 0;
let gMouseDownY = 0;
let gMouseDownOffsetX = 0;
let gMouseDownOffsetY = 0;

function scaleMap(n) {
    var s = $(".map-interactive__svg-map svg")
    if (n == 1) {
        s.width(s.width() + 200);
    } else {
        if (n == 2) {
            s.width(s.width() - 200);
        }
    }
}

function changeStage(n) {
    $(".map-interactive__svg-map").css("display", "none");
    $(".map-interactive__svg-map svg").width(500)
    $("#map-stage_" + n).css("display", "flex");
    $(".map-interactive-block__title").text("Этаж " + n)

}


function addListeners() {

    $(`.map-interactive__svg-map`).on('mousedown touchstart', mouseDown);

    $(window).on('mouseup touchend', mouseUp);


}

function mouseUp() {
    $(window).off('mousemove touchmove', divMove);

}

function mouseDown(e) {
    let clientX, clientY;
    if (e.type === 'mousedown') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.type === 'touchstart') {
        clientX = e.originalEvent.touches[0].clientX;
        clientY = e.originalEvent.touches[0].clientY;
    }
    window.onscroll = () => {
        window.scroll(0, 0)
    };
    gMouseDownX = clientX;
    gMouseDownY = clientY;

    var div = $(`.map-interactive__svg-map svg`);

    let leftAmount = parseInt(div.css('left'), 10) || 0;
    gMouseDownOffsetX = gMouseDownX - leftAmount;

    let topAmount = parseInt(div.css('top'), 10) || 0;
    gMouseDownOffsetY = gMouseDownY - topAmount;

    $(window).on('mousemove touchmove', divMove);

}

function divMove(e) {
    let clientX, clientY;
    if (e.type === 'mousemove') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.type === 'touchmove') {
        clientX = e.originalEvent.touches[0].clientX;
        clientY = e.originalEvent.touches[0].clientY;

    }

    var div = $(`.map-interactive__svg-map svg`);
    div.css({
        top: clientY - gMouseDownOffsetY,
        left: clientX - gMouseDownOffsetX
    });

}

addListeners();


document.addEventListener('mouseup', function (event) {
    // код, который будет выполнен при отпускании кнопки мыши
    window.onscroll = () => {
        window.scroll()
    };
});

document.addEventListener('touchend', function (event) {
    window.onscroll = () => {
        window.scroll()
    };
});

