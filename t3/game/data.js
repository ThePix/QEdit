"use strict";


createRoom("lounge", {
  desc:"The lounge is big.",
})


createItem("player", PLAYER(), {
  loc:"lounge",
  examine:"Looking good!",
})