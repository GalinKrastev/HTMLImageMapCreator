// Repository class, uses local storage to save some JSON objects
var Repository = {};
(function (object) {
    if (!object) throw new Error(["Repository constructor", "please pass an object"]);

    var s = $.jStorage

    object.saveObject = function (key, obj) {
        if (!object.exists(key)) {
            try {
                s.set(key, JSON.stringify(obj))
            }
            catch (ex) {
                console.log(ex.message);
                return false
            }
            finally {
                return true
            }
        }

        return false
    }

    object.overwriteObject = function (key) {
        if (object.exists(key)) {
            try {
                s.set(key, JSON.stringify(obj))
            }
            catch (ex) {
                console.log(ex.message);
                return false
            }
            finally {
                return true
            }
        }

        return false
    }

    object.getObject = function (key) {
        var obj = {};
        try {
            obj = JSON.parse(s.get(key, null))
        }
        catch (ex) {
            console.log(ex.message);
            return false
        }
        finally {
            return obj
        }
    }

    object.exists = function (key) {
        return s.get(key, null) != null
    }

    object.deleteObject = function (key) {
        if (object.exists(key))
            s.deleteKey(key)
        else
            return false

        return true
    }

    object.clearAll = function () {
        return s.flush()
    }

    return object;
})(Repository);