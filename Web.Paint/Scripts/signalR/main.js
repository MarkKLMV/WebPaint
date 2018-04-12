var WebPaintHub = WebPaintHub ||
{
    Hub: null,
    HubLoaded: false,
    StorageItems: {
        CanvasDump: 'CanvasDump',
        Thickness: 'Thickness',
        Color: 'Color',
        Directory: 'Directory'
    },
    functions: {
        handleExit: function () {
            WebPaintHub.HubLoaded = false;
            if (WebPaintHub.Hub.server.onClientDisconnected) {
                WebPaintHub.Hub.server.onClientDisconnected(true);
            }
        },
        isCanvasDumpExist: function() {
            return WebPaintHub.utils.getItemFromSessionStorage(WebPaintHub.StorageItems.CanvasDump) != null;
        },
        saveOrUpdateCanvasDump: function () {
            if (WebPaintMain.Canvas.getObjects().length > 0) {
                var dump = JSON.stringify(WebPaintMain.Canvas.toJSON(WebPaintMain.Fabric.ObjectPropertiesJson));
                WebPaintHub.utils.addItemToSessionStorage(WebPaintHub.StorageItems.CanvasDump, dump);
                WebPaintHub.utils.addItemToSessionStorage(WebPaintHub.StorageItems.Directory, WebPaintMain.Directory);
                // save thickness and color values along with canvas
                WebPaintHub.utils.addItemToSessionStorage(WebPaintHub.StorageItems.Thickness, WebPaintMain.Fabric.Thick);
                WebPaintHub.utils.addItemToSessionStorage(WebPaintHub.StorageItems.Color, WebPaintMain.Fabric.Color);
            }
        }
    },
    utils: {
        addItemToSessionStorage: function(key, value) {
            sessionStorage.setItem(key, value);
        },
        getItemFromSessionStorage: function(key) {
            return sessionStorage.getItem(key);
        },
        removeItemFromSessionStorage: function(key) {
            sessionStorage.removeItem(key);
        },
        getCookie: function(name) {
            var matches = document.cookie.match(new RegExp(
              "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        },
        setCookie: function (name, value, options) {
            options = options || {};

            var expires = options.expires;

            if (typeof expires == "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires * 1000 * 60 * 60);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            document.cookie = updatedCookie;
        },
        deleteCookie: function (name) {
            WebPaintHub.utils.setCookie(name, "", {
                expires: -1
            });
        }
    }
}

$(document).ready(function () {
    if (WebPaintHub.functions.isCanvasDumpExist()) {
        if (confirm('It seems you have worked with canvas, but have lost changes. Do you want to restore them?')) {
            WebPaintMain.functions.updateCanvas(WebPaintHub.utils.getItemFromSessionStorage(WebPaintHub.StorageItems.CanvasDump));
            WebPaintMain.functions.updateDirectory(WebPaintHub.utils.getItemFromSessionStorage(WebPaintHub.StorageItems.Directory));
            // restore slider thickness value
            WebPaintMain.Tools.Thick.wrapper.data().slider.setValue(parseInt(WebPaintHub.utils.getItemFromSessionStorage(WebPaintHub.StorageItems.Thickness)));
            WebPaintMain.Tools.Thick.wrapper.trigger('slideStop');
            // restore colorpicker color
            WebPaintMain.Tools.Color.wrapper.data().colorpicker.setValue(WebPaintHub.utils.getItemFromSessionStorage(WebPaintHub.StorageItems.Color));
            WebPaintMain.Tools.Color.wrapper.trigger('hidePicker');
        } else {
            WebPaintHub.utils.removeItemFromSessionStorage(WebPaintHub.StorageItems.CanvasDump);
        }
    }

    WebPaintHub.Hub = $.connection.webPaintHub;

    WebPaintHub.Hub.client.onClientConnected = function (dir) {
        var message = dir !== "0"
            ? '. He\'s editing canvas \'' + dir
            : '';
        WebPaintNotice.showLightInfo('WebPaint Info', 'New client connected' + message);
    }

    WebPaintHub.Hub.client.onClientDisconnected = function (stopCalled) {
        if (stopCalled) {
            WebPaintNotice.showLightInfo('WebPaint Info', 'One client disconnected');
        } else {
            WebPaintNotice.showWarning('WebPaint Warning', 'One client forcibly disconnected by timeout');
        }
    }

    WebPaintHub.Hub.client.updateCanvas = function (canvasJson) {
        WebPaintMain.functions.updateCanvas(canvasJson);
    }

    WebPaintHub.Hub.client.addObjectToCanvas = function (obj) {
        WebPaintMain.functions.addObjectToCanvas(obj);
    }

    WebPaintHub.Hub.client.updateObjectOnCanvas = function (obj) {
        WebPaintMain.functions.updateObjectOnCanvas(obj);
    }
    WebPaintHub.Hub.client.onNewCanvasAdded = function (dir) {
        WebPaintNotice.showLightInfo('WebPaint Info', 'New canvas \'' + dir + '\' added. Check \'Canvases available\' dropdown');
        WebPaintMain.functions.addNewCanvas(dir);
    }
    WebPaintHub.Hub.client.onCanvasSaved = function (dir) {
        WebPaintNotice.showLightInfo('WebPaint Info', 'Canvas \'' + dir + '\' was saved because some client switched to another one');
    }
    WebPaintHub.Hub.client.onDirectoryChanged = function (oldDir, newDir) {
        WebPaintNotice.showLightInfo('WebPaint Info', 'Some client switched canvas from \'' + oldDir + '\' to \'' + newDir + '\'');
    }

    $(window).on('beforeunload', function(evt) { // can be triggered on page close/refresh
        var confirmExit = 'Please note, you can lose changes if you close/refresh the page. Continue?';
        evt = evt || window.event;
        // IE + Firefox
        if (evt) {
            evt.returnValue = confirmExit;
        }

        return confirmExit; // Safari
    });
    $(window).on('unload', function () {
        WebPaintHub.functions.saveOrUpdateCanvasDump();
        WebPaintHub.functions.handleExit();
    });

    $.connection.hub.start().done(function () {
        console.log('[client hub started]');
        WebPaintHub.HubLoaded = true;
        WebPaintHub.Hub.server.onClientConnected(WebPaintMain.Directory);
    });
});