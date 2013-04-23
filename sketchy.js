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

  // shape1 and shape2 should be stringified JSON data from Raphael SketchPad
  Sketchy.shapeContextMatch = function(shape1, shape2) {
    var pointsPerShape = 50, // constant
        points1, points2,
        distanceMatrix, distanceTotal, distanceMean, distanceBinSmallest = 0.125, distanceBinCount = 5, distanceBins,
        angleMatrix, angleBinCount = 12, angleBins,
        costMatrix,
        distanceBinNumber, angleBinNumber, ksum,
        i, j, k;

    // Scatter points around each of the paths.  The algorithm
    // will only be using these points (as feature descriptors),
    // not the shapes.
    // TODO: Improve this portion of the algorithm.  Currently,
    //       a fixed number of points will be chosen regardless
    //       of path length.  The algorithm could be modified to
    //       work when shape1 and shape2 have different point counts.
    points1 = Sketchy.scatterPoints(Sketchy.convertSVGtoPointArrays(shape1), pointsPerShape);
    points2 = Sketchy.scatterPoints(Sketchy.convertSVGtoPointArrays(shape2), pointsPerShape);

    // Create a square 2D array and initialize it with 0s in the diagonal
    distanceMatrix = [];
    for(i=0; i<pointsPerShape; i++) {
      distanceMatrix[i] = [];
      distanceMatrix[i][i] = 0;
    }

    // Go through the upper triangle of the matrix, computing the distance, mirroring to the lower
    distanceTotal = 0;
    for(i=0; i<pointsPerShape-1; i++) {
      for(j=i+1; j<pointsPerShape; j++) {
        distanceMatrix[i][j] = distanceMatrix[j][i] = Sketchy.euclideanDistance(points1[i].x, points1[i].y, points2[j].x, points2[j].y);
        distanceTotal += distanceMatrix[i][j];
      }
    }
    distanceTotal *= 2; // 0s were already summed in, we just need to double it since we only went through the upper triangle
    distanceMean = distanceTotal/Math.pow(pointsPerShape,2);

    // Normalize by the mean distance
    for(i=0; i<pointsPerShape; i++) {
      for(j=0; j<pointsPerShape; j++) {
        distanceMatrix[i][j] /= distanceMean;
      }
    }

    // Initialize the distance bins with all 0s
    distanceBins = [];
    for(i=0; i<pointsPerShape; i++) {
      distanceBins[i] = [];
      for(j=0; j<pointsPerShape; j++) {
        distanceBins[i][j] = 0;
      }
    }

    // Double the acceptable radius each iteration, increasing the bin number
    // each time a point is still in the running.  0 means the point was not in
    // any bins (and will not be counted), 1 means it was in the outer, and
    //distanceBinCount (e.g. 5) means it is in the closest bin (including the
    // same point)
    for(k=0; k<distanceBinCount; k++) {
      for(i=0; i<pointsPerShape; i++) {
        for(j=0; j<pointsPerShape; j++) {
          if(distanceMatrix[i][j] < distanceBinSmallest) {
            distanceBins[i][j]++;
            distanceBins[j][i]++;
          }
        }
      }
      distanceBinSmallest *= 2;
    }

    // Angles //

    // Create a square 2D array and initialize it with 0s in the diagonal
    angleMatrix = [];
    for(i=0; i<pointsPerShape; i++) {
      angleMatrix[i] = [];
      angleMatrix[i][i] = 0;
    }

    // Compute the angle matrix, much like the distance matrix
    for(i=0; i<pointsPerShape-1; i++) {
      for(j=i+1; j<pointsPerShape; j++) {
        // Adding 2pi and modding by 2pi changes the -pi to pi range to a 0 to 2pi range
        angleMatrix[i][j] = angleMatrix[j][i] = (Math.atan2(points2[j].y - points1[i].y, points2[j].x - points1[i].x) + 2*Math.PI) % (2*Math.PI);
      }
    }

    // Initialize the angle bins
    angleBins = [];
    for(i=0; i<pointsPerShape; i++) {
      angleBins[i] = [];
    }

    // Compute the angle bins
    for(i=0; i<pointsPerShape; i++) {
      for(j=0; j<pointsPerShape; j++) {
        angleBins[i][j] = angleBins[j][i] = 1+Math.floor(angleMatrix[i][j]/(2*Math.PI/angleBinCount));
      }
    }

    // Cost Matrix //
    // Compute the cost matrix.  This skips the combined histogram for the sake
    // of efficiency.
    costMatrix = [];
    for(i=0; i<pointsPerShape; i++) {
      costMatrix[i] = [];
      for(j=0; j<pointsPerShape; j++) {
        // Go through all K bins.
        ksum = 0;
        for(logr=1; logr<=distanceBinCount; logr++) {
          for(theta=1; theta<=angleBinCount; theta++) {
            // calculate hik and hjk
            hik = Sketchy.shapeContextHistogram(i, distanceBinNumber, angleBinNumber, distanceBins, angleBins);
            hjk = Sketchy.shapeContextHistogram(j, distanceBinNumber, angleBinNumber, distanceBins, angleBins);

            ksum += Math.pow(hik-hjk,2) / (hik + hjk);
          }
        }
        costMatrix[i][j] = 1/2 * ksum;
      }
    }

    return 0;
  };

  // Sums up the number of points (relative to point pointIndex) in a particular
  // bin, defined by distanceBinNumber and angleBinNumber.  The pair
  // (distanceBinNumber, angleBinNumber) defines what is typically called
  // k, the polar bin.  This replaces the space requirement of a
  // 2D/k-bin histogram for each point.
  Sketchy.shapeContextHistogram = function(pointIndex, distanceBinNumber, angleBinNumber, distanceBins, angleBins) {
    var i, accumulator=0, numberOfPoints=distanceBins.length;
    for(i=0; i<numberOfPoints; i++) {
      if(i!==pointIndex &&
         distanceBins[pointIndex][i]===distanceBinNumber &&
         angleBins[pointIndex][i]===angleBinNumber) {
        accumulator++;
      }
    }
    // Normalize by numberOfPoints (technically should be by numberOfPoints-1?)
    // Shouldn't make a difference
    return accumulator/numberOfPoints;
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

  // Accepts an array of point arrays (multiple paths) and distributes a
  // specified number of points accross them, using the
  // distributePointsAcrossPath method.  This returns numberOfPoints point
  // objects in a single array, thus, path information is intentionally lost.
  Sketchy.scatterPoints = function(paths, numberOfPoints) {
    var pointsNotAssigned = numberOfPoints,
        result = [],
        pathLength, lengthNotCovered, numberOfPointsForPath, path, point, i;

    // Compute the length of all paths
    lengthNotCovered = 0;
    for(i=0; i<paths.length; i++) {
      lengthNotCovered += Sketchy.computeLength(paths[i], Sketchy.euclideanDistance);
    }

    // Scatter points
    for(i=0; i<paths.length; i++) {
      path = paths[i];

      // Determine how many points this path will get, based on distance
      // The last path automatically gets any remaining points just in case
      // there is imprecision in the calculations
      pathLength = Sketchy.computeLength(path, Sketchy.euclideanDistance);
      numberOfPointsForPath = Math.round((pathLength / lengthNotCovered) * pointsNotAssigned);
      if(i === paths.length-1) {
        path = Sketchy.distributePointsAcrossPath(path, pointsNotAssigned);
        pointsNotAssigned = 0;
        lengthNotCovered = 0;
      } else {
        path = Sketchy.distributePointsAcrossPath(path, numberOfPointsForPath);
        pointsNotAssigned -= numberOfPointsForPath;
        lengthNotCovered -= pathLength;
      }

      // Put the points into the result array, disregarding separate paths
      for(j=0; j<path.length; j++) {
        point = path[j];
        result.push({x:point.x, y:point.y}); // copy of the point, not reference
      }
    }

    return result;
  };

  Sketchy.distributePointsAcrossPath = function(path, numberOfPoints) {
    var result, pathIndexDelta, point, i,
        currPathIndex=0;

    if(numberOfPoints <= 0) {
      return [];
    }
    if(numberOfPoints === 1) {
      point = path[Math.floor((path.length-1)/2)]; // reference to original
      return [{x:point.x, y:point.y}]; // return a copy
    }

    pathIndexDelta = path.length/(numberOfPoints-1);

    // If numberOfPoints >= 2, we will manually add the first and last points
    // Add the first
    point = path[0];
    result = [{x:point.x, y:point.y}];

    for(i=1; i<numberOfPoints-1; i++) {
      currPathIndex += pathIndexDelta;
      point = path[Math.round(currPathIndex)];
      result.push({x:point.x, y:point.y}); // TODO: an error occurs (point is undefined) here when a short paths are drawn and shapeContextMatch is called
    }

    // Add the last
    point = path[path.length-1];
    result.push({x:point.x, y:point.y});

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
        if (value1 === 0) {
          continue;
        }
        h_min = Number.MAX_VALUE;
        for (y2=0; y2<h; y2++) {
          for (x2=0; x2<w; x2++) {
          // check only alpha channel
            value2 = d2[(x2+y2*w)*4+3];
            if (value2 === 0) {
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
