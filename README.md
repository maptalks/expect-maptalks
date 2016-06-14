# expect-maptalks

[![Circle CI](https://circleci.com/gh/MapTalks/expect-maptalks.svg?style=shield)](https://circleci.com/gh/MapTalks/expect-maptalks)

A plugin of expect.js(https://github.com/Automattic/expect.js) for maptalks with assertions for Coordinate/GeoJSON/Layer

## Methods

**approx**: asserts that the value is approximately equal or not

```js
expect(1.000001).to.be.approx(1);
expect(1.001).to.be.approx(1, 1E-2);
```

**closeTo**: asserts that whether the coordinate is closeTo another (approx with a delta of 1E-6)

```js
expect([1, 1]).to.be.closeTo([1 + 1E-7, 1 - 1E-7]);
expect({x : 1, y : 1}).to.be.closeTo([1 + 1E-7, 1 - 1E-7]);
```

**eqlGeoJSON**: asserts that whether a GeoJSON object is equal with another (true if the coordinates are closeTo another's)

```js
//true
expect({ "type": "Point", "coordinates": [0.0, 0.0] })
    .to.be.eqlGeoJSON({ "type": "Point", "coordinates": [0.000001, 0.000001] });
```

**painted**: asserts the given layer is painted in the center with a offset.

```js
//true
var v = new maptalks.VectorLayer('v').addGeometries(geos).addTo(map);
expect(v).to.be.painted();
//whether the layer is painted with an offset {x:5, y:3} from the center.
expect(v).to.be.painted(5, 3);
```