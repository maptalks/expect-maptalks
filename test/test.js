'use strict';

var expect = require('expect.js'),
    geos = require('./geo.json');
//load expect-maptalks
require('../index');

describe('expect-maptalks tests', function () {
    describe('closeTo', function () {
        it('closeTo', function () {
            expect([1, 1]).to.be.closeTo([1 + 1E-7, 1 - 1E-7]);
            expect({x : 1, y : 1}).to.be.closeTo([1 + 1E-7, 1 - 1E-7]);
        });

        it('not closeTo', function () {
            expect([1, 1]).not.to.be.closeTo([1 + 1E-5, 1 - 1E-7]);
            expect([1, 1]).not.to.be.closeTo(null);
            expect(null).not.to.be.closeTo([1 + 1E-7, 1 - 1E-7]);
        });
    });

    describe('eqlGeoJSON', function () {
        it('eqlGeoJSON', function () {
            geos.forEach(function (g, index) {
                expect(g).to.be.eqlGeoJSON(g);
                expect(null).not.to.be.eqlGeoJSON(g);
                expect(g).not.to.be.eqlGeoJSON(null);
                if (index > 0) {
                    expect(g).not.to.be.eqlGeoJSON(geos[index - 1]);
                }
            });
        });
    });

    describe('painted', function () {
        it('painted', function () {
            //TODO
        });
    });
});
