import type { Metadata } from "next";
import JKStoryPreview from "./preview";

export const metadata: Metadata = {
  title: "JK Story Virtual 3D | 시험 사무실",
  description: "DeskRPG 원본 3D 지도를 이용한 JKSTORY AI 사무실 시험 화면",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <JKStoryPreview />;
}
