import assert from "node:assert/strict";
import test from "node:test";
import { floorContours } from "@/game/three/office-footprint";
import { tiledSnapshot } from "@/game/three/tiled-preview";
import { buildJKStoryOffice } from "./executive-room";

test("terrace and executive room form one renderable, connected floor", () => {
  const map = tiledSnapshot(buildJKStoryOffice());
  assert.equal(floorContours(map.floor).length, 1);
  for (let row = 23; row <= 33; row++)
    for (let col = 22; col <= 29; col++)
      assert.equal(map.floor[row][col], 1, `executive floor ${col},${row}`);
  for (const [col, row] of [[24, 4], [4, 16], [47, 16], [40, 33], [26, 22]])
    assert.equal(map.blocked.includes(`${col},${row}`), false, `entrance ${col},${row}`);
});
