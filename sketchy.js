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
        paths[i][j] = {x: parseInt(point[0]), y: parseInt(point[1])};
      }
    }
    return paths;
  };
  // Takes in an array of paths, each of which is an array of points in
  // {x: Number, y: Number} format, and outputs it in Raphael SketchPad-stlye
  // JSON/SVG data.  Essentially reverses the above and makes the same drawing
  // decisions as Raphael SketchPad (e.g. black, stroke-width of 5).
  Sketchy.convertPointArraysToSVG = function(paths) {
    var json = [],
        i,j;
    for(i=0; i<paths.length; i++) {
      json[i] = {
        "fill":"none",
        "stroke":"#000000",
        "path":"M",
        "stroke-opacity":1,
        "stroke-width":5,
        "stroke-linecap":"round",
        "stroke-linejoin":"round",
        "transform":[],
        "type":"path"
      };
      json[i].path += paths[i][0].x + "," + paths[i][0].y;
      for(j=1; j<paths[i].length; j++) {
        json[i].path += "L" + paths[i][j].x + "," + paths[i][j].y;
      }
    }
    return JSON.stringify(json); // TODO: better distinguish between JSON strings and objects
  };


  // Takes in SVG data (from Raphael SketchPad) and outputs an svgXML file.
  Sketchy.convertSVGtoXML = function(json)
  {
    var i, j, splitPath, point, svgXML;
    //svgXML = "<?xml version=\"1.0\" standalone=\"no\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n"; 
    svgXML = "<svg>"; // width=\"100%\" height=\"100%\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"> ";
    json = JSON.parse(json);
    for(i=0; i<json.length; i++) {
      svgXML += "\n<path fill=\"none\" stroke-opacity=\"1\" stroke=\"#000000\" stroke-linecap=\"round\" stroke-width=\"5\" stroke-linejoin=\"round\" type=\"path\" d=\"M ";
      splitPath = json[i].path.slice(1).split("L");
      for(j=0; j<splitPath.length; j++) {
        point = splitPath[j].split(",");
        svgXML += point[0]+" "+point[1]+" ";
      }
      svgXML += "\"/>";
    }
    svgXML += "\n</svg>";
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

  Sketchy.distributePointsAcrossPath = function(path, numberOfPoints) {
    var result, pathIndexDelta, i,
        currPathIndex=0;

    if(numberOfPoints <= 0) {
      return [];
    }
    if(numberOfPoints == 1) {
      // TODO: Is this creating a copy of the original point, or its reference?
      //       Check for this concern elsewhere.
      return [path[Math.floor((path.length-1)/2)]];
    }

    pathIndexDelta = path.length/(numberOfPoints-1);

    // If numberOfPoints >= 2, we will manually add the first and last points
    // Add the first
    result = [path[0]];

    for(i=1; i<numberOfPoints-1; i++) {
      currPathIndex += pathIndexDelta;
      result.push(path[Math.round(currPathIndex)]);
    }

    // Add the last
    result.push(path[path.length-1]);

    return result;
  };

  // TODO: The below function was written to perfectly distribute
  // some number of points across a polyline, but there is a problem,
  // due to an error on my part, a lack of precision, or perhaps both.
  // In many cases, the results are close, but the last segment is visably
  // longer than the others, as though the other points are under-
  // calculated.  Also, in some more select cases, the points go off-screen,
  // far away from anything accurate.  For now, it will be replaced
  // with a more naive approach.
  //
  // // Turn an array of points into another array representing the same
  // // shape, but with only n points, uniformly distributed along the path
  // // from the start point to the end point.  Path should be in
  // // array-of-points format.
  // Sketchy.distributePointsAcrossPath = function(path, numberOfPoints) {
  //   var pathLength, delta, i, distanceCovered, distanceToNextPoint, angleToNextPoint,
  //       nextPathIndex = 1,
  //       currX = path[0].x,
  //       currY = path[0].y,
  //       result = [{x: currX, y: currY}]; // Manually add the first point

  //   pathLength = Sketchy.computeLength(path, Sketchy.euclideanDistance);
  //   delta = pathLength/numberOfPoints;

  //   for(i=1; i<(numberOfPoints-1); i++) {
  //     distanceCovered = 0;
  //     do {
  //       distanceToNextPoint = Sketchy.euclideanDistance(currX, currY,
  //                               path[nextPathIndex].x, path[nextPathIndex].y);

  //       // Determine whether to jump to the next point or only move partially
  //       // Last move will occur in >= case (yes, it could happen in if or else)
  //       if(distanceToNextPoint <= delta-distanceCovered) {
  //         // Simply move to the next point
  //         currX = path[nextPathIndex].x;
  //         currY = path[nextPathIndex].y;
  //         nextPathIndex++;
  //         distanceCovered += distanceToNextPoint;
  //       } else {
  //         // Move partially
  //         angleToNextPoint = Math.atan2(path[nextPathIndex].y - currY,
  //                                       path[nextPathIndex].x - currX);
  //         currX = currX + Math.cos(angleToNextPoint) * (delta-distanceCovered);
  //         currY = currY - Math.sin(angleToNextPoint) * (delta-distanceCovered);
  //         distanceCovered = delta;
  //       }
  //     } while(distanceCovered < delta);
  //     // TODO: discretize currX and currY before pushing
  //     result.push({x: currX, y: currY});
  //   }
  //   // Manually add on the last point
  //   result.push(path[path.length-1]);
  //   return result;
  // };

  /* Betim's Algorithms */
  // Compute the directed hausdorff distance of pixels1 and pixels2.
  // Calculate the lowest upper bound over all points in shape1
  // of the distances to shape2.
  // TODO: Make it faster!
  Sketchy.hausdorff = function(pixels1, pixels2, w, h) {
    var h_max = Number.MIN_VALUE, h_min;
    var d1=pixels1.data, d2=pixels2.data;
    var value1, value2, dis, x1, y1, x2, y2;
    for (y1=0; y1<h; y1++) {
      for (x1=0; x1<w; x1++) {
        // check only alpha channel
        value1 = d1[(x1+y1*w)*4+3];
        if (value1==0) {
          continue;
        }
        h_min = Number.MAX_VALUE;
        for (y2=0; y2<h; y2++) {
          for (x2=0; x2<w; x2++) {
          // check only alpha channel
            value2 = d2[(x2+y2*w)*4+3];
            if (value2==0) {
              continue;
            }
            dis = Sketchy.euclideanDistance(x1,y1,x2,y2);
            if (dis < h_min) {
             h_min = dis;
            }
          }
        }
        if (h_min > h_max)
          h_max = h_min;
      }
    }
    return h_max;
  }
 
  // Compute hausdorffDistance hausdorff(shape1, shape2) and hausdorff(shape2, shape1) and return
  // the maximum value.
  Sketchy.hausdorffDistance = function(shape1, shape2) {
    var c1 = document.getElementById(shape1);
    var c2 = document.getElementById(shape2);
    var ctx1 = c1.getContext('2d');
    var ctx2 = c2.getContext('2d');         
    var idata1 = ctx1.getImageData(0,0,c1.width,c1.height);
    var idata2 = ctx2.getImageData(0,0,c2.width,c2.height);
    var h1 = Sketchy.hausdorff(idata1, idata2, c1.width, c1.height);
    var h2 = Sketchy.hausdorff(idata2, idata1, c1.width, c1.height);
    alert(Math.max(h1,h2));
    return Math.max(h1,h2);
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
