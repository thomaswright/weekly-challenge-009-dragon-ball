import { CustomProjection, Graticule } from "@visx/geo";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";
import topology from "./world-topo.json";
import { geoRotation, geoContains } from "d3";
import * as utils from "./utils.js";
const world = topojson.feature(topology, topology.objects.units);

const useLambdaRotation = () => {
  let [lambdaRotation, setLambdaRotation] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLambdaRotation(lambdaRotation >= 360 ? 0 : lambdaRotation + 5);
    }, 5);
  });
  return lambdaRotation;
};

const stats = () => {
  return utils.sort(
    utils.flatten(
      points.map((p) => points.map((p2) => utils.haversineDistance(p, p2)))
    )
  );
};

const relativeCoords = (event) => {
  var bounds =
    event.target.parentElement.parentElement.parentElement.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  return { x: x, y: y };
};

const genPoints = (n, [lonShift, latShift]) => {
  return utils
    .fibonacciLattice(n)
    .map(([x, y]) => {
      return [360 * x - 180, (Math.acos(1 - 2 * y) / Math.PI) * 180 - 90];
    })
    .map((p) => {
      let degrees = [lonShift + 180, latShift + 90];
      let [lon, lat] = geoRotation(degrees).invert(p);
      return [-1 * lon, lat];
    });
};

const Main = () => {
  let [userPos, setUserPos] = useState(null);
  // let lambdaRotation = useLambdaRotation();

  const width = 500;
  const height = 250;

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;

  const colors = {
    sea: "#c5e8f8",
    graticule: "#b2d2e0",
    land: "#f2e7c3",
    border: "#a29c83",
  };

  let points = [];

  return (
    <svg width={width} height={height}>
      <CustomProjection
        data={world.features}
        projection={"equalEarth"}
        scale={scale}
        translate={[centerX, centerY]}
        rotate={[0, 0, 0]}
      >
        {(projection) => {
          let isOnLand = (p) => {
            return projection.features.reduce((acc, { feature }) => {
              return acc ? acc : geoContains(feature, p);
            }, false);
          };

          if (userPos) {
            points = genPoints(7, userPos).map((p) => {
              let onLand = isOnLand(p);

              if (!onLand) {
                let numSearchPoints = 12;
                let distInc = 500;
                let dist = distInc;
                let newPoint = null;

                while (newPoint === null) {
                  newPoint = [...Array(numSearchPoints).keys()].reduce(
                    (acc, v) => {
                      let angle = (360 * v) / numSearchPoints;
                      if (acc !== null) {
                        return acc;
                      } else {
                        let test = utils.pointAtDistance(p, dist, angle);
                        return isOnLand(test) ? test : null;
                      }
                    },
                    null
                  );

                  dist = dist + distInc;
                }
                return newPoint;
              } else {
                return p;
              }
            });
          }

          return (
            <g>
              <Graticule
                outline={(o) => projection.path(o) || ""}
                fill={colors.sea}
                stroke={colors.graticule}
              />

              <Graticule
                graticule={(g) => projection.path(g) || ""}
                stroke={colors.graticule}
              />

              {projection.features.map(({ feature, path }, i) => (
                <path
                  key={`map-feature-${i}`}
                  d={path || ""}
                  fill={colors.land}
                  stroke={colors.border}
                  strokeWidth={0.5}
                />
              ))}

              {points.map(([lon, lat], i) => {
                let [x, y] = projection.projection([lon, lat]);

                return (
                  <circle
                    key={i}
                    r={width / 200}
                    fill={`oklch(0.9 0.3 ${(360 / points.length) * i})`}
                    stroke={`oklch(0.5 0.3 ${(360 / points.length) * i})`}
                    cx={x}
                    cy={y}
                  />
                );
              })}
              <Graticule
                outline={(o) => projection.path(o) || ""}
                fill={"red"}
                fillOpacity={0.0}
                strokeOpacity={0.0}
                id={"outline"}
                onClick={(e) => {
                  let { x: relX, y: relY } = relativeCoords(e);
                  let [lon, lat] = projection.projection.invert([relX, relY]);
                  setUserPos([lon, lat]);
                }}
              />
            </g>
          );
        }}
      </CustomProjection>
    </svg>
  );
};

export default Main;
