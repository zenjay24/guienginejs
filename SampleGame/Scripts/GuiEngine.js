(function guiEngine(window, $) {
    var frameCount = 0,
        useDebugger = false,
        debuggerOutput,
        geTypes = {
            "GEOBJECT": "GEOBJECT",
            "STRING": "STRING",
            "IMAGE": "IMAGE"
        },
        canvasTypes = {
            "THREED": "webgl",
            "TWOD": "2d"
        },
        canvas,
        interval,
        backgroundColors = {},
        uiEvents = [],
        objectsToRender = [],
        canvasContext = [],
        eventHandler = function eventHandler(event) {
            uiEvents.push({
                'interval': interval,
                'event': event
            });
        },
        bindUIEvents = function bindUIEvents(idx, element) {
            var gameData = $.parseJSON($(this).attr('data-gengine'));
            $(gameData.handleEvents).each(
                function () {
                    if (this === "mouse") {
                        canvas.bind('click', eventHandler);
                    }
                }
            );
        },
        setDefaultCanvasContext = function setDefaultCanvasContext() {
            canvasContext[this.id] = canvasTypes.TWOD;
        },
        initCanvas = function initCanvas() {
            canvas = $('canvas[data-gengine]');
            canvas.each(bindUIEvents);
            canvas.each(setDefaultCanvasContext);
        },
        outputDebug = function outputDebug() {
            if (useDebugger === null) {
                return;
            }
            var debugstr = "FrameCount: " + frameCount;
            debuggerOutput.html(debugstr);
        },
        handleUserUIEvents = function handleUserUIEvents() {
        },
        handleInteractionRules = function handleInteractionRules() {
        },
        handleGamePhysics = function handleGamePhysics() {
            canvas.each(function (canvasIndex, myCanvas) {
                var thisCanvas = this;
                $(objectsToRender).each(function (objectIndex, objectToRender) {
                    if (this.getCanvasId() === thisCanvas.id && this.GamePhysics) {
                        var foo = "ADD SOME CODE HERE";
                    }
                });
            });
        },
        draw = function draw() {
            canvas.each(function drawCanvas(canvasIndex, myCanvas) {
                var thisCanvas = this,
                    context = this.getContext(canvasContext[this.id]);
                if (!context) {
                    return;
                }
                // Clearing Screen
                context.fillStyle = backgroundColors[this.id];
                context.fillRect(0, 0, this.width, this.height);

                $(objectsToRender).each(function fireDraws(objectIndex, objectToRender) {
                    if (this.getCanvasId() === thisCanvas.id) {
                        if (this.fire) {
                            this.fire("draw", context);
                        } else if (this.draw) {
                            this.draw(context);
                        }
                    }
                });
            });
        },
        loop = function loop() {
            if (useDebugger) {
                outputDebug();
            }
            // Handle User UI Events
            handleUserUIEvents();
            // Handle Interaction Rules
            handleInteractionRules();
            // Handle Game Physics
            handleGamePhysics();
            // Draw
            draw();
            frameCount += 1;
        },
        start = function start() {
            // initialize data-gengine elements
            initCanvas();
            //Call loop by Interval
            interval = setInterval(loop, 1000 / 30);
            return this;
        },
        SetDebugger = function SetDebugger(value) {
            debuggerOutput = $("#" + value);
        },
        Debug = function Debug(value) {
            useDebugger = value;
        },
        FrameCount = function FrameCount() {
            return frameCount;
        },
        SetCanvasContext = function SetCanvasContext(value) {
            canvasContext[this.id] = value;
        },
        UIEvents = function UIEvents() {
            return uiEvents;
        },
        addToRender = function addToRender(objectToAdd) {
            objectsToRender.push(objectToAdd);
            return objectToAdd;
        },
        // parts with functionallity
        positionality = function positionality(that, specs, my) {
            my = $.extend(my || {}, {
                x: specs.x || 0,
                y: specs.y || 0
            });
            $.extend(that, {
                getX : function getX() {
                    return my.x;
                },
                getY : function getY() {
                    return my.y;
                },
                setX : function setX(value) {
                    my.x = value;
                },
                setY: function setY(value) {
                    my.y = value;
                }
            });
            return that;
        },
        eventuality = function eventuality(that) {
            var registry = {};
            $.extend(that, {
                fire: function fire(event, argList) {
                    var array,
                        func,
                        handler,
                        i,
                        type = typeof event === 'string' ? event : event.type,
                        params,
                        args;

                    if (registry.hasOwnProperty(type)) {
                        array = registry[type];
                        for (i = 0; i < array.length; i += 1) {
                            handler = array[i];
                            func = handler.method;
                            if (typeof func === 'string') {
                                func = this[func];
                            }
                            params = $.extend(argList, handler.parameters || {});
                            args = [event, params];
                            func.apply(this, args);
                        }
                    }
                    return that;
                },
                on: function on(type, method, parameters) {
                    var handler = {
                        method: method,
                        parameters: parameters
                    };
                    if (registry.hasOwnProperty(type)) {
                        registry[type].push(handler);
                    } else {
                        registry[type] = [handler];
                    }
                    return that;
                }
            });
            return that;
        },
        renderality = function renderality(that, specs, my) {
            // private functions
            var ondraw = function ondraw(event, context) {
                // This allows late binding to the that.draw method
                if (this.hasOwnProperty("draw")) {
                    that.draw(context);
                }
            };
            // protected values
            my = $.extend(my || {}, {
                canvasId: specs.canvasId
            });
            if (!that.hasOwnProperty('getX')) {
                positionality(that, specs, my);
            }
            if (!that.hasOwnProperty('on')) {
                eventuality(that);
            }
            // bind the draw event to the ondraw 
            // handler which calls draw
            that.on("draw", ondraw);
            addToRender(that);
            $.extend(that, {
                getCanvasId: function getCanvasId() {
                    return my.canvasId;
                }
            });
            return that;
        },
        nodality = function nodality(that) {
            $.extend(that, {
                appendChild: function appendChild(node) {

                },
                removeChild: function removeChild(node) {
                }
            });
        },
        // Using the Functional Object Pattern to define the new base of object
        /**
         * Creates the basic guiEngine Object
         * 
         * @method getObject
         * @param {Object} specs
         * @param {Object} my
         */
        geObject = function geObject(specs, my) {
            var that = {};
            my = $.extend(my || {}, {
                geType: geTypes.GEOBJECT
            });
            return that;
        },
        geImage = function getImage(specs, my) {
            var that = geObject(specs, my);
            my = $.extend(my || {}, {
                geType: geTypes.IMAGE,
                src: specs.src || "~/Images/logo3w.png",
                img: new Image()
            });
            renderality(that, specs, my);
            $.extend(that, {
                draw: function draw(context) {
                    if (my.img.src === "") {
                        my.img.src = my.src;
                        my.img.onload = function onload() {
                            context.drawImage(my.img, my.x, my.y);
                        };
                        return that;
                    }
                    context.drawImage(my.img, my.x, my.y);
                    return that;
                }
            });
            return that;
        },
        geString = function geString(specs, my) {
            // get "parent" methods
            var that = geObject(specs, my);
            // protected values
            my = $.extend(my || {}, {
                geType: geTypes.STRING,
                content: specs.content || "NEW STRING",
                color: specs.color || "#ffffff",
                fontSize: specs.fontSize || "20px",
                fontFamily: specs.fontFamily || "sans"
            });
            // get methods from parts
            renderality(that, specs, my);
            // public methods
            $.extend(that, {
                draw: function draw(context) {
                    context.fillStyle = my.color;
                    context.font = my.fontSize + " " + my.fontFamily;
                    context.textBaseline = "top";
                    context.fillText(my.content, my.x, my.y);
                    return this;
                },
                setText: function setText(value) {
                    my.content = value;
                    return this;
                },
                getText: function getText() {
                    return my.content;
                },
                setColor: function setColor(value) {
                    my.color = value;
                    return this;
                },
                getColor: function getColor() {
                    return my.color;
                },
                setFontSize: function setFontSize(value) {
                    my.fontSize = value;
                    return this;
                },
                getFontSize: function getFontSize() {
                    return my.fontSize;
                },
                setFontFamily: function setFontFamily(value) {
                    my.fontFamily = value;
                    return this;
                },
                getFontFamily: function getFontFamily() {
                    return my.fontFamily;
                }
            });
            return that;
        },
        getCanvas = function getCanvas(canvasid) {
            var thisGame = this,
                thisCanvasId = canvasid,
                canvasObject = {
                    "Game": thisGame,
                    "Canvas": $("canvas#" + canvasid),
                    newString: function newString(value) {
                        var values = value || {},
                            strObject,
                            str,
                            attr;
                        if (typeof values === 'object') {
                            values.canvasId = thisCanvasId;
                            strObject = geString(values);
                        } else if (typeof values === 'string') {
                            str = $("#" + values);
                            attr = str.attr('data-gengine');
                            values = $.parseJSON(str.attr('data-gengine'));
                            values.content = str.text() || values.content;
                            strObject = geString(values);
                        }
                        return strObject;
                    },
                    newImage: function newImage(value) {
                        var values = value || {},
                            imageObject,
                            img;
                        if (typeof values === 'object') {
                            values.canvasId = thisCanvasId;
                            imageObject = geImage(values);
                        } else if (typeof values === 'string') {
                            img = $("#" + values);
                            values = $.parseJSON(img.attr('data-gengine'));
                            values.src = img.attr('src');
                            imageObject = geImage(values);
                        }
                        return imageObject;
                    },
                    bindGEObjects: function bindGEObjects() {
                        var thisCanvas = this,
                            strs = $("GEString"),
                            imgs = $("GEIMG"),
                            objects = [],
                            invokeCreate = function invokeCreate(ele, newObjectType) {
                                var attr = $(ele).attr('data-gengine'),
                                    values = $.parseJSON(attr),
                                    geobject;
                                if (values.canvasId !== thisCanvasId) {
                                    return;
                                }
                                geobject = newObjectType(ele.id);
                                objects.push({ "id": ele.id, "geobject": geobject });
                            };
                        strs.each(function () {
                            invokeCreate(this, thisCanvas.newString);
                        });
                        imgs.each(function () {
                            invokeCreate(this, thisCanvas.newImage);
                        });
                        return objects;
                    },
                    setBackgroundColor: function (color) {
                        backgroundColors[canvasid] = color;
                        return this;
                    }
                };
            return canvasObject;
        },
        stop = function stop() {
            clearInterval(interval);
        },
        CreateImageData = function CreateImageData(canvasid) {
            canvas.each(function () {
                if (this.id !== canvasid) {
                    return;
                }
                window.open(this.toDataURL(),
                    "canvasImage", "left=0,top=0,width=" + this.width
                    + ",height=" + this.height + ",toolbar=0,resizable=0");
            });
        },
        guiEngineMethods = {
            start: start,
            stop: stop,
            UIEvents: UIEvents,
            FrameCount: FrameCount,
            getCanvas: getCanvas,
            CreateImageData: CreateImageData,
            SetDebugger: SetDebugger,
            Debug: Debug
        };
    window.guiEngine = guiEngineMethods;
}(window, jQuery));