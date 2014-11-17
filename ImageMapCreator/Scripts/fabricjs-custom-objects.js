var ImageMapCounter = {};
(function (obj) {
    var number = 0;

    obj.next = function () {
        return ++number;
    }

    obj.current = function () {
        return number;
    }

    obj.previous = function () {
        return --number;
    }

    obj.reset = function () {
        number = 0;
    }
})(ImageMapCounter);

// create CustomRectangle class from Rectangle class
fabric.CustomRectangle = fabric.util.createClass(fabric.Rect, {
    type: 'CustomRectangle',
    initialize: function (element, options) {
        this.callSuper('initialize', element, options);
        //options && this.set('applicableFonts', options.imageMapNumber);
    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {});
    },
    toShelfShotMap: function () {
        ImageMapCounter.next();
        return [
            "<area shape=\"rect\" coords=\"",
            parseInt(this.left), ", ",
            parseInt(this.top), ", ",
            parseInt(this.left) + parseInt(this.currentWidth), ", ",
            parseInt(this.top) + parseInt(this.currentHeight), "\" ",
            "href=\"#\" ",
            "onclick=\"pt.fnHotspotMedia_selectedHotspot('t', 'current_" + ImageMapCounter.current() + "', " + ImageMapCounter.current() + ");\" ",
            "/>"
        ].join("");
    },
    toImageHighlighterMap: function () {
        ImageMapCounter.next();
        return [
            "<area shape=\"rect\" coords=\"",
            parseInt(this.left), ", ",
            parseInt(this.top), ", ",
            parseInt(this.left) + parseInt(this.currentWidth), ", ",
            parseInt(this.top) + parseInt(this.currentHeight), "\" ",
            "href=\"#\" ",
            "class=\"area\" ",
            "id=\"imageHighlighterMAP_" + ImageMapCounter.current() + "\" ",
            "/>"
        ].join("");
    }
});
fabric.CustomRectangle.fromObject = function (object) {
    return new fabric.CustomRectangle(object);
};
fabric.CustomRectangle.async = false;

// create CustomCircle class from Circle class
fabric.CustomCircle = fabric.util.createClass(fabric.Circle, {
    type: 'CustomCircle',
    initialize: function (element, options) {
        this.callSuper('initialize', element, options);
        //options && this.set('applicableFonts', options.imageMapNumber);
    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {});
    },
    toShelfShotMap: function () {
        ImageMapCounter.next();
        return [
            "<area shape=\"circle\" coords=\"",
            parseInt(this.left + this.currentWidth / 2), ", ",
            parseInt(this.top + this.currentHeight / 2), ", ",
            parseInt(Number(this.radius * this.scaleX).toFixed(2)), "\" ",
            "href=\"#\" ",
            "onclick=\"pt.fnHotspotMedia_selectedHotspot('t', 'current_" + ImageMapCounter.current() + "', " + ImageMapCounter.current() + ");\" ",
            "/>"
        ].join("");
    },
    toImageHighlighterMap: function () {
        ImageMapCounter.next();
        return [
            "<area shape=\"circle\" coords=\"",
            parseInt(this.left + this.currentWidth / 2), ", ",
            parseInt(this.top + this.currentHeight / 2), ", ",
            parseInt(Number(this.radius * this.scaleX).toFixed(2)), "\" ",
            "href=\"#\" ",
            "class=\"area\" ",
            "id=\"imageHighlighterMAP_" + ImageMapCounter.current() + "\" ",
            "/>"
        ].join("");
    }
});
fabric.CustomCircle.fromObject = function (object) {
    return new fabric.CustomCircle(object);
};
fabric.CustomCircle.async = false;