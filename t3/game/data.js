"use strict";


createRoom("lounge", {
  id:2,
  desc:"The lounge is big.",
})


createItem("player", PLAYER(), {
  id:3,
  loc:"lounge",
  examine:"Looking good!",
})