//////////////////////////////////////////
//              Sketchy.js              //
//////////////////////////////////////////
//
// JavaScript Shape Matching
// Works best with Raphael SketchPad
// Development started March 2013
//

// Immediately invoke an annonymous function to keep the global scope clean.
// Parameters:
// - global: will be the global object; called with "this" from global scope
// - undefined: keeps "undefined" undefined; no 2nd arg will make it undefined
(function(global, undefined) {
  // Namespace everything
  global.Sketchy = {};

  /* Jordan's Algorithms */
  // Test function for front-end application development
  Sketchy.randomShapeMatch = function(shape1, shape2) {
    return Math.random();
  };

  /* Kyle's Algorithms */
  Sketchy.shapeContextMatch = function(shape1, shape2) {
    return 0;
  };

  /* Betim's Algorithms */
  Sketchy.hausdorffDistance = function(shape1, shape2) {
  	return 0;
  };
})(this);
