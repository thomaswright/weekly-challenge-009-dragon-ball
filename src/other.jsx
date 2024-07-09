import { CustomProjection, Graticule } from "@visx/geo";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";
import topology from "./world-topo.json";
import { geoEckert6 } from "d3-geo-projection";
const world = topojson.feature(topology, topology.objects.units);

const fromLL = ([lon, lat]) => {
  return [lon / 360, Math.sin((lat * Math.PI) / 180)];
};

const toLL = ([x, y]) => {
  return [360 * x, (Math.acos(-2 * y) / Math.PI - 0.5) * 180];
};

let testSquare = [
  [0, 0],
  [0.5, 0.5],
  [0.9, 0],
  [0, 0.9],
  [0.9, 0.9],
];

let testLLSquare = [
  [0, 0],
  [-180, -90],
  [-180, 90],
  [180, -90],
  [180, 90],
];

let test = [
  [0, 0],
  [0.49, 0.49],
  [0.51, 0.49],
  [0.49, 0.51],
  [0.51, 0.51],
];

let cities = [
  [34.052235, -118.243683], // Los Angeles
  [40.712776, -74.005974], // New York
  [51.507351, -0.127758], // London
];

let paris = [48.856613, 2.352222];

let zero = [0, 0];

let positiveMod = (n, m) => {
  return ((n % m) + m) % m;
};

let windowMod = (a, mod) => {
  return positiveMod(a + mod, 2 * mod) - mod;
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

const useLambdaRotation = () => {
  let [lambdaRotation, setLambdaRotation] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLambdaRotation(lambdaRotation >= 360 ? 0 : lambdaRotation + 5);
    }, 5);
  });
  return lambdaRotation;
};

const PHI = (1 + Math.sqrt(5)) / 2;

const fibonacciLattice = (n) => {
  return [...Array(n).keys()].map((i) => [
    fractionalPart(i / PHI),
    n == 1 ? 0 : i / (n - 1),
  ]);
};

// const shiftPoints = ([xShift, yShift]) => {
//   return ([x, y]) => [positiveMod(x + xShift, 1), positiveMod(y + yShift, 1)];
// };

// let mapLog = (x) => {
//   console.log(x);
//   return x;
// };
// .map(mapLog)

const genPoints = (n, shiftLL) => {
  let [shiftX, shiftY] = fromLL(shiftLL);
  return fibonacciLattice(n)
    .map(([x, y]) => [windowMod(x + shiftX, 0.5), windowMod(y + shiftY, 0.5)])
    .map(toLL);
};

const Main = () => {
  let [userPos, setUserPos] = useState([0, 0]);
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
            console.log(points);
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
                    fill={i === 0 ? "#ff0004" : "#ffbb00"}
                    stroke={i === 0 ? "#980003" : "#d99f00"}
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
