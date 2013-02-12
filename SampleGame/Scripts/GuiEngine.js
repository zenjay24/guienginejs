var GuiEngine = function ($) {

    var _frameCount = 0,

    _debugger = false,

    _debuggerDiv,

    _geTypes = {
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

    _canvasContext = [];

    var Start = function () {
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
        HandleGamePhysics();

        // Draw
        Draw();

        _frameCount++;
    },

    HandleUserUIEvents = function () {
    },

    HandleInteractionRules = function () {
    },

    HandleGamePhysics = function () {
        
        _canvas.each(function (canvasIndex, canvas) {
            var thisCanvas = this;

            $(_objectsToRender).each(function (objectIndex, objectToRender) {
                if (this.GetCanvasID() == thisCanvas.id)
                    $(this).triggerHandler('handlegamephysics');
            });
        });
    },

    Draw = function () {
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
                if (this.GetCanvasID() == thisCanvas.id)
                    this.Draw(context);
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

    GetCanvas = function (canvasid) {
        thisGame = this;
        thisCanvasID = canvasid;
        var canvasObject = {
            "Game": thisGame,
            "Canvas": $("canvas#" + canvasid),
            NewObject: function (value) {
                value.GetCanvasID = function () {
                    return canvasid;
                };
                _addToRender(value);
            },
            NewString: function (value) {
                var values = typeof value == 'undefined' || value == null ? {} : value;

                if (typeof values == 'object') {
                    values.canvasid = thisCanvasID;
                    return _newString(values);
                }

                else if (typeof values == 'string') {
                    var _str = $("#" + values);
                    var attr = _str.attr('data-gengine');
                    var values = $.parseJSON(_str.attr('data-gengine'));
                    values.content = _str.text();

                    return _newString(values);
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
            SetBackgroundColor: function (color) {
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

    _newString = function (values) {

        content = values == null || values.content == null ? "" : values.content;
        color = values == null || values.color == null ? "#FFFFFF" : values.color;
        x = values == null || values.x == null ? 0 : values.x;
        y = values == null || values.y == null ? 0 : values.y;
        fontSize = values == null || values.fontSize == null ? "20px" : values.fontSize;
        fontFamily = values == null || values.fontFamily == null ? "sans" : values.fontFamily;

        var data = {
            "getype": _geTypes.STRING,
            "canvasid": values.canvasid,
            "content": content,
            "color": color,
            "x": x,
            "y": y,
            "fontSize": fontSize,
            "fontFamily": fontFamily
        };

        var strObject = {

            // GetData returns a readonly object with the current values
            GetData: function () {
                return {
                    "getype": data._geTypes.STRING,
                    "canvasid": data.canvasid,
                    "content": data.content,
                    "color": data.color,
                    "x": data.x,
                    "y": data.y,
                    "fontSize": data.fontSize,
                    "fontFamily": data.fontFamily
                };
            },
            GetGEType: function () {
                return data.getype;
            },
            GetCanvasID: function () {
                return data.canvasid;
            },
            SetText: function (value) {
                data.content = value;
                return this;
            },
            GetText: function () {
                return data.content;
            },
            SetX: function (value) {
                data.x = value;
                return this;
            },
            GetX: function () {
                return data.x;
            },
            SetY: function (value) {
                data.y = value;
                return this;
            },
            GetY: function () {
                return data.y;
            },
            MoveX: function (value) {
                data.x += value;
                return this;
            },
            MoveY: function (value) {
                data.y += value;
                return this;
            },
            SetColor: function (value) {
                data.color = value;
                return this;
            },
            GetColor: function () {
                return data.color;
            },
            SetFontSize: function (value) {
                data.fontSize = value;
                return this;
            },
            GetFontSize: function () {
            },
            SetFontFamily: function (value) {
                data.fontFamily = value;
                return this;
            },
            GetFontFamily: function () {
                return data.fontFamily;
            },
            Draw: function (context) {
                context.fillStyle = data.color;
                context.font = data.fontSize + " " + data.fontFamily;
                context.textBaseline = "top";
                context.fillText(data.content, data.x, data.y);
            }
        };

        _addToRender(strObject);
        return strObject;
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

            // GetData returns a readonly object with the current values
            GetData: function () {
                return {
                    "getype": data._geTypes.STRING,
                    "canvasid": data.canvasid,
                    "src": data.src,
                    "color": data.color,
                    "x": data.x,
                    "y": data.y
                };
            },
            GetGEType: function () {
                return data.getype;
            },
            GetCanvasID: function () {
                return data.canvasid;
            },
            SetSrc: function (value) {
                data.src = value;
                return this;
            },
            GetSrc: function () {
                return data.src;
            },
            SetX: function (value) {
                data.x = value;
                return this;
            },
            GetX: function () {
                return data.x;
            },
            SetY: function (value) {
                data.y = value;
                return this;
            },
            GetY: function () {
                return data.y;
            },
            MoveX: function (value) {
                data.x += value;
                return this;
            },
            MoveY: function (value) {
                data.y += value;
                return this;
            },
            SetColor: function (value) {
                data.color = value;
                return this;
            },
            GetColor: function () {
                return data.color;
            },
            Draw: function (context) {
                if (data.img.src == "") {
                    data.img.src = data.src;

                    data.img.onload = function () {
                        context.drawImage(data.img, data.x, data.y);
                    };
                    return;
                }

                context.drawImage(data.img, data.x, data.y);
                //context.fillStyle = data.color;
                //context.font = data.fontSize + " " + data.fontFamily;
                //context.textBaseline = "top";
                //context.fillText(data.content, data.x, data.y);
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
        GetCanvas: GetCanvas,
        CreateImageData: CreateImageData,
        SetDebugger: SetDebugger,
        Debug: Debug
    };

}(jQuery);