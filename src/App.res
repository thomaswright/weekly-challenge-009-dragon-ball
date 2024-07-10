module Map = {
  @module("./other.jsx") @react.component
  external make: unit => React.element = "default"
}

@react.component
let make = () => {
  <div>
    <Map />
    <div className={"w-[500px] text-center text-3xl italic font-black text-[#ff8500]"}>
      {"Dragon Ball Locations!"->React.string}
    </div>
    <div className={"w-[500px] text-center italic font-bold text-[#0049c9]"}>
      {"Pick a spot on the globe to see where the Dragon Balls go."->React.string}
    </div>
  </div>
}
