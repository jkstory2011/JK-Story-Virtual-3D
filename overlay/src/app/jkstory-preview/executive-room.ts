import { buildOfficeEnvironment } from "@/game/three/office-environments";
import type { TiledMap, TiledObject } from "@/lib/tiled-map";

// JKSTORY-only adaptation of the trading office's open front-center footprint.
export function buildJKStoryOffice(): TiledMap {
  const map = buildOfficeEnvironment("trading");
  const floor = map.layers.find((layer) => layer.name === "Floor")!;
  const collision = map.layers.find((layer) => layer.name === "Collision")!;
  const objects = map.layers.find((layer) => layer.name === "Objects")!;
  for (let row = 19; row <= 28; row++) {
    for (let col = 18; col <= 25; col++) {
      const index = row * map.width + col;
      floor.data![index] = 1;
      collision.data![index] = 0;
    }
  }
  // Replace the low rails with full-height glass walls around the new room.
  objects.objects = objects.objects!.filter((object) =>
    !(object.type === "cubicle_wall" && (
      (object.y === 18 * 32 && object.x >= 18 * 32 && object.x <= 25 * 32) ||
      ((object.x === 17 * 32 || object.x === 26 * 32) && object.y >= 19 * 32 && object.y <= 28 * 32)
    )),
  );
  function add(type: string, col: number, row: number, direction?: string) {
    const object: TiledObject = {
      id: map.nextobjectid++, name: type, type,
      x: col * 32, y: row * 32, width: 32, height: 32, visible: true,
      ...(direction ? { properties: [{ name: "direction", type: "string", value: direction }] } : {}),
    };
    objects.objects!.push(object);
  }
  for (let row = 19; row <= 28; row++) {
    add("glass_partition", 17, row, "right");
    add("glass_partition", 26, row, "right");
  }
  // Two-cell framed entry facing the operating office. One leaf stands open
  // perpendicular to the wall and the adjacent cell remains walkable.
  for (let col = 18; col <= 25; col++)
    if (col !== 21 && col !== 22) add("glass_partition", col, 18);
  add("glass_partition", 21, 19, "right");
  for (let col = 18; col <= 25; col++) add("glass_partition", col, 29);
  add("reception_desk", 21, 23);
  add("computer", 21, 23);
  add("chair", 21, 24);
  add("low_cabinet", 24, 21);
  add("office_sofa", 19, 26);
  add("meeting_table", 21, 26);
  add("office_armchair", 24, 26);
  const objectProperties = objects.properties ?? [];
  const zones = objectProperties.find((property) => property.name === "ambientZones");
  if (zones && typeof zones.value === "string") {
    zones.value = JSON.stringify([
      ...JSON.parse(zones.value),
      { id: "jkstory-executive", x: 18, y: 19, width: 8, height: 10, roaming: false },
    ]);
  }
  return map;
}
