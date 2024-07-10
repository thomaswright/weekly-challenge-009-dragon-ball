# Weekly Challenge #9 - Dragon Ball

This is a solution for https://github.com/Algorithm-Arena/weekly-challenge-9-dragon-ball.

This is a pretty naive implementation and honestly doesn't result in great placement of the balls 😅, but it's a try!

We start with a fibonacci lattice to distribute points around the globe, rotate to the chosen point (by d3's geoRotation), and then search to the closest land mass.

https://github.com/thomaswright/weekly-challenge-009-dragon-ball/assets/5634164/ae31a73b-60d9-44c4-98e9-3dc253e0554f

## Demo

https://thomaswright.github.io/weekly-challenge-009-dragon-ball/

## Development

Run ReScript in dev mode:

```sh
npm run res:dev
```

In another tab, run the Vite dev server:

```sh
npm run dev
```
