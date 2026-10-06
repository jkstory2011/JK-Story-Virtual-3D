"use client";

import { useEffect, useState, type FormEvent } from "react";

type Stage = "대기" | "진행" | "검토" | "완료";
type WorkItem = {
  id: string;
  title: string;
  area: string;
  center: string;
  owner: string;
  stage: Stage;
  updatedAt: string;
};

const KEY = "jkstory-virtual-bpms-dev-v1";
const STAGES: Stage[] = ["대기", "진행", "검토", "완료"];
const AREAS = ["정산", "작업비", "택배비", "재고·WMS", "현장업무", "AI 검증"];
const CENTERS = ["공통", "김포센터", "인천1센터"];
const OWNERS = ["Codex", "Claude Code", "Hermes", "대표 검토"];
const PROJECTS = [
  {
    name: "정산관리 개발",
    url: "https://jkstory-settlement-dev.koreamod2011.chatgpt.site",
    detail: "정산서·단가·확정·변경 이력 개발",
  },
  {
    name: "기존 BPMS",
    url: "https://jkstory-work-matching.koreamod2011.chatgpt.site",
    detail: "작업비·택배비·창고운영 개발",
  },
  {
    name: "정산관리 정식",
    url: "https://jkstory-settlement.koreamod2011.chatgpt.site",
    detail: "정식 화면 확인",
  },
] as const;

function readItems(): WorkItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item): item is WorkItem =>
      item && typeof item.id === "string" && typeof item.title === "string" &&
      AREAS.includes(item.area) && CENTERS.includes(item.center) &&
      OWNERS.includes(item.owner) && STAGES.includes(item.stage) &&
      typeof item.updatedAt === "string");
  } catch {
    return [];
  }
}

export default function BPMSDevelopmentPage() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [center, setCenter] = useState(CENTERS[0]);
  const [owner, setOwner] = useState(OWNERS[0]);
  const [filter, setFilter] = useState("전체");

  useEffect(() => {
    setItems(readItems());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = title.trim();
    if (!name || name.length > 120) return;
    setItems((previous) => [{
      id: crypto.randomUUID(), title: name, area, center, owner,
      stage: "대기", updatedAt: new Date().toISOString(),
    }, ...previous]);
    setTitle("");
  }

  function updateStage(id: string, stage: Stage) {
    setItems((previous) => previous.map((item) =>
      item.id === id ? { ...item, stage, updatedAt: new Date().toISOString() } : item));
  }

  const shown = filter === "전체" ? items : items.filter((item) => item.center === filter);
  return (
    <div className="min-h-screen bg-[#f5f6f2] px-4 py-6 text-[#26352f] md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <a href="/jkstory-preview" className="text-sm font-medium text-[#345847] underline">← 3D 사무실</a>
            <h1 className="mt-2 text-2xl font-bold">JKSTORY BPMS 개발실</h1>
            <p className="mt-1 text-sm text-[#637169]">정산·창고운영·AI 업무 흐름을 함께 설계하는 시험 공간</p>
          </div>
          <span className="rounded-full bg-[#e7efe9] px-3 py-1 text-xs font-semibold text-[#345847]">개발 중 · 로컬 시험 기록</span>
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-3" aria-label="기존 프로젝트">
          {PROJECTS.map((project) => (
            <a key={project.name} href={project.url} target="_blank" rel="noopener noreferrer"
              className="rounded-xl border border-[#dce4da] bg-white p-4 shadow-sm hover:border-[#608f74]">
              <strong className="block">{project.name} ↗</strong>
              <span className="mt-2 block text-sm text-[#637169]">{project.detail}</span>
              <span className="mt-3 block text-xs text-[#6c785f]">기존 프로젝트 열기 · 별도 개발</span>
            </a>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
          <div className="rounded-xl border border-[#dce4da] bg-white p-4">
            <h2 className="font-semibold">업무 영역</h2>
            <p className="mt-1 text-xs text-[#637169]">센터별 운영과 정산 흐름을 한 작업 목록에서 시험합니다.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {AREAS.map((entry) => <li key={entry} className="rounded-lg bg-[#f1f5f0] px-3 py-2">{entry}</li>)}
            </ul>
          </div>

          <div className="rounded-xl border border-[#dce4da] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold">3D 사무실 BPMS 개발 업무</h2>
                <p className="mt-1 text-xs text-[#637169]">업무를 등록하고 담당·상태를 시험합니다.</p>
              </div>
              <label className="text-xs text-[#637169]">센터
                <select value={filter} onChange={(event) => setFilter(event.target.value)}
                  className="ml-2 rounded-md border border-[#cbd8ca] p-2 text-sm">
                  {["전체", ...CENTERS].map((entry) => <option key={entry}>{entry}</option>)}
                </select>
              </label>
            </div>
            <form onSubmit={addItem} className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="sm:col-span-2 text-xs font-medium">개발 업무
                <input value={title} onChange={(event) => setTitle(event.target.value)}
                  maxLength={120} required placeholder="예: 출고 PCS 합계 대조"
                  className="mt-1 w-full rounded-md border border-[#cbd8ca] p-2 text-sm" />
              </label>
              <label className="text-xs font-medium">영역
                <select value={area} onChange={(event) => setArea(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#cbd8ca] p-2 text-sm">
                  {AREAS.map((entry) => <option key={entry}>{entry}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium">센터
                <select value={center} onChange={(event) => setCenter(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#cbd8ca] p-2 text-sm">
                  {CENTERS.map((entry) => <option key={entry}>{entry}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium">담당
                <select value={owner} onChange={(event) => setOwner(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[#cbd8ca] p-2 text-sm">
                  {OWNERS.map((entry) => <option key={entry}>{entry}</option>)}
                </select>
              </label>
              <button type="submit" className="self-end rounded-md bg-[#345847] p-2 text-sm font-semibold text-white">업무 등록</button>
            </form>
            <div className="mt-5 space-y-2" aria-live="polite">
              {!loaded ? <p className="text-sm">기록을 불러오는 중입니다.</p> :
                shown.length === 0 ? <p className="rounded-lg border border-dashed border-[#cbd8ca] p-4 text-sm text-[#637169]">등록된 개발 업무가 없습니다.</p> :
                shown.map((item) => <article key={item.id} className="rounded-lg border border-[#e0e6dc] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <strong className="block text-sm">{item.title}</strong>
                      <span className="text-xs text-[#637169]">{item.center} · {item.area} · {item.owner}</span>
                    </div>
                    <label className="text-xs text-[#637169]">상태
                      <select value={item.stage} onChange={(event) => updateStage(item.id, event.target.value as Stage)}
                        className="ml-2 rounded-md border border-[#cbd8ca] p-1 text-sm">
                        {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
                      </select>
                    </label>
                  </div>
                  <time className="mt-2 block text-[11px] text-[#849188]" dateTime={item.updatedAt}>
                    {new Date(item.updatedAt).toLocaleString("ko-KR")}
                  </time>
                </article>)}
            </div>
          </div>

          <aside className="rounded-xl border border-[#dce4da] bg-white p-4">
            <h2 className="font-semibold">연결 순서</h2>
            <ol className="mt-3 space-y-3 text-sm text-[#52645a]">
              <li><strong>1. 기준 정리</strong><br />화주사·브랜드·센터·상품·단가를 같은 식별자로 연결</li>
              <li><strong>2. 원본 대조</strong><br />이지어드민·WMS·택배사 자료의 수량과 금액 검증</li>
              <li><strong>3. 업무 실행</strong><br />대표 지시 → 담당 배정 → 실행 → 검토 → 승인</li>
              <li><strong>4. 시스템 연동</strong><br />인증·API·공용 저장소를 준비한 뒤 단계적으로 연결</li>
            </ol>
            <p className="mt-5 rounded-lg bg-[#f5f2e9] p-3 text-xs leading-5 text-[#786b4e]">
              이 화면의 업무 기록은 현재 브라우저에만 저장됩니다. 기존 정산·BPMS 데이터와 자동 동기화하거나 AI가 실행하지는 않습니다. 고객 정보는 입력하지 마세요.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}
