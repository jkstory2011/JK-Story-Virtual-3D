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
  // Open a two-cell doorway into the main office; retain the existing side walls.
  objects.objects = objects.objects!.filter((object) =>
    !(object.type === "cubicle_wall" && object.y === 18 * 32 &&
      (object.x === 21 * 32 || object.x === 22 * 32)),
  );
  function add(type: string, col: number, row: number) {
    const object: TiledObject = {
      id: map.nextobjectid++, name: type, type,
      x: col * 32, y: row * 32, width: 32, height: 32, visible: true,
    };
    objects.objects!.push(object);
  }
  // Close the outer edge of the former void with glass, leaving the office visible.
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
