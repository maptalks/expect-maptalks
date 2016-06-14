'use strict';
(function (expect, maptalks) {

    function isArray(obj) {
        if (!obj) { return false; }
        if (Array.isArray) {
            return Array.isArray(obj);
        }
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function approx(val, expected, delta) {
        if (delta == null) { delta = 1e-6; }
        return val >= expected - delta && val <= expected + delta;
    }

    expect.Assertion.prototype.approx = function (expected, delta) {
        this.assert(
            approx(this.obj, expected, delta)
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of equal ' + JSON.stringify(expected); }
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of not equal ' + JSON.stringify(expected); }
            , expected);
        return this;
    };

    expect.Assertion.prototype.closeTo = function (expected, delta) {
        var expectation = false;
        if (expected && this.obj) {
            delta = delta || 1e-6;

            var x, y;
            if (isArray(this.obj)) {
                x = this.obj[0];
                y = this.obj[1];
            } else {
                x = this.obj.x;
                y = this.obj.y;
            }
            if (isArray(expected)) {
                expectation =
                    approx(x, expected[0], delta) &&
                    approx(y, expected[1], delta);
            } else {
                expectation =
                    approx(x, expected.x, delta) &&
                    approx(y, expected.y, delta);
            }
        }

        this.assert(
            expectation
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of closeTo ' + JSON.stringify(expected); }
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of not closeTo ' + JSON.stringify(expected); }
            , expected);
        return this;
    };

    function eqlArray(val, expected) {
        if (val.length !== expected.length) {
            return false;
        }
        for (var i = 0; i < expected.length; i++) {
            if (isArray(expected[i]) && !eqlArray(val[i], expected[i])) {
                return false;
            } else if (val[i] !== expected[i] && !approx(val[i], expected[i])) {
                return false;
            }
        }
        return true;
    }

    function eqlGeoJSON(val, expected) {
        if (!val || !expected) {
            return false;
        }
        var i;
        if (expected.type === 'FeatureCollection') {
            var features = expected.features;
            if (val.type !== 'FeatureCollection') {
                return false;
            }
            for (i = 0; i < features.length; i++) {
                if (!eqlGeoJSON(val.features[i], features[i])) {
                    return false;
                }
            }
            return true;
        } else if (expected.type === 'Feature') {
            if (val.type !== 'Feature') {
                return false;
            }
            return expect.eql(val.properties, expected.properties) &&
                    eqlGeoJSON(val.geometry, expected.geometry);
        } else if (expected.type === 'GeometryCollection') {
            if (val.type !== 'GeometryCollection') {
                return false;
            }
            var geometries = expected.geometries;
            for (i = 0; i < geometries.length; i++) {
                if (!eqlGeoJSON(geometries[i], val.geometries[i])) {
                    return false;
                }
            }
            return true;
        } else {
            return val.type === expected.type &&
                eqlArray(val.coordinates, expected.coordinates);
        }
    }

    expect.Assertion.prototype.eqlGeoJSON = function (expected) {
        this.assert(
            eqlGeoJSON(this.obj, expected)
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of eqlGeoJSON ' + JSON.stringify(expected); }
            , function () { return 'expected ' + JSON.stringify(this.obj) + ' to sort of not eqlGeoJSON ' + JSON.stringify(expected); }
            , expected);
        return this;
    };

    function isCenterDrawn(layer, dx, dy) {
        if (!dx) {
            dx = 0;
        }
        if (!dy) {
            dy = 0;
        }
        if (!layer._getRenderer()) {
            return false;
        }
        var size = layer.getMap().getSize(),
            image = layer._getRenderer().getCanvasImage();
        if (!image) {
            return false;
        }
        var canvas = image.image;
        return isDrawn(parseInt(size.width) / 2 - image.point.x + dx, parseInt(size.height) / 2 - image.point.y + dy, canvas);
    }

    function isDrawn(x, y, canvas) {
        var context = canvas.getContext('2d');
        var imgData = context.getImageData(x, y, 1, 1).data;
        if (imgData[3] > 0) {
            return true;
        }
        return false;
    }

    expect.Assertion.prototype.painted = function (dx, dy) {
        var expectation = false;
        if (this.obj instanceof maptalks.Layer) {
            expectation = isCenterDrawn(this.obj, dx, dy);
        }
        this.assert(
            expectation
            , function () { return 'expected layer to be painted in center with offset (' + dx + ',' + dy + ') '; }
            , function () { return 'expected layer not to be painted in center with offset (' + dx + ',' + dy + ') '; }
            , null);
        return this;
    };
})(typeof window !== 'undefined' ? window.expect : require('expect.js'), typeof window !== 'undefined' ? window.maptalks : require('maptalks'));

