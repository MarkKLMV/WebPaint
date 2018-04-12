module('WebPaintMain module');

asyncTest('WebPaintMain.prototype.addObjectToCanvas()', function () {
    WebPaintMain.functions.setupCanvas();
    WebPaintMain.functions.setupTools();

    setTimeout(function() {
        var condition = false;

        $('.tool-curve').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(WebPaintMain.Canvas.isDrawingMode, 'Canvas is on drawing mode');

        $('.tool-line').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(!WebPaintMain.Canvas.isDrawingMode, 'Canvas is not on drawing mode');
        condition = WebPaintMain.Canvas.getObjects().length > 0 &&
            WebPaintMain.Canvas.getObjects()[WebPaintMain.Canvas.getObjects().length - 1].type === 'line';
        ok(condition, 'Line was added to canvas');

        $('.tool-arrow').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(!WebPaintMain.Canvas.isDrawingMode, 'Canvas is not on drawing mode');
        ok(WebPaintMain.Fabric.ArrowTool, 'Arrow tool is initialized');
        condition = WebPaintMain.Canvas.getObjects().length > 0 &&
            WebPaintMain.Canvas.getObjects()[WebPaintMain.Canvas.getObjects().length - 1].type === 'polygon';
        ok(condition, 'Arrow was added to canvas');

        $('.tool-circle').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(!WebPaintMain.Canvas.isDrawingMode, 'Canvas is not on drawing mode');
        condition = WebPaintMain.Canvas.getObjects().length > 0 &&
            WebPaintMain.Canvas.getObjects()[WebPaintMain.Canvas.getObjects().length - 1].type === 'circle';
        ok(condition, 'Circle was added to canvas');

        $('.tool-square').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(!WebPaintMain.Canvas.isDrawingMode, 'Canvas is not on drawing mode');
        condition = WebPaintMain.Canvas.getObjects().length > 0 &&
            WebPaintMain.Canvas.getObjects()[WebPaintMain.Canvas.getObjects().length - 1].type === 'rect';
        ok(condition, 'Rect was added to canvas');

        $('.tool-text').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(!WebPaintMain.Canvas.isDrawingMode, 'Canvas is not on drawing mode');
        condition = WebPaintMain.Canvas.getObjects().length > 0 &&
            WebPaintMain.Canvas.getObjects()[WebPaintMain.Canvas.getObjects().length - 1].type.indexOf('text') > -1;
        ok(condition, 'Textbox was added to canvas');

        $('.tool-eraser').trigger('click');
        WebPaintMain.prototype.addObjectToCanvas();
        ok(WebPaintMain.Canvas.isDrawingMode, 'Canvas is on drawing mode');
        ok(WebPaintMain.Tools.IsEraser, 'Eraser tool was selected');

        start();
    }, 1000);
});

test('WebPaintMain.prototype.resizeCanvas()', function() {
    WebPaintMain.functions.setupCanvas();

    var width = 1200;
    WebPaintMain.prototype.resizeCanvas(width);

    ok(WebPaintMain.Canvas.getWidth() === 900, 'Width is ' + width + '. Canvas width should be ' + 900);
    ok(WebPaintMain.Canvas.getHeight() === 500, 'Width is ' + width + '. Canvas height should be ' + 500);

    width = 1024;
    WebPaintMain.prototype.resizeCanvas(width);

    ok(WebPaintMain.Canvas.getWidth() === 800, 'Width is ' + width + '. Canvas width should be ' + 800);
    ok(WebPaintMain.Canvas.getHeight() === 500, 'Width is ' + width + '. Canvas height should be ' + 500);

    width = 968;
    WebPaintMain.prototype.resizeCanvas(width);

    ok(WebPaintMain.Canvas.getWidth() === 700, 'Width is ' + width + '. Canvas width should be ' + 700);
    ok(WebPaintMain.Canvas.getHeight() === 400, 'Width is ' + width + '. Canvas height should be ' + 400);

    width = 712;
    WebPaintMain.prototype.resizeCanvas(width);

    ok(WebPaintMain.Canvas.getWidth() === 300, 'Width is ' + width + '. Canvas width should be ' + 300);
    ok(WebPaintMain.Canvas.getHeight() === 300, 'Width is ' + width + '. Canvas height should be ' + 300);
});