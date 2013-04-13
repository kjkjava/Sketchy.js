//////////////////////////////////////////
//              Sketchy.js              //
//////////////////////////////////////////
//
// JavaScript Shape Matching
// Works best with Raphael SketchPad
// Development started March 2013
//

// Immediately invoke an anonymous function to keep the global scope clean.
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
  // Takes in SVG data (from Raphael SketchPad) and outputs an array of paths,
  // each of which is an array of points in {x: Number, y: Number} format.
  // This is useful for preprocessing for Simplify.js or any other algorithm
  // operating on simple paths.
  Sketchy.convertSVGtoPointArrays = function(json) {
    var i, splitPath, j, point, paths;

    paths = [];
    json = JSON.parse(json);
    for(i=0; i<json.length; i++) {
      // Take the SVG data for the current path, cut off the M at the
      // beginning, and then explode the string into an array, split at
      // the "L" character.  This is the format from Raphael SketchPad
      splitPath = json[i].path.slice(1).split("L");
      paths[i] = [];
      for(j=0; j<splitPath.length; j++) {
        point = splitPath[j].split(",");
        paths[i][j] = {x: point[0], y: point[1]};
      }
    }
    return paths;
  };
  // Takes in SVG data (from Raphael SketchPad) and outputs an svgXML file.
  Sketchy.convertSVGtoXML = function(json)
  {
    var i, j, splitPath, point, svgXML;
    svgXML = "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n"; 
    svgXML += "<svg width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"> ";
    json = JSON.parse(json);
    for(i=0; i<json.length; i++) {
      svgXML += "\n<path fill=\"none\" stroke-opacity=\"1\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-width=\"5\" stroke-linejoin=\"round\" transform=\"[]\" type=\"path\" d=\"M ";
      splitPath = json[i].path.slice(1).split("L");
      for(j=0; j<splitPath.length; j++) {
        point = splitPath[j].split(",");
        svgXML += point[0]+" "+point[1]+" ";
      }
      svgXML += "\"/>";
    }
    svgXML += "\n</svg>";
    alert(svgXML);
    return svgXML;
  };
  
  Sketchy.shapeContextMatch = function(shape1, shape2) {
    return 0;
  };

  // Compute the Euclidean distance (as a crow flies) between two points.
  // Shortest distance between two pixels
  Sketchy.euclideanDistance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
  };

  // Compute the city block distance (or Manhattan distance) between two points.
  // Shortest 4-connected path between two pixels
  Sketchy.cityBlockDistance = function(x1, y1, x2, y2) {
    return Math.abs(x1-x2) + Math.abs(y1-y2);
  };

  // Compute the chessboard distance between two points.
  Sketchy.chessboardDistance = function(x1, y1, x2, y2) {
    return Math.max(Math.abs(x1-x2), Math.abs(y1-y2));
  };

  // Compute the length of a path.
  // Given an array of points in {x: Number, y: Number} format, calculate
  // the sum of the distances between consecutive points.  The distance
  // function must be specified.
  // TODO: Currently, there is no error checking (e.g. a valid callback).
  //       Either add it or make private.
  Sketchy.computeLength = function(path, distanceFunction) {
    var distance, i;

    distance = 0;
    for(i=0; i<path.length-1; i++) {
      distance += distanceFunction(path[i].x, path[i].y, path[i+1].x, path[i+1].y);
    }
    return distance;
  };

  /* Betim's Algorithms */
  // Compute the directed hausdorff distance of shape1 and shape2.
  // Calculate the lowest upper bound over all points in shape1
  // of the distances to shape2.
  Sketchy.h = function(shape1, shape2) {
    var h_max = Number.MIN_VALUE, h_min;
    var x1,y1,x2,y2;
    for (y1 = 0; y1 < shape1.length; y1++) {
      for (x1 = 0; x1 < shape1[y1].length; x1++) {
        if (shape1[x1][y1] == 0)
          continue;
        h_min = Number.MAX_VALUE;
        for (y2 = 0; y2 < shape2.length; y2++) {
          for (x2 = 0; x2 < shape2[y2].length; x2++) {
            if (shape2[x2][y2] == 0)
              continue;
            var euclDis = Sketchy.euclideanDistance(x1,y1,x2,y2);
            if (euclDis < h_min)
              h_min = euclDis;
          }
        }
        if (h_min > h_max)
          h_max = h_min;
      }
    }
    return h_max;
  };
  // Compute hausdorff distance h(shape1, shape2) and h(shape2, shape1) and return
  // the maximum value.
  Sketchy.hausdorffDistance = function(shape1, shape2) {
    var h0 = Sketchy.h(shape1, shape2);
    var h1 = Sketchy.h(shape2, shape1);
    return Math.max(h0, h1);
  };
  
  // TODO: Opening and Closing Operation
  Sketchy.morphologyOperation = function(shape, frame_size, operation)
  {
  	return 0;
  };

  Sketchy.bottleneckDistance = function(shape1, shape2) {
  	return 0;
  };
})(this);
