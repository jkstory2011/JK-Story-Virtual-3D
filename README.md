# JK Story Virtual 3D

DeskRPG의 실제 3D 지도와 캐릭터 렌더러를 기반으로 만드는 JKSTORY AI 사무실입니다.

## 현재 제공하는 화면

- `/jkstory-preview`: 종합상사 3D 지도와 Codex·Claude Code·Hermes 캐릭터의 시험 배치
- 직원별 담당 역할 표시, 원본 지도 확대·회전
- 업무 시스템과 분리된 공개 시연 화면. 실제 에이전트 로그인이나 업무 실행은 아직 연결되지 않았습니다.

## 로컬 시험

Node.js 20 이상, npm, Git이 필요합니다. Linux/macOS 또는 WSL의 Bash에서:

```bash
git clone https://github.com/jkstory2011/JK-Story-Virtual-3D.git
cd JK-Story-Virtual-3D
bash scripts/bootstrap.sh
cd .runtime/deskrpg
npm run setup:lite
node --import tsx dev-server.ts
```

브라우저에서 `http://localhost:3000/jkstory-preview`를 엽니다. 로컬 데모 DB와 `.env.local`은 `.runtime/deskrpg`에 생성됩니다. 인증된 정식 사무실은 DeskRPG의 로그인 후 채널·Hermes 연결 흐름을 따릅니다.

## 구조와 출처

`scripts/bootstrap.sh`는 [dandacompany/deskrpg](https://github.com/dandacompany/deskrpg)의 지정된 커밋을 복제하고 이 저장소의 `overlay/` 파일을 적용합니다. 원본 DeskRPG의 저작권·고지·[Sustainable Use License](https://github.com/dandacompany/deskrpg/blob/master/LICENSE.md)는 원본대로 유지됩니다. `overlay/`는 JKSTORY 시험 기능을 추가하는 변경분입니다. 이 프로젝트는 회사 내부 업무 목적의 사용을 전제로 합니다.

## 시험 상태

- TypeScript 검사 통과
- `/jkstory-preview` HTTP 200 확인
- 브라우저 WebGL 렌더링과 캐릭터 동작은 아직 실제 브라우저에서 검증되지 않았습니다.
- Codex와 Claude Code 구독 계정을 Hermes의 모델 제공자로 직접 연결했다고 주장하지 않습니다.

다음 단계는 시험 서버에 배포하여 WebGL 화면, 캐릭터 좌석, 로그인, Hermes 프로필 및 작업 흐름을 각각 검증하는 것입니다.
