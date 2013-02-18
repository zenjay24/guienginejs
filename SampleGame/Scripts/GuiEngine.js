var GuiEngine = function ($) {

    var _frameCount = 0,

    _debugger = false,

    _debuggerDiv,

    _geTypes = {
        "GEOBJECT":"GEOBJECT",
        "STRING": "STRING",
        "IMAGE": "IMAGE"
    },

    _canvasTypes = {
        "THREED": "webgl",
        "TWOD": "2d"
    },

    _canvas,

    _interval,

    _backgroundColors = {},

    _uiEvents = new Array(),

    _objectsToRender = new Array(),

    _canvasContext = [],

    Start = function () {
        // initialize data-gengine elements
        _initCanvas();

        //Call loop by Interval
        _interval = setInterval(Loop, 1000 / 30);
        return this;
    },

    SetDebugger = function (value) {
        _debuggerDiv = $("#" + value);
    },

    Debug = function (value) {
        _debugger = value;
    },

    _initCanvas = function () {
        _canvas = $('canvas[data-gengine]');

        _canvas.each(_bindUIEvents);

        _canvas.each(_setDefaultCanvasContext);
    },

    _setDefaultCanvasContext = function () {
        _canvasContext[this.id] = _canvasTypes.TWOD;
    },

    _bindUIEvents = function (idx, element) {
        var gameData = $.parseJSON($(this).attr('data-gengine'));

        $(gameData.handleEvents).each(
            function () {
                if (this == "mouse") {
                    _canvas.bind('click', EventHandler);
                };
            }
        );
    },

    _outputDebug = function () {
        if (_debuggerDiv == null) return;

        var debugstr = "FrameCount: " + _frameCount;

        _debuggerDiv.html(debugstr);
    },

    FrameCount = function () {
        return _frameCount;
    },

    Loop = function () {

        if (_debugger) {
            _outputDebug();
        };

        // Handle User UI Events
        HandleUserUIEvents();

        // Handle Interaction Rules
        HandleInteractionRules();

        // Handle Game Physics
        handleGamePhysics();

        // Draw
        draw();

        _frameCount++;
    },

    HandleUserUIEvents = function () {
    },

    HandleInteractionRules = function () {
    },

    handleGamePhysics = function () {
        
        _canvas.each(function (canvasIndex, canvas) {
            var thisCanvas = this;

            $(_objectsToRender).each(function (objectIndex, objectToRender) {
                if (this.getCanvasID() == thisCanvas.id && this.GamePhysics) {
                    //this.GamePhysics();
                }
            });
        });
    },

    draw = function () {
        _canvas.each(function (canvasIndex, canvas) {
            var thisCanvas = this;
            var context = this.getContext(_canvasContext[this.id]);
            if (!context) {
                return;
            }
            
            // Clearing Screen
            context.fillStyle = _backgroundColors[this.id];
            context.fillRect(0, 0, this.width, this.height);

            $(_objectsToRender).each(function (objectIndex, objectToRender) {
                if (this.getCanvasID() == thisCanvas.id)
                    this.draw(context);
            });
        });
    },

    SetCanvasContext = function (value) {
        _canvasContext = value;
    },

    EventHandler = function (event) {
        _uiEvents.push({
            'interval': _interval,
            'event': event
        });
    },

    UIEvents = function () {
        return _uiEvents;
    },

    _addToRender = function (objectToAdd) {
        _objectsToRender.push(objectToAdd);
    },

    getCanvas = function (canvasid) {
        thisGame = this;
        thisCanvasID = canvasid;
        var canvasObject = {
            "Game": thisGame,
            "Canvas": $("canvas#" + canvasid),
            NewObject: function (value) {
                value.getCanvasID = function () {
                    return canvasid;
                };
                _addToRender(value);
            },
            NewString: function (value) {
                var values = typeof value == 'undefined' || value == null ? {} : value;

                if (typeof values == 'object') {
                    values.canvasid = thisCanvasID;
                    return geString(values);
                }

                else if (typeof values == 'string') {
                    var _str = $("#" + values);
                    var attr = _str.attr('data-gengine');
                    var values = $.parseJSON(_str.attr('data-gengine'));
                    values.content = _str.text();

                    return geString(values);
                }
            },
            NewImg: function (value) {
                var values = typeof value == 'undefined' || value == null ? {} : value;

                if (typeof values == 'object') {
                    values.canvasid = thisCanvasID;
                    return _newImg(values);
                }

                else if (typeof values == 'string') {
                    var _img = $("#" + values);

                    var values = $.parseJSON(_img.attr('data-gengine'));

                    values.src = _img.attr('src');

                    return _newImg(values);
                }
            },
            BindGEObjects: function () {
                thisCanvas = this;
                var _strs = $("GEString");
                var _objects = new Array();
                for(var i=0; i<_strs.length; i++)
                {
                    var attr = _strs[i].attributes['data-gengine'];
                    var values = $.parseJSON(attr.value);
                    if (values.canvasid != thisCanvasID) break;

                    var geobject = thisCanvas.NewString(_strs[i].id);
                    _objects.push({ "id": _strs[i].id, "geobject": geobject });
                }
                var _imgs = $("GEIMG");

                for (var i = 0; i < _imgs.length; i++) {
                    var attr = _imgs[i].attributes['data-gengine'];
                    var values = $.parseJSON(attr.value);
                    if (values.canvasid != thisCanvasID) return;

                    var geoobject = thisCanvas.NewImg(_imgs[i].id);
                    _objects.push({ "id": _imgs[i].id, "geobject": geobject });
                }

                return _objects;
            },
            setBackgroundColor: function (color) {
                _backgroundColors[canvasid] = color;
                return this;
            }
        };

        return canvasObject;
    },

    Stop = function () {
        clearInterval(_interval);
    },

    CreateImageData = function (canvasid) {
        _canvas.each(function () {
            if (this.id != canvasid)
                return;

            window.open(this.toDataURL(), "canvasImage", "left=0,top=0,width=" + this.width + ",height=" + this.height + ",toolbar=0,resizable=0");
        });
    },
    // parts with functionallity
    eventuality = function (that) {
        var registry = {},

            fire = function (event) {
                var array,
                    func,
                    handler,
                    i,
                    type = typeof event === 'string' ? event : event.type;

                if (registry.hasOwnProperty(type)) {
                    array = registry[type];
                    for (i = 0; i < array.length; i++) {
                        handler = array[i];
                        func = handler.method;
                        if (typeof func === 'string') {
                            func = this[func];
                        }

                        func.apply(this, handler.parameters || [event]);
                    }
                }
                return this;
            },

            on = function (type, method, parameters) {
                var handler = {
                    method: method,
                    parameters: parameters
                };
                if (registry.hasOwnProperty(type)) {
                    registry[type].push(handler);
                }
                else {
                    registry[type] = [handler];
                }
                return this;
            };

        that.fire = fire;
        that.on = on;

        return that;
    },
    // Using the Functional Pattern to define the new base of object
    geObject = function (specs, my) {
        var that,
            getX = function () {
                return my.x;
            },
            getY = function () {
                return my.y;
            },
            getCanvasId = function () {
                return my.canvasid;
            };

        my = my || {};
        my.geType = _geTypes.GEOBJECT;
        my.x = specs.x || 0;
        my.y = specs.y || 0;
        my.canvasid = specs.canvasid;

        that = {};
        that.getX = getX;
        that.getY = getY;
        that.getCanvasID = getCanvasId;

        eventuality(that);

        _addToRender(that);
        return that;
    },

    geString = function (specs, my) {
        var that,
            draw = function (context) {
                context.fillStyle = my.color;
                context.font = my.fontSize + " " + my.fontFamily;
                context.textBaseline = "top";
                context.fillText(my.content, my.x, my.y);
            };

        my = my || {};
        my.geType = _geTypes.STRING;
        my.content = specs.content || "NEW STRING";
        my.color = specs.color || "#ffffff";
        my.fontSize = specs.fontSize || "20px";
        my.fontFamily = specs.fontFamily || "sans";

        that = geObject(specs, my);
        that.draw = draw;
        return that;
    },

    _newImg = function (values) {

        src = values == null || values.src == null ? "" : values.src;
        color = values == null || values.color == null ? "#FFFFFF" : values.color;
        x = values == null || values.x == null ? 0 : values.x;
        y = values == null || values.y == null ? 0 : values.y;

        var data = {
            "getype": _geTypes.IMAGE,
            "canvasid": values.canvasid,
            "src": src,
            "color": color,
            "x": x,
            "y": y,
            "img": new Image()
        };

        var imgObject = {

            getCanvasID: function () {
                return data.canvasid;
            },
           
            draw: function (context) {
                if (data.img.src == "") {
                    data.img.src = data.src;

                    data.img.onload = function () {
                        context.drawImage(data.img, data.x, data.y);
                    };
                    return;
                }

                context.drawImage(data.img, data.x, data.y);
            }
        };

        _addToRender(imgObject);
        return imgObject;
    };

    return {
        Start: Start,
        Stop: Stop,
        UIEvents: UIEvents,
        FrameCount: FrameCount,
        getCanvas: getCanvas,
        CreateImageData: CreateImageData,
        SetDebugger: SetDebugger,
        Debug: Debug
    };
}(jQuery);