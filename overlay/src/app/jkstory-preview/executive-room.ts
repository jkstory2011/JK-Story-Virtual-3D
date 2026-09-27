import { buildOfficeEnvironment } from "@/game/three/office-environments";
import type { TiledMap, TiledObject } from "@/lib/tiled-map";

export const TERRACE_OFFSET = 4;

// JKSTORY-only adaptation of the trading office's open front-center footprint.
export function buildJKStoryOffice(): TiledMap {
  const map = buildOfficeEnvironment("trading");
  const floor = map.layers.find((layer) => layer.name === "Floor")!;
  const collision = map.layers.find((layer) => layer.name === "Collision")!;
  const objects = map.layers.find((layer) => layer.name === "Objects")!;
  for (let row = 19; row <= 29; row++) {
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
  return surroundWithTerrace(map);
}

function surroundWithTerrace(map: TiledMap): TiledMap {
  const oldWidth = map.width;
  const oldHeight = map.height;
  const width = oldWidth + TERRACE_OFFSET * 2;
  const height = oldHeight + TERRACE_OFFSET * 2;
  for (const layer of map.layers) {
    if (layer.type !== "tilelayer") continue;
    const previous = layer.data ?? [];
    const defaultTile = layer.name === "Floor" ? 1 : 0;
    layer.data = Array.from({ length: width * height }, (_, index) => {
      const col = index % width - TERRACE_OFFSET;
      const row = Math.floor(index / width) - TERRACE_OFFSET;
      return col >= 0 && col < oldWidth && row >= 0 && row < oldHeight
        ? previous[row * oldWidth + col] ?? defaultTile
        : defaultTile;
    });
    layer.width = width;
    layer.height = height;
  }
  map.width = width;
  map.height = height;
  const layer = map.layers.find((entry) => entry.name === "Objects")!;
  // Open a passage on each side of the original office. Its existing south
  // entrance remains open and leads directly to the new lower terrace.
  layer.objects = layer.objects!.filter((object) => {
    if (object.type !== "cubicle_wall") return true;
    const col = object.x / 32;
    const row = object.y / 32;
    return !(
      (row === 0 && (col === 20 || col === 21)) ||
      (col === 0 && (row === 12 || row === 13)) ||
      (col === oldWidth - 1 && (row === 12 || row === 13))
    );
  });
  for (const object of layer.objects!) {
    object.x += TERRACE_OFFSET * 32;
    object.y += TERRACE_OFFSET * 32;
  }
  const add = (type: string, col: number, row: number) => layer.objects!.push({
    id: map.nextobjectid++, name: type, type,
    x: col * 32, y: row * 32, width: 32, height: 32, visible: true,
  });
  // A clear walking loop lies at x=2/49 and y=2/35; planting stays at the rim.
  for (let col = 5; col < width - 4; col += 6) {
    add("plant", col, 1);
    add("plant", col, height - 2);
  }
  for (let row = 6; row < height - 4; row += 6) {
    add("plant", 1, row);
    add("plant", width - 2, row);
  }
  for (const [col, row] of [[8, 3], [36, 3], [8, 34], [36, 34], [3, 8], [47, 28]])
    add("office_sofa", col, row);
  const zones = layer.properties?.find((property) => property.name === "ambientZones");
  if (zones && typeof zones.value === "string") {
    zones.value = JSON.stringify([
      ...JSON.parse(zones.value).map((zone: { x: number; y: number }) => ({
        ...zone, x: zone.x + TERRACE_OFFSET, y: zone.y + TERRACE_OFFSET,
      })),
      { id: "jkstory-terrace-north", x: 0, y: 0, width, height: 4, roaming: true },
      { id: "jkstory-terrace-south", x: 0, y: height - 4, width, height: 4, roaming: true },
      { id: "jkstory-terrace-west", x: 0, y: 4, width: 4, height: oldHeight, roaming: true },
      { id: "jkstory-terrace-east", x: width - 4, y: 4, width: 4, height: oldHeight, roaming: true },
    ]);
  }
  return map;
}
