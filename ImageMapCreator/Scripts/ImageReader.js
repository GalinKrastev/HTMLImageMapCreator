var ImageObj = function (imgData, name) {
	this.data = imgData;
	this.name = name;
}

ImageObj.prototype = {

	constructor: ImageObj,

	toHtml: function () {
		var img = document.createElement('img');
		img.setAttribute("src", this.data);
		img.setAttribute("title", escape(this.name));
		img.setAttribute("alt", escape(this.name));

		return img;
	}
}

var ImageReader = function (htmlElementFileInput) {
	this.imageObjs = new Array();
	this.currentImage = null;
	this.currentIndex = 0;
	this.filesInput = htmlElementFileInput;

	var self = this;

	this.filesInput.onchange = function (evt) {
		var files = evt.target.files;
		for (var i = 0, f; f = files[i]; i++) {
			// Only process image files.
			if (!f.type.match('image.*')) continue;

			var reader = new FileReader();
			reader.onload = (function (theFile) {
				return function (e) {
					self.imageObjs.push( new ImageObj(
						e.target.result,
						escape(theFile.name)
					));
				};
			})(f);

			// Read in the image file as a data URL.
			reader.readAsDataURL(f);
		}
	}
}

ImageReader.prototype = {

    constructor: ImageReader,

    getAllImages: function () {
        return this.imageObjs;
    },

	nextImageObj: function () {
	    if(++this.currentIndex >= this.imageObjs.length) this.currentIndex = 0;

	    return this.imageObjs[this.currentIndex];
	},

	previousImageObj: function () {
	    if(--this.currentIndex <= -1) this.currentIndex = this.imageObjs.length -1;

	    return this.imageObjs[this.currentIndex];
	},

	currentImageObj: function () {
	    if (this.currentIndex == -1) ++this.currentIndex;

	    return this.imageObjs[this.currentIndex];
	},

	nextHtml: function () {
		return this.nextImageObj().toHtml();
	},

	previousHtml: function () {
		return this.previousImageObj().toHtml();
	},

	currentHtml: function () {
		return this.currentImageObj().toHtml();
	}
}