"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { buildOfficeEnvironment } from "@/game/three/office-environments";
import { tiledSnapshot } from "@/game/three/tiled-preview";
import { deskSeatLabels } from "@/game/three/seating";
import type { ActorSnapshot } from "@/game/three/bridge";

const ThreeMapPreview = dynamic(() => import("@/components/ThreeMapPreview"), { ssr: false });

const STAFF = [
  { name: "Codex", role: "업무 분석 · 설계 · 결과 검증", look: "office-jun" },
  { name: "Claude Code", role: "코드 개발 · 테스트", look: "office-min" },
  { name: "Hermes", role: "직원 실행 · 일정 · 작업 상태", look: "office-do" },
] as const;

export default function JKStoryPreview() {
  const [selected, setSelected] = useState(0);
  const map = useMemo(() => buildOfficeEnvironment("trading"), []);
  const seats = useMemo(() => {
    const snapshot = tiledSnapshot(map);
    const blocked = new Set(snapshot.blocked);
    return deskSeatLabels(
      snapshot.objects,
      (col, row) => !blocked.has(`${col},${row}`),
      () => false,
    ).slice(0, STAFF.length);
  }, [map]);
  const actors = useMemo<ActorSnapshot[]>(
    () => STAFF.map((member, index) => ({
      id: `jk-preview-${index}`,
      name: member.name,
      kind: "npc",
      x: ((seats[index]?.col ?? 6 + index * 3) + 0.5) * 32,
      y: ((seats[index]?.row ?? 7) + 0.5) * 32,
      direction: "down",
      walking: false,
      appearance: { officeLookId: member.look },
      phase: "idle",
    })),
    [seats],
  );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col bg-[#f7f6f1] text-[#26352f]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dddcd4] bg-[#fffefa] px-5 py-3">
        <div>
          <h1 className="text-lg font-bold">JK Story Virtual 3D</h1>
          <p className="text-sm text-[#637169]">DeskRPG 기반 AI 사무실 · 시험 배치</p>
        </div>
        <span className="rounded-full bg-[#e7efe9] px-3 py-1 text-sm text-[#345847]">원본 3D 지도 사용</span>
      </header>
      <div className="grid min-h-[640px] flex-1 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
        <aside className="border-r border-[#e2e3dc] bg-[#fffefa] p-4">
          <h2 className="mb-4 font-semibold">AI 직원</h2>
          <div className="space-y-2">
            {STAFF.map((member, index) => (
              <button key={member.name} type="button" onClick={() => setSelected(index)}
                aria-pressed={selected === index}
                className={`w-full rounded-lg border p-3 text-left ${selected === index ? "border-[#608f74] bg-[#eaf2e9]" : "border-[#e4e6e0] bg-white hover:bg-[#f3f5ef]"}`}>
                <strong className="block text-sm">{member.name}</strong>
                <span className="mt-1 block text-xs text-[#62716a]">{member.role}</span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-[#69776f]">캐릭터는 시험 배치입니다. 실제 직원 등록과 업무 수행에는 Hermes 프로필 연결이 필요합니다.</p>
        </aside>
        <main className="relative min-h-[520px] bg-[#eeeee7]" aria-label="JKSTORY 3D 사무실 지도">
          <ThreeMapPreview map={map} actors={actors} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-[#e3e2d9] bg-[#fffefa]/95 px-3 py-2 shadow-sm">
            <strong className="text-sm">JKSTORY AI 협업실</strong>
            <div className="text-xs text-[#67756c]">종합상사 지도 · 회의 공간 · 개인 업무석</div>
          </div>
        </main>
        <aside className="border-l border-[#e2e3dc] bg-[#fffefa] p-4">
          <h2 className="mb-4 font-semibold">직원 정보</h2>
          <div className="rounded-xl border border-[#e0e6dc] bg-white p-4">
            <h3 className="text-lg font-bold">{STAFF[selected].name}</h3>
            <p className="mt-2 text-sm">{STAFF[selected].role}</p>
            <p className="mt-4 rounded-md bg-[#f5f2e9] p-3 text-xs leading-5 text-[#786b4e]">연결 대기 · 실제 업무 지시와 상태 표시 준비 중</p>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#69776f]">지도 확대·축소와 회전으로 공간을 살펴볼 수 있습니다. 이 화면은 기존 운영 데이터에 접속하지 않습니다.</p>
        </aside>
      </div>
    </div>
  );
}
