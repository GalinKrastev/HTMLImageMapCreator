var App = (function () {
    this.version = "2.2";

    var ExtractCoordinatesViewModel = function () {
        var self = this;

        self.CanvasObjects = {
            Polygon: {
                name: "Poly",
                // still to do here
                params: {}
            }, 
            Text: {
                name: "Text",
                params: { left: 0, top: 0, hasControls: false, selectable: false, opacity: 0.8, lockRotation: true, hasRotatingPoint: false }
            },
            Image: {
                name: "Image",
                params: { left: 0, top: 0, opacity: 1, transparentCorners: false, hasControls: false, selectable: false, lockRotation: true, hasRotatingPoint: false }
            },
            CustomRectangle: {
                name: "CustomRectangle",
                params: { top: 10, left: 10, selectable: true, hasControls: true, width: 100, height: 100, opacity: 0.75, borderColor: 'red', cornerColor: 'blue', borderOpacityWhenMoving: 0.8, cornerSize: 10, lockRotation: true, hasRotatingPoint: false }
            },
            CustomCircle: {
                name: "CustomCircle",
                params: { radius: 50, top: 10, left: 10, selectable: true, hasControls: true, width: 100, height: 100, opacity: 0.75, borderColor: 'red', cornerColor: 'blue', borderOpacityWhenMoving: 0.8, cornerSize: 10, lockRotation: true, hasRotatingPoint: false }
            }
        };

        self.ImageFormats = {
            PNG: "png",
            JPG: "jpg"
        };

        self.ImageMapTypes = {
            ShelfShot: "ShelfShot",
            ImageHighLighter: "ImageHighLighter"
        };

        self.menu = $("#menu").menu();
        $('.ui-menu-item').click(function () {
            self.menu.fadeOut();
        });
        

        self.canvas = new fabric.Canvas("Canvas");
        self.canvas.selectionColor = 'rgba(0,255,0,0.3)';
        self.canvas.selectionBorderColor = 'red';
        self.canvas.selectionLineWidth = 3;

        self.imageReader = new ImageReader(document.getElementById("files"));
        self.mouseCoordinates = { x: 0, y: 0 };
        self.copiedObjects = new Array();
        self.canvas.observe({
            'mouse:move': function (e) {
                if (!e.e) self.mouseCoordinates = { x: 0, y: 0 };

                var pointer = self.canvas.getPointer(e.e);
                if (pointer.x && pointer.y)
                    self.mouseCoordinates = { x: pointer.x, y: pointer.y };
            },
            'mouse:up': function (e) {
                if (e.e) {
                    switch (e.e.which) {
                        case 1:
                            self.menu.fadeOut();
                            break;
                        default:
                            self.menu
                                .css("left", parseInt(self.mouseCoordinates.x) + parseInt($("#Canvas").offset().left))
                                .css("top", parseInt(self.mouseCoordinates.y) + parseInt($("#Canvas").offset().top))
                                .show();
                            break;
                    }
                }
            },
        });

        // add, copy, paste, delete, select all and refresh functionality
        self.getSelectedObjects = function () {
            var activeGroup = self.canvas.getActiveGroup();
            if (activeGroup)
                return activeGroup._objects;
            else
                return (function () {
                    var activeObject = self.canvas.getActiveObject()
                    if (activeObject)
                        return [activeObject];

                    return new Array();
                })();

            return new Array();
        }
        self.addCanvasObject = function (obj) {
            self.canvas
                .add(new fabric[obj.name](obj.params))
                .renderAll();
        }
        self.copySelection = function (objectsToCopy) {
            if (!objectsToCopy || !objectsToCopy instanceof Array || objectsToCopy.length == 0)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            objectsToCopy.forEach(function (obj) {
                self.copiedObjects.push(fabric.util.object.clone(obj));
            });
        }
        self.pasteSelection = function () {
            if (self.copiedObjects.length == 0)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            var mouseCoords = self.mouseCoordinates;
            self.copiedObjects.forEach(function (obj) {
                obj.set({
                    top: (function () { return mouseCoords.y += 5; })(),
                    left: (function () { return mouseCoords.x += 5; })()
                });
                self.canvas.add(obj);
            });

            self.canvas.renderAll();

            self.copiedObjects = new Array();
        }
        self.deleteSelection = function (objectsToDelete) {
            if (!objectsToDelete || !objectsToDelete instanceof Array || objectsToDelete.length == 0)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            // unselect selected objects in order to be able to delete them, required by fabricjs canvas lib
            self.canvas.discardActiveGroup(); 
            objectsToDelete.forEach(function (obj) {
                self.canvas
                    .setActiveObject(obj)
                    .remove(obj);
            });

            self.canvas.renderAll();
        }
        self.selectAll = function () {
            // todo
            return window.App.UiExtension.Dialogs.ShowNotImplementedDialog();
        }
        self.refreshUi = function () {
            self.canvas.renderAll();
        }
        self.lineTop = function (selection) {
            if (!selection || !selection instanceof Array || selection.length < 2)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            var highestTopOffset = 0;
            selection.forEach(function (o) {
                highestTopOffset = parseInt(o.top) < highestTopOffset ? parseInt(o.top) : highestTopOffset;
            });

            selection.forEach(function (o) {
                o.set({
                    top: highestTopOffset
                });
            });

            self.canvas.renderAll();
        }
        self.lineLeft = function (selection) {
            if (!selection || !selection instanceof Array || selection.length < 2)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            var highestLeftOffset = 0;
            selection.forEach(function (o) {
                highestLeftOffset = parseInt(o.left) < highestLeftOffset ? parseInt(o.left) : highestLeftOffset;
            });

            selection.forEach(function (o) {
                o.set({
                    left: highestLeftOffset
                });
            });

            self.canvas.renderAll();
        }
        self.moveSelection = function (selection, offsetTop, offsetLeft) {
            if (!selection || !selection instanceof Array || selection.length == 0)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            if(offsetTop == null && offsetLeft == null)
                return window.App.UiExtension.Dialogs.ShowWarningDialog();

            selection.forEach(function (o) {
                if (offsetTop)
                    o.set({
                        top: (o.top + offsetTop)
                    });
                else if (offsetLeft)
                    o.set({
                        left: (o.left + offsetLeft)
                    });
            });

            self.canvas.renderAll();
        }

        // data operations
        self.getCanvasData = function () {
            var objs = new Array();
            self.canvas.forEachObject(function (o) {
                if (o.toShelfShotMap && o.toImageHighlighterMap)
                    objs.push(JSON.stringify(o.toJSON()));
            });

            var obj = {
                objects: objs
            };

            return obj;
        }
        self.storeInLocalStorage = function (key, obj) {
            if (Repository.exists(key))
                Repository.deleteObject(key);

            Repository.saveObject(key, obj)
        }
        self.getDataFromLocalStorage = function (key) {
            if (Repository.exists(key))
                return Repository.getObject(key);

            return {}
        }
        self.loadDataFromLocalStorage = function (obj) {
            if (obj && obj.objects && obj.objects instanceof Array)
                for (var i = obj.objects.length - 1; i >= 0; i--) {
                    var object = JSON.parse(obj.objects[i]);
                    var properties = self.CanvasObjects[object.type].params;

                    self.canvas.add(
                        new fabric[object.type]({})
                        .set(properties)
                        .set(object)
                    );
                }

            self.canvas.renderAll();
        }
        self.copyStorageForAllImages = function () {
            // save the data for the current image first
            self.storeInLocalStorage(self.imageReader.currentImageObj().name, self.getCanvasData());

            var obj = self.getDataFromLocalStorage(self.imageReader.currentImageObj().name);
            self.imageReader.getAllImages().forEach(function (img) {
                self.storeInLocalStorage(img.name, obj);
            });

            self.loadNextImage();
        }
        self.saveAsImage = function (ImageFormat) {
            window.open(
                self.canvas.toDataURL({
                    format: ImageFormat,
                    multiplier: 1
                })
                , "_blank"
                , ""
                , false
            );
        }
        self.saveAsJson = function () {
            saveAs(
                new Blob(
                    [JSON.stringify(self.canvas.toJSON())],
                    { type: "text/plain;charset=" + document.characterSet }
                )
                , "canvasToJSON" + ".txt"
            );
        }
        self.saveAsImageMap = function (ImageMapType) {
            ImageMapCounter.reset();

            var imageMapStrings = [];
            var objs = new Array();
            self.canvas.forEachObject(function (o) {
                if (o.toShelfShotMap && o.toImageHighlighterMap)
                    objs.push(o);
            });

            switch (ImageMapType) {
                case self.ImageMapTypes.ShelfShot:
                    (function () {
                        for (var i = objs.length - 1; i >= 0; i--)
                            imageMapStrings.push("\t" + objs[i].toShelfShotMap());

                        imageMapStrings.unshift("<map name=\"imageMap\" id=\"imageMap\">");
                    })();
                    break;
                case self.ImageMapTypes.ImageHighLighter:
                    (function () {
                        for (var i = objs.length - 1; i >= 0; i--)
                            imageMapStrings.push("\t" + objs[i].toImageHighlighterMap());

                        imageMapStrings.unshift("<map name=\"imageHighlighterMAP\" id=\"imageMap\">");
                    })();
                    break;
                default:
                    return window.App.UiExtension.Dialogs.ShowNotImplementedDialog();
            }

            imageMapStrings.push("</map>");

            saveAs(
                new Blob(
                    [imageMapStrings.join("\n")],
                    { type: "text/plain;charset=" + document.characterSet }
                )
                , (function () { return ["canvasTo", ImageMapType, "Map_", self.imageReader.currentImageObj().name, ".html"].join("") })()
            );
        }
        self.saveAllAsImageMap = function (ImageMapType) {
            return window.App.UiExtension.Dialogs.ShowNotImplementedDialog();

            //if (ImageMapType == self.ImageMapTypes.ShelfShot || ImageMapType == self.ImageMapTypes.ImageHighLighter) {
            //    var imagesLength = self.imageReader.getAllImages().length;
            //    for (var i = 0; i < imagesLength; i++) {
            //        self.loadNextImage();
            //        PubSub.subscribe("NextImageLoaded", function () { alert("loaded next image"); PubSub.unsubscribe("NextImageLoaded"); });
            //    }
            //}
            //else
            //    return window.App.UiExtension.Dialogs.ShowNotImplementedDialog();
        }

        self.loadImage = function (imgObj) {
            var img = new Image();
            $(img).load(function () {
                self.canvas
                    .setHeight(img.height)
                    .setWidth(img.width)
                    .clear()
                    .add(new fabric.Image(img, self.CanvasObjects.Image.params))
                    .add(new fabric.Text(imgObj.name, self.CanvasObjects.Text.params))
                    .renderAll();

                PubSub.publish("ImageLoaded");
            });

            img.src = imgObj.data; // triggers the load event of img
        }
        self.loadNextImage = function () {
            if (self.imageReader.getAllImages().length != 0) {
                self.storeInLocalStorage(self.imageReader.currentImageObj().name, self.getCanvasData());

                var subscription = PubSub.subscribe("ImageLoaded", function () {
                    self.loadDataFromLocalStorage(self.getDataFromLocalStorage(self.imageReader.currentImageObj().name));
                    PubSub.unsubscribe(subscription);
                });

                self.loadImage(self.imageReader.nextImageObj());
            }
        }
        self.loadPrevImage = function () {
            if (self.imageReader.getAllImages().length != 0) {
                self.storeInLocalStorage(self.imageReader.currentImageObj().name, self.getCanvasData());

                var subscription = PubSub.subscribe("ImageLoaded", function () {
                    self.loadDataFromLocalStorage(self.getDataFromLocalStorage(self.imageReader.currentImageObj().name));
                    PubSub.unsubscribe(subscription);
                });

                self.loadImage(self.imageReader.previousImageObj());
            }
        }

        return self;
    }

    var UiExtension = (function () {
        var defaultDialogOptions = {
            show: "bounce",
            hide: "explode",
            resizable: false,
            height: 200,
            modal: true,
            autoOpen: true,
        };

        var containers = {
            WarningSelectObject: "#warning-select-obj-first",
            ErrorNotImplemented: "#error-not-implemented"
        };

        var dialogs = {
            ShowWarningDialog: function () {
                return $($(containers.WarningSelectObject).dialog(defaultDialogOptions));
            },
            ShowNotImplementedDialog: function () {
                return $($(containers.ErrorNotImplemented).dialog(defaultDialogOptions));
            }
        };

        return {
            Dialogs: dialogs,
            Containers: containers,
            WarningDialogOptions: defaultDialogOptions
        }
    })();

    return {
        UiExtension: UiExtension,
        Bindings: ExtractCoordinatesViewModel,
        Version: version
    }
})();
window.App.Init = (function () {
    $("#tabs").tabs({
        active: 0,
        show: {
            effect: "bounce",
            duration: 500
        },
        hide: {
            effect: "explode",
            duration: 250
        }
    });

    $("#accordion").accordion();

    $("#prevImageButton").button();
    $("#nextImageButton").button();
    $("#files").button();

    $(window).bind('contextmenu', function (e) { return false; });

    // clear local storage
    //Repository.clearAll();

    // bind UI buttons
    window.App.Bindings = new window.App.Bindings();
    ko.applyBindings(window.App.Bindings);

    KeyboardJS.on("ctrl > c", function () {
        window.App.Bindings.copySelection(window.App.Bindings.getSelectedObjects());
    });
    KeyboardJS.on("ctrl > v", function () {
        window.App.Bindings.pasteSelection(window.App.Bindings.copiedObjects);
    });
    KeyboardJS.on("del", function () {
        window.App.Bindings.deleteSelection(window.App.Bindings.getSelectedObjects());
    });
    KeyboardJS.on("ctrl > a", function () {
        window.App.UiExtension.Dialogs.ShowNotImplementedDialog();

        return false;
    });
    KeyboardJS.on("left", function () {
        window.App.Bindings.moveSelection(window.App.Bindings.getSelectedObjects(), 0, -1);

        return false;
    });
    KeyboardJS.on("right", function () {
        window.App.Bindings.moveSelection(window.App.Bindings.getSelectedObjects(), 0, 1);

        return false;
    });
    KeyboardJS.on("up", function () {
        window.App.Bindings.moveSelection(window.App.Bindings.getSelectedObjects(), -1, 0);

        return false;
    });
    KeyboardJS.on("down", function () {
        window.App.Bindings.moveSelection(window.App.Bindings.getSelectedObjects(), 1, 0);

        return false;
    });
})();