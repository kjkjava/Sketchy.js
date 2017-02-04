Sketchy.js
==========

Shape matching for mere mortals.

About This
----------
Sketchy.js is a JavaScript shape matching library.  Input two shapes and get back a percentage value based on their similarity.  Are they exactly the same?  100%.  Perfectly different?  0%.  Currently, only vector paths are supported as shapes, but should the need arise, support for raster graphics could be implemented with relative ease.

Specifically, we wanted to support shapes drawn by hand in-browser.  [Raphael SketchPad](http://ianli.com/sketchpad/) (which uses [Raphaël](http://raphaeljs.com/)) does the task of taking input just fine.  While we use a generic vector path format behind the scenes, we also provide the preprocessing necessary to work directly with SketchPad (which is JSON-wrapped SVG data).

Currently, there are two algorithms implemented to accomplish the task of comparing shapes: Hausdorff distance and shape contexts.  Both work reasonably well, and they each have their advantages, but we recommend the use of shape contexts.  Both functions take two shapes in as arguments, and output a score in the range [0.0, 1.0].  Nota bene: the output scores from the two algorithms are not intended to be compared directly.  They should be similar, but each algorithm has its own mapping from dissimilarity to percentage.

Sketchy.js is framework-agnostic (though including json2.js can't hurt to ensure JSON support by older browsers).  Input must come from somewhere, though, and unless you have a source and the necessary preprocessing, we recommend [Raphael SketchPad](http://ianli.com/sketchpad/).

Practical uses include symbol classification (e.g. [Detexify](http://detexify.kirelabs.org/) and [Shapecatcher](http://shapecatcher.com/)), optical character recognition, sketching games, and a variety of other computer vision tasks.

About Us
--------
The original development team was formed for a computer vision term project at The University of Georgia in Spring 2013.  We are, in alphabetical order:

* Kyle Krafka ([kjkjava](https://github.com/kjkjava/))
* Jordan Marchetto ([jordanmarchetto](https://github.com/jordanmarchetto/))
* Betim Sojeva ([beddims](https://github.com/beddims/))

Contributors are welcome!

TODO
----
* Document overviews and characteristics of each algorithm
	* Implement (or at least describe what needs to be done) changes that could make it better
	* Provide different options (enable/disable rotation invariance or scale invariance)
* Clean up demo code and documentation (polish the project up)
	* Carefully specify what input formats are expected and what the return format is (use standard naming conventions)
* Rework JavaScript pattern used
	* Hide internal functions
* Reference research papers
* Automatically support JSON data *or* generic array of point arrays
* Error checking (e.g. for proper 2D arrays)

Development Notes
-----------------
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

License
-------
[MIT](https://github.com/kjkjava/Sketchy.js/blob/master/LICENSE) &copy; 2017 Kyle Krafka

Credits
-------
* paper.png is from [Subtle Patterns](http://subtlepatterns.com/)
