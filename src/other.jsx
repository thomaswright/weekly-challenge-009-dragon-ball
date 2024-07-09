import { CustomProjection, Graticule } from "@visx/geo";
import { useEffect, useState } from "react";
import * as topojson from "topojson-client";
import topology from "./world-topo.json";
import { geoEckert6 } from "d3-geo-projection";

const world = topojson.feature(topology, topology.objects.units);

function relativeCoords(event) {
  var bounds =
    event.target.parentElement.parentElement.parentElement.getBoundingClientRect();
  var x = event.clientX - bounds.left;
  var y = event.clientY - bounds.top;
  return { x: x, y: y };
}

const useLambdaRotation = () => {
  let [lambdaRotation, setLambdaRotation] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setLambdaRotation(lambdaRotation >= 360 ? 0 : lambdaRotation + 1);
    }, 5);
  });
  return lambdaRotation;
};

const Main = () => {
  let [userPos, setUserPos] = useState(null);

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

  const points = [
    {
      lon: "0",
      lat: "0",
    },
  ];
  let userCircle = (projection) => {
    if (userPos) {
      let [x, y] = projection.projection([userPos.lon, userPos.lat]);
      return <circle r={width / 200} fill={"blue"} cx={x} cy={y} />;
    } else {
      return null;
    }
  };

  return (
    <svg width={width} height={height}>
      {/* <rect x={0} y={0} width={width} height={height} fill={colors.sea} /> */}
      <CustomProjection
        data={world.features}
        projection={geoEckert6}
        scale={scale}
        translate={[centerX, centerY]}
        rotate={[0, 0, 0]}
      >
        {(projection) => (
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
            {userCircle(projection)}

            {/* {points.map(({ lat, lon }) => {
              let [x, y] = projection.projection([lon, lat]);

              return <circle r={width / 200} fill={"red"} cx={x} cy={y} />;
            })} */}
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
                setUserPos({ lon, lat });
              }}
            />
          </g>
        )}
      </CustomProjection>
    </svg>
  );
};

export default Main;
