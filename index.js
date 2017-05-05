'use strict';

(function (global, expect) {

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
            if (isArray(expected[i])) {
                if (!eqlArray(val[i], expected[i])) {
                    return false;
                }
            } else if (val[i] !== expected[i]) {
                if (!approx(val[i], expected[i])) {
                    return false;
                }
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

    function isCenterDrawn(layer, dx, dy, color) {
        if (!dx) {
            dx = 0;
        }
        if (!dy) {
            dy = 0;
        }
        if (!layer._getRenderer()) {
            return false;
        }
        var size, point, canvas;
        if (layer.getMap) {
            size = layer.getMap().getSize();
            var image = layer._getRenderer().getCanvasImage();
            if (!image) {
                return false;
            }
            point = image.point;
            canvas = image.image;
        } else {
            var map = layer;
            size = map.getSize();
            point = { x: 0, y: 0 };
            canvas = map._getRenderer().canvas;
        }
        if (!canvas) {
            return false;
        }
        return isDrawn(parseInt(size.width) / 2 - point.x + dx, parseInt(size.height) / 2 - point.y + dy, canvas, color);
    }

    function isDrawn(x, y, canvas, color) {
        var context = canvas.getContext('2d');
        var imgData = context.getImageData(x, y, 1, 1).data;
        var expect = false;
        var msg = null;
        if (imgData[3] > 0) {
            if (color) {
                var expectation = (imgData[0] === color[0] && imgData[1] === color[1] &&
                    imgData[2] === color[2]);
                if (color.length > 3 && expectation) {
                    expectation = (imgData[3] === color[3]);
                }
                if (!expectation) {
                    var expected = [imgData[0], imgData[1], imgData[2]];
                    if (color.length > 3) {
                        expected.push(imgData[3]);
                    }
                    msg = ', expect color [' + color.join() + '] but actual color is [' + expected.join() + ']';
                } else {
                    expect = true;
                }
            } else {
                expect = true;
            }
        }
        return {
            'expectation' : expect,
            'error' : msg
        };
    }

    expect.Assertion.prototype.painted = function (dx, dy, color) {
        if (!dx) {
            dx = 0;
        }
        if (!dy) {
            dy = 0;
        }
        var expectation = false;
        var colorError = '';
        var result = isCenterDrawn(this.obj, dx, dy, color);
        expectation = result.expectation;
        colorError = result.error || '';


        this.assert(
            expectation
            , function () { return 'expected layer to be painted in center with offset (' + dx + ',' + dy + ')' + colorError; }
            , function () { return 'expected layer not to be painted in center with offset (' + dx + ',' + dy + ')' + colorError; }
            , null);
        return this;
    };
})(this
  , ('expect' in this) ? this.expect : require('expect.js'));

