# expect-maptalks

[![Circle CI](https://circleci.com/gh/maptalks/expect-maptalks.svg?style=shield)](https://circleci.com/gh/maptalks/expect-maptalks)

A plugin of expect.js(https://github.com/Automattic/expect.js) for maptalks with assertions for Coordinate/GeoJSON/Layer

## Usage

```bash
npm install expect-maptalks --save-dev
```

### with Karma
Install [karma-expect-maptalks](https://github.com/MapTalks/karma-expect-maptalks)
```bash
npm install karma-expect-maptalks --save-dev
```
In karma.conf.js, Attention: **always declare expect-maptalks behind expect**
```javascript
    frameworks: [
      'mocha',
      'expect',
      'expect-maptalks'
    ],
    
    plugins: [
      'karma-expect',
      'karma-expect-maptalks'
    ],
```


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

**painted**: asserts the given layer or map is painted in the center with a offset.

```js
var v = new maptalks.VectorLayer('v').addGeometries(geos).addTo(map);
//asserts layer is painted in the center
expect(v).to.be.painted();
//whether the layer is painted with an offset {x:5, y:3} from the center.
//a negative x to the left and a positive to the right.
//a negative y to the top and a positive to the bottom.
expect(v).to.be.painted(5, 3);
//assert the point's color is [255, 255, 255]
expect(v).to.be.painted(5, 3, [255, 255, 255]);
//also support map
expect(map).to.be.painted(5, 3, [255, 255, 255]);
```
