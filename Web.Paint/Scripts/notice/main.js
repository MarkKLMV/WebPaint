var WebPaintNotice = (function() {
    var type = {
        error: 'gritter-error',
        success: 'gritter-success',
        lightInfo: 'gritter-light gritter-info',
        warning: 'gritter-warning'
    },
    show = function(title, text, type) {
        $.gritter.add({
            title: title,
            text: text,
            class_name: type,
            time: 1500 // 1s to show
        });
    }

    return {
        showError: function(title, text) {
            show(title, text, type.error);
        },
        showSuccess: function (title, text) {
            show(title, text, type.success);
        },
        showLightInfo: function (title, text) {
            show(title, text, type.lightInfo);
        },
        showWarning: function (title, text) {
            show(title, text, type.warning);
        }
    }
})()