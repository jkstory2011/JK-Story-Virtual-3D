"use client";
import { useEffect, useRef, useState } from "react";
import { OfficeRenderer } from "@/game/three/office-renderer";
import { tiledSnapshot } from "@/game/three/tiled-preview";
import type { TiledMap } from "@/lib/tiled-map";
import type { ActorSnapshot } from "@/game/three/bridge";
import { useT } from "@/lib/i18n";
import "@/game/three/office.css";

export default function ThreeMapPreview({ map, actors = [], focus = "overview" }: { map: TiledMap; actors?: ActorSnapshot[]; focus?: "overview" | "executive" }) {
  const host = useRef<HTMLDivElement>(null),
    labels = useRef<HTMLDivElement>(null);
  const viewRef = useRef<OfficeRenderer | null>(null);
  const actorsRef = useRef(actors);
  const [failed, setFailed] = useState(false);
  const t = useT();
  useEffect(() => {
    if (!host.current || !labels.current) return;
    try {
      viewRef.current = new OfficeRenderer(host.current, labels.current);
    } catch {
      // WebGL capability failure is external state discovered only during allocation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true);
      return;
    }
    return () => {
      viewRef.current?.dispose();
      viewRef.current = null;
    };
  }, []);
  useEffect(() => {
    actorsRef.current = actors;
  }, [actors]);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const snapshot = tiledSnapshot(map);
    const blocked = new Set(snapshot.blocked);
    view.attach({
      actors: () => actorsRef.current,
      mapKey: () => `jkstory-preview-${map.width}x${map.height}`,
      map: () => snapshot,
      editor: () => ({ placement: false, spawn: false, owner: false, tiled: true, seatLabels: [] }),
      pointer: () => {},
      setPresentation: () => {},
      walkable: (x, y) =>
        x >= 0 && x < map.width && y >= 0 && y < map.height && !blocked.has(`${x},${y}`),
    });
    view.overview(map.width, map.height);
  }, [map]);
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    if (focus === "executive") view.showRoom(4.5, 14, 17);
    else view.overview(map.width, map.height);
  }, [focus, map]);
  return (
    <div className="relative h-full w-full bg-surface-raised">
      <div ref={host} className="office-three-canvas" />
      <div ref={labels} className="office-actor-labels" />
      <p className="absolute bottom-4 right-4 rounded-lg bg-surface px-3 py-2 text-caption text-text-muted border border-border">
        {failed ? t("mapPreview.webglUnavailable") : t("mapPreview.controlsHint")}
      </p>
    </div>
  );
}
