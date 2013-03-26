Sketchy.js
==========

Shape matching for mere mortals.

About This
----------
We consider a shape to be a 2D image made up of contours.  Think of outlines, silhouettes, sketches, et cetera.  This means that in most cases, texture, color, and even gray values are not relevant.  Our goal is to compare two shapes and assign a value based on their similarity.  Are they exactly the same?  100%.  Perfectly different?  0%.

We plan to implement different algorithms in this package, and eventually support shapes in a bigger variety of formats, but we must start simple.  Our initial goal is to take JSON-wrapped SVG data in via [Raphael SketchPad](http://ianli.com/sketchpad/) (which uses [Raphaël](http://raphaeljs.com/)), and output a score in the range [0.0, 1.0].  Though we will use a number of libraries to build a sample application, Sketchy.js itself is framework-agnostic (though including json2.js can't hurt to ensure support by older browsers).

Practical uses include symbol classification (e.g. [Detexify](http://detexify.kirelabs.org/) and [Shapecatcher](http://shapecatcher.com/)), optical character recognition, sketching games, and a variety of other computer vision tasks.

About Us
--------
We are three guy working on a project for our computer vision class at The University of Georgia (Spring 2013).

Development Notes
-----------------
* `sketchy.js` should not be edited, as `sketchy.coffee` edits will be compiled on top of it.  The test webpage references the JS file, though.