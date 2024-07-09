import { CustomProjection, Graticule } from "@visx/geo";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";
import topology from "./world-topo.json";
import { geoEckert6 } from "d3-geo-projection";
import { geoRotation } from "d3";

const world = topojson.feature(topology, topology.objects.units);

function dist([x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function flatten(array) {
  const arrayCopy = [...array];
  return arrayCopy.reduce((acc, curr) => acc.concat(curr), []);
}

function sort(array) {
  // Create a copy of the array using the spread operator
  const arrayCopy = [...array];
  return arrayCopy.sort((a, b) => a - b);
}

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function arrayAvg(array) {
  if (array.length === 0) {
    return 0; // Avoid division by zero
  }
  const sum = array.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return sum / array.length;
}

const useLambdaRotation = () => {
  let [lambdaRotation, setLambdaRotation] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLambdaRotation(lambdaRotation >= 360 ? 0 : lambdaRotation + 5);
    }, 5);
  });
  return lambdaRotation;
};
const fractionalPart = (number) => {
  return number - Math.floor(number);
};

const relativeCoords = (event) => {
  var bounds =
    event.target.parentElement.parentElement.parentElement.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  return { x: x, y: y };
};

const PHI = (1 + Math.sqrt(5)) / 2;

const fibonacciLattice = (n) => {
  return [...Array(n).keys()].map((i) => [
    fractionalPart(i / PHI),
    n == 1 ? 0 : i / (n - 1),
  ]);
};

const genPoints = (n, [lonShift, latShift]) => {
  return fibonacciLattice(n)
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
  let [userPos, setUserPos] = useState([-180, -90]);
  // let lambdaRotation = useLambdaRotation();

  const width = 500;
  const height = 500;

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
      {/* <rect x={0} y={0} width={width} height={height} fill={colors.sea} /> */}
      <CustomProjection
        data={world.features}
        projection={"naturalEarth"}
        scale={scale}
        translate={[centerX, centerY]}
        rotate={[0, 0, 0]}
      >
        {(projection) => {
          if (userPos) {
            points = genPoints(7, userPos);
            console.log(
              sort(
                flatten(
                  points.map((p) =>
                    points.map((p2) => haversineDistance(p, p2))
                  )
                )
              )
            );
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
                  // onClick={() => {
                  //   if (true)
                  //     alert(
                  //       `Clicked: ${feature.properties.name} (${feature.id})`
                  //     );
                  // }}
                />
              ))}
              {/* {userCircle(projection)} */}

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

                  let x = e.clientX;
                  let y = e.clientY;

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
