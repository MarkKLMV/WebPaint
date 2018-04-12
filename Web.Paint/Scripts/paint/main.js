var defaultColor = '#000000';
var defaultFontSize = 18;
var defaultLineWidth = 0;
var classPrefix = '.';

var WebPaintMain = WebPaintMain ||
{
    Canvas: null,
    Directory: "0",
    Tools: {
        Thick: {
            wrapper: null,
            range: [1, 50],
            step: 1
        },
        Color: {
            wrapper: null,
            value: defaultColor
        },
        Tool: null,
        IsEraser: false
    },
    Fabric: {
        Thick: 1,
        Color: defaultColor,
        Tool: '',
        ArrowTool: null,
        Objects: [],
        ObjectPropertiesJson: ['id', 'selectable', 'hasRotatingPoint', '_controlsVisibility', 'transparentCorners']
    },
    Selectors: {
        Thick: '.thick-slider',
        Color: '.paint-fill-color',
        Color2x: 'colorpicker-2x',
        Tools: '.paint-tools a',
        SelectedTool: 'tool-selected',
        Canvas: 'main-canvas',
        FolderList: '.canvases-list',
        FolderListDropdown: '.canvases-select'
    },
    Templates: {
        NewCanvasDirTemplate: '<option value="" selected hidden>Select canvas</option><option value="0">add</option>'
    },
    functions: {
        setupSlider: function() {
            WebPaintMain.Tools.Thick.wrapper = $(WebPaintMain.Selectors.Thick).slider({
                //tooltip_position: 'bottom',
                min: WebPaintMain.Tools.Thick.range[0],
                max: WebPaintMain.Tools.Thick.range[1],
                step: WebPaintMain.Tools.Thick.step,
                value: 1
            });
            WebPaintMain.Tools.Thick.wrapper.on('slideStop', function() {
                var curValue = parseInt(this.value) || 1;

                if (WebPaintMain.Fabric.Thick !== curValue) { // don't handle the same value on slider click
                    WebPaintMain.Fabric.Thick = curValue;
                    WebPaintMain.prototype.setObjectThickness();
                    WebPaintMain.prototype.setBrushThickness();
                }
            });
        },
        setupColorPicker: function() {
            WebPaintMain.Tools.Color.wrapper = $(WebPaintMain.Selectors.Color).colorpicker({
                format: 'hex',
                align: 'left',
                customClass: WebPaintMain.Selectors.Color2x,
                sliders: {
                    saturation: {
                        maxLeft: 200,
                        maxTop: 200
                    },
                    hue: {
                        maxTop: 200
                    },
                    alpha: {
                        maxTop: 200
                    }
                }
            });
            WebPaintMain.Tools.Color.wrapper.colorpicker('setValue', WebPaintMain.Tools.Color.value);
            WebPaintMain.Tools.Color.wrapper.on('hidePicker', function () {
                var curColor = $(this).data('colorpicker').color.toHex();
                WebPaintMain.Fabric.Color = curColor;
                WebPaintMain.prototype.setObjectColor();
                WebPaintMain.prototype.setBrushColor();
            });
        },
        setupCanvas: function () {
            WebPaintMain.Canvas = new fabric.Canvas(WebPaintMain.Selectors.Canvas);
            WebPaintMain.prototype.resizeCanvas($(window).width());

            WebPaintMain.Canvas.on('mouse:up', function() {
                if (WebPaintMain.Canvas.isDrawingMode) {
                    $(WebPaintMain.Canvas._objects).filter(function() {
                        return this.type === 'path' && this.selectable;
                    }).each(function() {
                        this.selectable = false;
                    });
                    WebPaintMain.Canvas.renderAll();

                    var object = WebPaintMain.Canvas._objects[WebPaintMain.Canvas._objects.length - 1]; // assume the last object is currently drawn free line or eraser
                    object.id = WebPaintMain.utils.uuidv4();
                    WebPaintMain.functions.triggerAddObjectToCanvas(object); // trigger update canvas on other clients
                }
            });
        },
        setupTools: function () {
            WebPaintMain.prototype.selectTool($(WebPaintMain.Selectors.Tools).first());
            WebPaintMain.prototype.addObjectToCanvas();
            
            $(WebPaintMain.Selectors.Tools).each(function() {
                var that = $(this);

                $(this).on('click', function () {
                    //if (!$(this).hasClass(WebPaintMain.Selectors.SelectedTool)) {
                        WebPaintMain.prototype.selectTool($(this));
                        WebPaintMain.prototype.addObjectToCanvas();
                        WebPaintMain.prototype.deselectOtherTools($(this));
                    //}
                });
            });

            fabric.loadSVGFromURL('/Content/icons/right_arrow_forward_sign_256.svg', function(results) {
                WebPaintMain.Fabric.ArrowTool = results != null
                    ? results[0]
                    : null;
            });
        },
        triggerUpdateCanvas: function() {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.updateCanvas(JSON.stringify(WebPaintMain.Canvas.toJSON(WebPaintMain.Fabric.ObjectPropertiesJson)), WebPaintMain.Directory);
            }
        },
        triggerAddObjectToCanvas: function(obj) {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.addObjectToCanvas(JSON.stringify(obj.toJSON(WebPaintMain.Fabric.ObjectPropertiesJson)), WebPaintMain.Directory);
            }
        },
        triggerUpdateObjectOnCanvas: function (obj) {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.updateObjectOnCanvas(JSON.stringify(obj.toJSON(WebPaintMain.Fabric.ObjectPropertiesJson)), WebPaintMain.Directory);
            }
        },
        triggerAddNewCanvas: function (dir) {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.onNewCanvasAdded(dir);
            }
        },
        triggerNotifyClientsAboutDirectoryUpdate: function(dir) {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.onDirectoryChanged(dir);
            }
        },
        triggerNotifyClientsAboutSavedCanvas: function(dir) {
            if (WebPaintHub.HubLoaded) {
                WebPaintHub.Hub.server.onCanvasSaved(dir);
            }
        },
        updateCanvas: function(canvasJson) {
            WebPaintMain.Canvas.loadFromJSON(canvasJson, function () {
                WebPaintMain.Canvas.renderAll();
            });
        },
        addObjectToCanvas: function (obj) {
            var object = WebPaintMain.prototype.createObjectFromJson(JSON.parse(obj));
            WebPaintMain.Canvas.add(object);
        },
        updateObjectOnCanvas: function (obj) {
            var objJson = JSON.parse(obj);
            var object = WebPaintMain.prototype.createObjectFromJson(objJson);
            var oldObject = $(WebPaintMain.Canvas._objects).filter(function () { return this.id === objJson.id });

            if (oldObject.length > 0) {
                var index = WebPaintMain.Canvas._objects.indexOf(oldObject[0]);
                WebPaintMain.Canvas._objects.splice(index, 1);
                WebPaintMain.Canvas.add(object);
            }
        },
        updateDirectory: function(dir) {
            WebPaintMain.Directory = dir;
        },
        addNewCanvas: function (dir) {
            $(WebPaintMain.Selectors.FolderList).append(dir);
        }
    },
    apiFunctions: {
        setCanvasFolders: function() {
            WebPaintMain.utils.sendAjaxRequest('GET', 'list', null, function (list) {
                var enrichedList = list;
                enrichedList.unshift(WebPaintMain.Templates.NewCanvasDirTemplate);
                $(WebPaintMain.Selectors.FolderList).append(enrichedList);
                WebPaintMain.utils.bindChangeEvent($(WebPaintMain.Selectors.FolderList));
                if (WebPaintMain.Directory !== '0') {
                    $(WebPaintMain.Selectors.FolderList).val(WebPaintMain.Directory);
                }
            });
        },
        handleCanvasFolderUpdate: function (value) {
            if (value === '0') {
                WebPaintMain.utils.sendAjaxRequest('POST', 'new', null, function (dir) {
                    WebPaintMain.functions.addNewCanvas(dir);
                    WebPaintMain.functions.triggerAddNewCanvas(dir);
                });
            } else if (WebPaintMain.Directory !== '0') {
                WebPaintMain.functions.triggerNotifyClientsAboutDirectoryUpdate(value);
                WebPaintMain.utils.sendAjaxRequest('POST',
                    'add/' + WebPaintMain.Directory,
                    JSON.stringify(WebPaintMain.Canvas.toJSON(WebPaintMain.Fabric.ObjectPropertiesJson)),
                    function() {
                        WebPaintMain.functions.triggerNotifyClientsAboutSavedCanvas(WebPaintMain.Directory);
                        WebPaintMain.Directory = value;
                        WebPaintMain.utils.sendAjaxRequest('GET',
                            'last/' + WebPaintMain.Directory, null,
                            function(canvasJson) {
                                WebPaintMain.Canvas.clear();
                                if (canvasJson.length > 0) {
                                    WebPaintMain.Canvas.loadFromJSON(canvasJson,
                                        function() {
                                            WebPaintMain.Canvas.renderAll();
                                        });
                                }
                            });
                    });
            } else {
                WebPaintMain.functions.triggerNotifyClientsAboutDirectoryUpdate(value);
                WebPaintMain.Directory = value;
                WebPaintMain.utils.sendAjaxRequest('GET',
                    'last/' + WebPaintMain.Directory, null,
                    function (canvasJson) {
                        WebPaintMain.Canvas.clear();
                        if (canvasJson.length > 0) {
                            WebPaintMain.Canvas.loadFromJSON(canvasJson,
                                function () {
                                    WebPaintMain.Canvas.renderAll();
                                });
                        }
                    });
            }
        }
    },
    prototype: {
        resizeCanvas: function(width) {
            var screenRes = width >= 1200
                ? [900, 500]
                : width > 979 && width < 1200
                    ? [800, 500]
                    : width > 767 && width <= 979
                        ? [700, 400]
                        : [300, 300];

            if (WebPaintMain.Canvas) {
                WebPaintMain.Canvas.setWidth(screenRes[0]);
                WebPaintMain.Canvas.setHeight(screenRes[1]);
            }
        },
        selectTool: function (toolSelector) {
            WebPaintMain.Fabric.Tool = classPrefix + $(toolSelector).attr('class');
            $(toolSelector).addClass(WebPaintMain.Selectors.SelectedTool);        
        },
        deselectOtherTools: function(selected) {
            $(WebPaintMain.Selectors.Tools).not($(selected)).each(function () {
                $(this).removeClass(WebPaintMain.Selectors.SelectedTool);
            });
        },
        addObjectToCanvas: function() {
            var object = null;
            WebPaintMain.Canvas.isDrawingMode = false;

            if (WebPaintMain.Fabric.Tool.indexOf('.tool-curve') > -1) {
                WebPaintMain.prototype.setFreeLine(false);
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-line') > -1) {
                object = new fabric.Line([100, 100, 150, 150],
                {
                    left: 100,
                    top: 100
                });
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-arrow') > -1) {
                if (WebPaintMain.Fabric.ArrowTool) {
                    object = WebPaintMain.Fabric.ArrowTool.clone();
                    object.left = 100;
                    object.top = 100;
                    object.scale(4);
                }
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-circle') > -1) {
                object = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    originX: 'center',
                    originY: 'center'
                });
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-square') > -1) {
                object = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100
                });
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-text') > -1) {
                object = new fabric.Textbox("input text...",
                    {
                        left: 100,
                        top: 100,
                        width: 100
                    });
            } else if (WebPaintMain.Fabric.Tool.indexOf('.tool-eraser') > -1) {
                WebPaintMain.prototype.setFreeLine(true);
            }

            if (object) {
                WebPaintMain.prototype.setObjectDefaultProps(object);
                var id = WebPaintMain.utils.uuidv4();
                object.id = id;
                WebPaintMain.Fabric.Objects.push({ id: id, value: object });
                WebPaintMain.Canvas.add(object);
                WebPaintMain.functions.triggerAddObjectToCanvas(object); // trigger update canvas on other clients

                object.on('modified', function () {
                    WebPaintMain.functions.triggerUpdateObjectOnCanvas(this); // trigger update canvas on other clients
                });
                object.on('deselected', function() { // disable object interactivity
                    this.selectable = false;
                });
            }
            
        },
        setFreeLine: function(isEraser) {
            WebPaintMain.Canvas.isDrawingMode = true;
            WebPaintMain.Tools.IsEraser = isEraser;
            WebPaintMain.Tools.Tool = WebPaintMain.Canvas.freeDrawingBrush;

            WebPaintMain.prototype.setBrushColor();
            WebPaintMain.prototype.setBrushThickness();
        },
        setBrushColor: function() {
            if (WebPaintMain.Tools.Tool) {
                WebPaintMain.Tools.Tool.color = !WebPaintMain.Tools.IsEraser
                ? WebPaintMain.Fabric.Color
                : '#FFFFFF';
            }
        },
        setBrushThickness: function() {
            if (WebPaintMain.Tools.Tool) {
                WebPaintMain.Tools.Tool.width = defaultLineWidth + WebPaintMain.Fabric.Thick;
            }
        },
        setObjectColor: function() {
            var object = WebPaintMain.Canvas.getActiveObject();

            if (object) {
                object.setColor(WebPaintMain.Fabric.Color);
                if ($.inArray(object.type, ['line', 'polygon']) > -1) {
                    object.stroke = WebPaintMain.Fabric.Color;
                }
                WebPaintMain.Canvas.renderAll();
                WebPaintMain.functions.triggerUpdateObjectOnCanvas(object); // trigger update canvas on other clients
            }
        },
        setObjectThickness: function () {
            var object = WebPaintMain.Canvas.getActiveObject();

            if (object) {
                WebPaintMain.utils.setObjectThicknessByType(object);
                WebPaintMain.Canvas.renderAll();
                WebPaintMain.functions.triggerUpdateObjectOnCanvas(object); // trigger update canvas on other clients
            }
        },
        setObjectDefaultProps: function (object) {
            if ($.inArray(object.type, ['line', 'polygon']) === -1) {
                object.hasRotatingPoint = false;
            }
            if (object.type.indexOf('text') > -1) {
                object.fontSize = defaultFontSize;
            } else {
                object.stroke = WebPaintMain.Fabric.Color;
            }
            if (object.type === 'circle') {
                object.setControlsVisibility({
                    'ml': false,
                    'mr': false,
                    'mt': false,
                    'mb': false
                });
            }

            object.transparentCorners = false;
            object.setColor(WebPaintMain.Fabric.Color);
            WebPaintMain.utils.setObjectThicknessByType(object);
        },
        createObjectFromJson: function(obj) {
            var object = null;

            if (obj.type === 'line') {
                object = new fabric.Line([obj.x1, obj.y1, obj.x2, obj.y2], obj);
            } else if (obj.type === 'rect') {
                object = new fabric.Rect(obj);
            } else if (obj.type === 'circle') {
                object = new fabric.Circle(obj);
            } else if (obj.type === 'textbox') {
                object = new fabric.Textbox(obj.text, obj);
            } else if (obj.type === 'text') {
                object = new fabric.Text(obj.text, obj);
            } else if (obj.type === 'path') {
                object = new fabric.Path(obj.path, obj);
            } else if (obj.type === 'polygon') {
                object = new fabric.Polygon(obj.path, obj);
            }

            if (object) {
                object.selectable = false;
            }

            return object;
        }
    },
    utils: {
        uuidv4: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        setObjectThicknessByType: function (object) {
            if ($.inArray(object.type, ['line']) > -1) {
                object.setColor(WebPaintMain.Fabric.Color);
                object.strokeWidth = defaultLineWidth + WebPaintMain.Fabric.Thick;
                object.stroke = WebPaintMain.Fabric.Color;
            }
        },
        sendAjaxRequest: function (httpMethod, url, data, callback) {
            $.ajax("/api/canvas" + (url ? "/" + url : ""), {
                type: httpMethod,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: callback
            });
        },
        bindChangeEvent: function(selector) {
            $(selector).off('change').on('change', function () {
                WebPaintMain.apiFunctions.handleCanvasFolderUpdate($(this).val());
            });
        }
    }
}

$(document).ready(function () {
    WebPaintMain.functions.setupSlider();
    WebPaintMain.functions.setupColorPicker();
    WebPaintMain.functions.setupCanvas();
    WebPaintMain.functions.setupTools();
    WebPaintMain.apiFunctions.setCanvasFolders();
});

$(window).on('resize', function() {
    WebPaintMain.prototype.resizeCanvas($(window).width());
});