Sketchy.js
==========

Shape matching for mere mortals.

About This
----------
Our goal is to compare two shapes and assign a value based on their similarity.  Are they exactly the same?  100%.  Perfectly different?  0%.  Vaguely-put, we consider a shape to be a 2D image made up of contours.  Think of outlines, silhouettes, sketches, et cetera.  This means that in most cases, texture, color, and even gray values are not relevant.

We plan to implement different algorithms in this package, and eventually support shapes in a bigger variety of formats, but we must start simple.  Our initial goal is to take JSON-wrapped SVG data in via [Raphael SketchPad](http://ianli.com/sketchpad/) (which uses [Raphaël](http://raphaeljs.com/)), and output a score in the range [0.0, 1.0].  Currently, Sketchy.js itself is framework-agnostic (though including json2.js can't hurt to ensure support by older browsers).  We may end up requiring Raphaël, but you'll likely want to use that for input in the first place.

Practical uses include symbol classification (e.g. [Detexify](http://detexify.kirelabs.org/) and [Shapecatcher](http://shapecatcher.com/)), optical character recognition, sketching games, and a variety of other computer vision tasks.

Stay tuned.

About Us
--------
We are three guys working on a project for our computer vision class at The University of Georgia (Spring 2013).  In alphabetical order:

* Kyle Krafka ([kjkjava](https://github.com/kjkjava/))
* Jordan Marchetto ([jordanmarchetto](https://github.com/jordanmarchetto/))
* Betim Sojeva ([beddims](https://github.com/beddims/))

Development Notes
-----------------
* `sketchy.js` should not be edited, as `sketchy.coffee` edits will be compiled on top of it.  The test webpage references the JS file, though.
* Different types of "shapes" to consider (Be very clear about what your algorithms accepts as input.  Will you preprocess it?)
	* Vector
		* Most likely, you will be accepting Raphael SketchPad's JSON/SVG output.
			* This is primarily a set of simple point-to-point paths (in the order they were drawn).  See the "moveto" and "lineto" commands in the [SVG Documentation](http://www.w3.org/TR/2011/REC-SVG11-20110816/paths.html#PathDataMovetoCommands).
			* SketchPad typically chooses stroke color (black) and stroke width (5) for you, so does your algorithm ignore that?
		* Will you disregard or take advantage of order drawn?
		* What may appear as a single line may actually be the same line drawn in the same place multiple times.  Be explicit in how you choose to handle this.
	* Raster
		* Grid of pixels
		* No potential overlapping
		* The notion of a path is not well-defined
		* Strokes are not ordered

Credits
-------
* paper.png is from [Subtle Patterns](http://subtlepatterns.com/)
