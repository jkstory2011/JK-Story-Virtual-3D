# JK Story Virtual 3D

DeskRPG의 실제 3D 지도와 캐릭터 렌더러를 기반으로 만드는 JKSTORY AI 사무실입니다.

전담비서·Codex·Claude Code·Hermes의 업무 책임과 단계는 [핵심 운영팀 설계안](docs/OPERATING_TEAM.md)에 정리했습니다.
첫 직원 7명의 직책과 보고선은 [직원 채용·배치안](docs/STAFFING_PLAN.md)에 정리했습니다.

## 현재 제공하는 화면

- `/jkstory-preview`: 하나의 3D 지도에 연결된 운영 사무실과 대표실, 대표·전담비서·핵심 운영팀·실무 직원 캐릭터의 시험 배치. 상단 버튼은 지도를 교체하지 않고 같은 지도에서 카메라만 이동합니다.
- 직원별 담당 역할 표시, 원본 지도 확대·회전
- 대표실 이동 버튼은 같은 지도 안에서 카메라만 옮기고, `전담비서 대표실 호출` 버튼으로 열린 출입구를 통한 직원 이동을 시험합니다. 이는 화면 시연이며 실제 AI 업무 수행은 아닙니다.
- 시험운영 업무판: 업무 등록, 담당 AI 선택, 대기·진행·검토·완료 상태 변경, 변경 기록
- 업무와 기록은 이 브라우저에만 보관됩니다. 실제 AI 실행이나 기기 간 동기화는 지원하지 않으며 고객 정보 입력은 피하세요.
- 업무 시스템과 분리된 공개 시연 화면. 실제 에이전트 로그인이나 업무 실행은 아직 연결되지 않았습니다.

## Windows PC에서 로컬 시험

1. [Node.js 22 LTS](https://nodejs.org/en/download)와 [Git for Windows](https://git-scm.com/install/windows)를 설치하고 **명령 프롬프트를 새로 엽니다**.
2. 처음 한 번만 아래 명령으로 저장소를 받습니다. Windows 재설치와 분리해 보관할 수 있도록 `G:\JKStory` 폴더를 사용합니다. G: 드라이브가 연결되어 있어야 합니다.

```bat
cd /d G:\
mkdir JKStory
cd JKStory
git clone https://github.com/jkstory2011/JK-Story-Virtual-3D.git
cd JK-Story-Virtual-3D
```

3. 처음 한 번 `G:\JKStory\JK-Story-Virtual-3D\start-preview.cmd`를 더블클릭합니다. 최신 코드 받기, 최초 설치, 로컬 DB 준비, 서버 실행을 처리하며 서버가 준비되면 브라우저를 엽니다. 처음 실행은 설치 시간이 걸립니다. 실행 중 바탕화면과 시작 메뉴에 **JK Story Virtual 3D** 바로가기도 자동으로 만듭니다. 이후에는 이 바로가기를 더블클릭하면 됩니다.

이미 `C:\JKStory\JK-Story-Virtual-3D`에 설치했다면 실행 창을 닫고 파일 탐색기에서 `JK-Story-Virtual-3D` 폴더 전체를 `G:\JKStory\`로 이동한 뒤 G: 드라이브의 `start-preview.cmd`를 실행합니다. 시작 파일과 설치 스크립트는 자신의 위치를 기준으로 경로를 찾으므로 코드 수정은 필요하지 않습니다. 다만 업무판 시험 기록은 브라우저에 저장되어 Windows를 재설치하면 사라질 수 있습니다.

화면 주소는 `http://localhost:3000/jkstory-preview`입니다. 실행 창을 열어 둔 동안만 접속됩니다. 중지하려면 실행 창에서 `Ctrl+C`를 누릅니다. GitHub에 수정된 코드를 반영한 뒤에는 실행 창을 닫고 바탕화면의 **JK Story Virtual 3D** 바로가기를 더블클릭하면 최신 버전을 받을 수 있습니다. 이미 서버가 실행 중이라면 같은 바로가기는 브라우저만 엽니다. 사용 중인 시험 업무 기록은 같은 브라우저의 로컬 저장소에 남습니다.

브라우저에서 연결할 수 없다고 나오면 실행 창에 `Dev server ready on http://localhost:3000`이 표시되었는지 확인하고 `http://127.0.0.1:3000/jkstory-preview`로 다시 접속하세요. `Could not start the office` 또는 `EADDRINUSE` 같은 오류가 보이면 실행 창 마지막 부분을 캡처해 주세요.

## Linux/macOS/WSL에서 로컬 시험

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
- Windows GitHub Actions의 Chromium 브라우저에서 WebGL 렌더링을 확인하고 [화면 캡처](screenshots/jkstory-preview.png)를 저장했습니다.
- Codex와 Claude Code 구독 계정을 Hermes의 모델 제공자로 직접 연결했다고 주장하지 않습니다.

개인정보가 없는 가상 업무로 업무 등록 → 담당 선택 → 상태 변경 → 새로고침 뒤 기록 유지 여부를 확인합니다. 다음 단계는 실제 에이전트 연결과 공용 데이터 저장소입니다.
