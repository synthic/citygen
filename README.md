# CityGen

CityGen is a procedural city generator and homepage that runs in your browser, built with [three.js](https://threejs.org).

Visuals inspired by [DICE](https://www.dice.se)'s breathtaking parkour video game [Mirror's Edge](https://en.wikipedia.org/wiki/Mirror%27s_Edge).

## Installation

All dependencies are loaded from a CDN, so just pull the files into the root directory of your web server to get started.

## Usage

Variables are stored in `data.js`. Buildings will be selected randomly and gain attributes based on objects in the `data` array. Valid attributes include `color`, `label`, and `url`. Buildings will become clickable if `url` is set.

## Dependencies

- [three.js](https://github.com/mrdoob/three.js) for 3D rendering using WebGL.
- [three-spritetext](https://github.com/vasturiano/three-spritetext) for drawing sprites from text.
- [ES Module Shims](https://github.com/guybedford/es-module-shims) for JavaScript import map support.
- [Hull.js](https://github.com/AndriiHeonia/hull) for calculating the concave hull of a set of points.
- [Geometric.js](https://github.com/HarryStevens/geometric) for polygon operations.