module Map = {
  @module("./other.jsx") @react.component
  external make: unit => React.element = "default"
}

@react.component
let make = () => {
  let (count, setCount) = React.useState(() => 0)

  <div>
    <Map />
  </div>
}
