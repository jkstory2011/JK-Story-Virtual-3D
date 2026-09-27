"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
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
const TEAM_MEMBERS = [
  { id: "SEC-01", name: "JK 전담비서", team: "대표 직속", duty: "지시 접수 · 배정 · 결과 보고", look: "office-ha" },
  { id: "OPS-01", name: "업무 분석관", team: "Codex 팀", duty: "업무 흐름 · 수용 기준", look: "office-jun" },
  { id: "QA-01", name: "품질 검증관", team: "Codex 팀", duty: "원본 대조 · 결과 검증", look: "office-min" },
  { id: "DEV-01", name: "화면 개발자", team: "Claude Code 팀", duty: "3D · 웹 · PDA 화면", look: "office-do" },
  { id: "INT-01", name: "연동 개발자", team: "Claude Code 팀", duty: "API · 저장소 · 인증", look: "office-ha" },
  { id: "COORD-01", name: "업무 배정관", team: "Hermes 팀", duty: "대기열 · 일정 · 재시도", look: "office-jun" },
  { id: "MON-01", name: "운영 모니터", team: "Hermes 팀", duty: "실행 로그 · 실패 감지", look: "office-min" },
] as const;

type TaskStatus = "대기" | "진행" | "검토" | "완료";
type TrialTask = { id: string; title: string; assignee: string; status: TaskStatus; updatedAt: string };
type TrialEvent = { id: string; message: string; at: string };
const STORAGE_KEY = "jkstory-virtual-3d-trial-v1";
const STATUSES: TaskStatus[] = ["대기", "진행", "검토", "완료"];

function readTrial(): { tasks: TrialTask[]; events: TrialEvent[] } {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      tasks: Array.isArray(value.tasks) ? value.tasks.filter((task: TrialTask) =>
        task && typeof task.id === "string" && typeof task.title === "string" &&
        STAFF.some((member) => member.name === task.assignee) && STATUSES.includes(task.status)) : [],
      events: Array.isArray(value.events) ? value.events.filter((event: TrialEvent) =>
        event && typeof event.message === "string" && typeof event.at === "string").slice(0, 30) : [],
    };
  } catch {
    return { tasks: [], events: [] };
  }
}

export default function JKStoryPreview() {
  const [selected, setSelected] = useState(0);
  const [tasks, setTasks] = useState<TrialTask[]>([]);
  const [events, setEvents] = useState<TrialEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState<string>(STAFF[0].name);
  useEffect(() => {
    const trial = readTrial();
    setTasks(trial.tasks);
    setEvents(trial.events);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, events }));
  }, [tasks, events, loaded]);
  function log(message: string) {
    setEvents((previous) => [{ id: crypto.randomUUID(), message, at: new Date().toISOString() }, ...previous].slice(0, 30));
  }
  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || trimmed.length > 120) return;
    setTasks((previous) => [{ id: crypto.randomUUID(), title: trimmed, assignee, status: "대기", updatedAt: new Date().toISOString() }, ...previous]);
    log(`${assignee}에게 업무 등록: ${trimmed}`);
    setTitle("");
  }
  function changeStatus(task: TrialTask, status: TaskStatus) {
    if (task.status === status) return;
    setTasks((previous) => previous.map((item) => item.id === task.id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
    log(`${task.assignee} · ${task.title}: ${task.status} → ${status}`);
  }
  const map = useMemo(() => buildOfficeEnvironment("trading"), []);
  const seats = useMemo(() => {
    const snapshot = tiledSnapshot(map);
    const blocked = new Set(snapshot.blocked);
    return deskSeatLabels(
      snapshot.objects,
      (col, row) => !blocked.has(`${col},${row}`),
      () => false,
    ).slice(0, STAFF.length + TEAM_MEMBERS.length);
  }, [map]);
  const actors = useMemo<ActorSnapshot[]>(
    () => [...STAFF, ...TEAM_MEMBERS].map((member, index) => ({
      id: `jk-preview-${index}`,
      name: member.name,
      kind: "npc",
      x: ((seats[index]?.col ?? 6 + index * 2) + 0.5) * 32,
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
          <p className="mt-5 text-xs leading-5 text-[#69776f]">캐릭터는 시험 배치입니다. 업무 상태도 수동 시험 기록이며 AI에게 실제 지시가 전달되지는 않습니다.</p>
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
            <p className="mt-4 rounded-md bg-[#f5f2e9] p-3 text-xs leading-5 text-[#786b4e]">연결 대기 · 실제 AI 실행 없음</p>
            <p className="mt-3 text-sm">시험 업무 {tasks.filter((task) => task.assignee === STAFF[selected].name).length}건</p>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#69776f]">지도 확대·축소와 회전으로 공간을 살펴볼 수 있습니다. 이 화면은 기존 운영 데이터에 접속하지 않습니다.</p>
        </aside>
      </div>
      <section className="border-t border-[#dddcd4] bg-[#f7f6f1] px-5 py-6" aria-label="가상 직원 배치표">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-lg font-bold">가상 직원 배치표</h2>
          <p className="mt-1 text-sm text-[#637169]">전담비서 1명 · 핵심 운영팀 산하 실무 직원 6명. 현재는 역할 프로필이며 자동 실행 연결 대기 중입니다.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM_MEMBERS.map((member) => <article key={member.id} className="rounded-xl border border-[#e0e6dc] bg-white p-4">
              <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#608f74]">{member.id}</span><span className="rounded-full bg-[#f5f2e9] px-2 py-1 text-[11px] text-[#786b4e]">연결 대기</span></div>
              <h3 className="mt-2 font-bold">{member.name}</h3>
              <p className="mt-1 text-xs text-[#637169]">{member.team}</p>
              <p className="mt-3 text-sm">{member.duty}</p>
            </article>)}
          </div>
        </div>
      </section>
      <section className="border-t border-[#dddcd4] bg-[#fffefa] px-5 py-6" aria-label="시험운영 업무판">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-lg font-bold">JKSTORY 시험운영 업무판</h2>
          <p className="mt-1 text-sm text-[#637169]">업무 흐름을 수동으로 검증합니다. 기록은 이 브라우저에만 저장되며 다른 기기와 공유되지 않습니다. 고객 정보는 입력하지 마세요.</p>
          <form onSubmit={addTask} className="mt-4 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="trial-title">시험 업무명</label>
            <input id="trial-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required placeholder="예: 출고 요청 접수 흐름 확인" className="min-w-[220px] flex-1 rounded-lg border border-[#cfd8cf] bg-white px-3 py-2 text-sm" />
            <label className="sr-only" htmlFor="trial-assignee">담당 AI</label>
            <select id="trial-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} className="rounded-lg border border-[#cfd8cf] bg-white px-3 py-2 text-sm">
              {STAFF.map((member) => <option key={member.name}>{member.name}</option>)}
            </select>
            <button type="submit" className="rounded-lg bg-[#345847] px-4 py-2 text-sm font-semibold text-white">시험 업무 등록</button>
          </form>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <div>
              <h3 className="font-semibold">업무 목록 ({tasks.length})</h3>
              {tasks.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-[#cfd8cf] p-5 text-sm">첫 시험 업무를 등록해 담당자와 상태 변경 흐름을 확인하세요.</p> :
                <ul className="mt-3 space-y-2">{tasks.map((task) => <li key={task.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e0e6dc] bg-white p-3">
                  <div className="min-w-[180px] flex-1"><strong className="block text-sm">{task.title}</strong><span className="text-xs text-[#637169]">{task.assignee} · {new Date(task.updatedAt).toLocaleString("ko-KR")}</span></div>
                  <label className="sr-only" htmlFor={`status-${task.id}`}>{task.title} 상태</label>
                  <select id={`status-${task.id}`} value={task.status} onChange={(event) => changeStatus(task, event.target.value as TaskStatus)} className="rounded-md border border-[#cfd8cf] bg-white px-2 py-1 text-sm">
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </li>)}</ul>}
            </div>
            <div><h3 className="font-semibold">변경 기록</h3><ol className="mt-3 max-h-64 space-y-2 overflow-y-auto text-xs text-[#52645a]" aria-live="polite">
              {events.map((event) => <li key={event.id} className="rounded-lg bg-[#f3f5ef] p-2"><time dateTime={event.at}>{new Date(event.at).toLocaleString("ko-KR")}</time><p className="mt-1 break-words">{event.message}</p></li>)}
            </ol></div>
          </div>
        </div>
      </section>
    </div>
  );
}
