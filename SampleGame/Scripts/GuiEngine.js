﻿(function (window, $) {

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
        eventHandler = function (event) {
            uiEvents.push({
                'interval': interval,
                'event': event
            });
        },
        bindUIEvents = function (idx, element) {
            var gameData = $.parseJSON($(this).attr('data-gengine'));

            $(gameData.handleEvents).each(
                function () {
                    if (this === "mouse") {
                        canvas.bind('click', eventHandler);
                    }
                }
            );
        },
        setDefaultCanvasContext = function () {
            canvasContext[this.id] = canvasTypes.TWOD;
        },
        initCanvas = function () {
            canvas = $('canvas[data-gengine]');

            canvas.each(bindUIEvents);

            canvas.each(setDefaultCanvasContext);
        },
        outputDebug = function () {
            if (useDebugger === null) {
                return;
            }

            var debugstr = "FrameCount: " + frameCount;

            debuggerOutput.html(debugstr);
        },
        handleUserUIEvents = function () {
        },
        handleInteractionRules = function () {
        },
        handleGamePhysics = function () {

            canvas.each(function (canvasIndex, myCanvas) {
                var thisCanvas = this;

                $(objectsToRender).each(function (objectIndex, objectToRender) {
                    if (this.getCanvasId() === thisCanvas.id && this.GamePhysics) {
                        var foo = "ADD SOME CODE HERE";
                    }
                });
            });
        },
        draw = function () {
            canvas.each(function (canvasIndex, myCanvas) {
                var thisCanvas = this,
                    context = this.getContext(canvasContext[this.id]);

                if (!context) {
                    return;
                }

                // Clearing Screen
                context.fillStyle = backgroundColors[this.id];
                context.fillRect(0, 0, this.width, this.height);

                $(objectsToRender).each(function (objectIndex, objectToRender) {
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
        Loop = function () {

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
        Start = function () {
            // initialize data-gengine elements
            initCanvas();

            //Call loop by Interval
            interval = setInterval(Loop, 1000 / 30);
            return this;
        },

        SetDebugger = function (value) {
            debuggerOutput = $("#" + value);
        },

        Debug = function (value) {
            useDebugger = value;
        },


        FrameCount = function () {
            return frameCount;
        },


        SetCanvasContext = function (value) {
            canvasContext[this.id] = value;
        },


        UIEvents = function () {
            return uiEvents;
        },

        addToRender = function (objectToAdd) {
            objectsToRender.push(objectToAdd);
        },
        // parts with functionallity
        positional = function (that, specs, my) {
            var getX = function () {
                    return my.x;
                },
                getY = function () {
                    return my.y;
                },
                setX = function (value) {
                    my.x = value;
                },
                setY = function (value) {
                    my.y = value;
                };

            my = my || {};
            my.x = specs.x || 0;
            my.y = specs.y || 0;

            that.getX = getX;
            that.getY = getY;
            that.setX = setX;
            that.setY = setY;

            return that;
        },
        eventuality = function (that) {
            var registry = {},

                fire = function (event, argList) {
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
                    return this;
                },

                on = function (type, method, parameters) {
                    var handler = {
                        method: method,
                        parameters: parameters
                    };
                    if (registry.hasOwnProperty(type)) {
                        registry[type].push(handler);
                    } else {
                        registry[type] = [handler];
                    }
                    return this;
                };

            that.fire = fire;
            that.on = on;

            return that;
        },
        renderable = function (that, specs, my) {
            var getCanvasId = function () {
                    return my.canvasId;
                },
                ondraw = function (event, context) {
                    that.draw(context);
                };

            my = my || {};
            my.canvasId = specs.canvasId;

            that.getCanvasId = getCanvasId;
            that = positional(that, specs, my);

            if (!that.on) {
                eventuality(that);
            }

            that.on("draw", ondraw);

            addToRender(that);

            return that;
        },

        // Using the Functional Pattern to define the new base of object
        geObject = function (specs, my) {
            var that = {};

            my = my || {};
            my.geType = geTypes.GEOBJECT;

            return that;
        },
        geImage = function (specs, my) {
            var that,
                draw = function (context) {
                    if (my.img.src === "") {
                        my.img.src = my.src;

                        my.img.onload = function () {
                            context.drawImage(my.img, my.x, my.y);
                        };
                        return that;
                    }

                    context.drawImage(my.img, my.x, my.y);
                    return that;
                };

            my = my || {};
            my.geType = geTypes.IMAGE;
            my.src = specs.src || "~/Images/logo3w.png";
            my.img = new Image();

            that = geObject(specs, my);
            that.draw = draw;

            renderable(that, specs, my);

            return that;
        },
        geString = function (specs, my) {
            var that;

            my = my || {};
            my.geType = geTypes.STRING;
            my.content = specs.content || "NEW STRING";
            my.color = specs.color || "#ffffff";
            my.fontSize = specs.fontSize || "20px";
            my.fontFamily = specs.fontFamily || "sans";

            that = geObject(specs, my);

            renderable(that, specs, my);

            $.extend(that, {
                draw: function (context) {
                    context.fillStyle = my.color;
                    context.font = my.fontSize + " " + my.fontFamily;
                    context.textBaseline = "top";
                    context.fillText(my.content, my.x, my.y);
                    return this;
                },
                setText: function (value) {
                    my.content = value;
                    return this;
                },
                getText: function () {
                    return my.content;
                },
                setColor: function (value) {
                    my.color = value;
                    return this;
                },
                getColor: function () {
                    return my.color;
                },
                setFontSize: function (value) {
                    my.fontSize = value;
                    return this;
                },
                getFontSize: function () {
                    return my.fontSize;
                },
                setFontFamily: function (value) {
                    my.fontFamily = value;
                    return this;
                },
                getFontFamily: function () {
                    return my.fontFamily;
                }
            });

            return that;
        },
        getCanvas = function (canvasid) {
            var thisGame = this,
                thisCanvasID = canvasid,
                canvasObject = {
                    "Game": thisGame,
                    "Canvas": $("canvas#" + canvasid),
                    NewString: function (value) {
                        var values = value || {},
                            strObject,
                            str,
                            attr;

                        if (typeof values === 'object') {
                            values.canvasId = thisCanvasID;
                            strObject = geString(values);
                        } else if (typeof values === 'string') {
                            str = $("#" + values);
                            attr = str.attr('data-gengine');
                            values = $.parseJSON(str.attr('data-gengine'));
                            values.content = str.text();
                            strObject = geString(values);
                        }
                        return strObject;
                    },
                    NewImg: function (value) {
                        var values = value || {},
                            imageObject,
                            img;

                        if (typeof values === 'object') {
                            values.canvasId = thisCanvasID;
                            imageObject = geImage(values);
                        } else if (typeof values === 'string') {
                            img = $("#" + values);
                            values = $.parseJSON(img.attr('data-gengine'));
                            values.src = img.attr('src');
                            imageObject = geImage(values);
                        }
                        return imageObject;
                    },
                    BindGEObjects: function () {
                        var thisCanvas = this,
                            strs = $("GEString"),
                            objects = [],
                            i,
                            imgs = $("GEIMG"),
                            attr,
                            values,
                            geobject;

                        for (i = 0; i < strs.length; i += 1) {
                            attr = strs[i].attributes['data-gengine'];
                            values = $.parseJSON(attr.value);
                            if (values.canvasId !== thisCanvasID) {
                                break;
                            }

                            geobject = thisCanvas.NewString(strs[i].id);
                            objects.push({ "id": strs[i].id, "geobject": geobject });
                        }

                        for (i = 0; i < imgs.length; i += 1) {
                            attr = imgs[i].attributes['data-gengine'];
                            values = $.parseJSON(attr.value);
                            if (values.canvasId !== thisCanvasID) {
                                return;
                            }

                            geobject = thisCanvas.NewImg(imgs[i].id);
                            objects.push({ "id": imgs[i].id, "geobject": geobject });
                        }

                        return objects;
                    },
                    setBackgroundColor: function (color) {
                        backgroundColors[canvasid] = color;
                        return this;
                    }
                };

            return canvasObject;
        },

        Stop = function () {
            clearInterval(interval);
        },

        CreateImageData = function (canvasid) {
            canvas.each(function () {
                if (this.id !== canvasid) {
                    return;
                }

                window.open(this.toDataURL(),
                    "canvasImage", "left=0,top=0,width=" + this.width
                    + ",height=" + this.height + ",toolbar=0,resizable=0");
            });
        },
        guiEngine = {
            Start: Start,
            Stop: Stop,
            UIEvents: UIEvents,
            FrameCount: FrameCount,
            getCanvas: getCanvas,
            CreateImageData: CreateImageData,
            SetDebugger: SetDebugger,
            Debug: Debug
        };

    window.GuiEngine = guiEngine;

})(window, jQuery);