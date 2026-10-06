# JKSTORY BPMS 병행 개발 기준

## 프로젝트 경계

| 프로젝트 | 현재 역할 | 주소 |
| --- | --- | --- |
| 정산관리 DEV | 정산서, 단가, 확정, 이력 개발 | https://jkstory-settlement-dev.koreamod2011.chatgpt.site |
| 기존 BPMS | 작업비, 택배비, 현장 및 창고운영 개발 | https://jkstory-work-matching.koreamod2011.chatgpt.site |
| JK Story Virtual 3D | 대표 지시, 담당 배정, 검증 흐름과 BPMS 통합 실험 | http://127.0.0.1:3000/jkstory-preview/bpms |

각 프로젝트는 별도로 개발하고 배포한다. 3D 화면의 링크는 기존 화면을 여는 용도이며 데이터를 동기화하지 않는다. 개발 중인 정산 화면과 정식 정산 화면을 혼동하지 않는다.

## BPMS 개발실 첫 단계

- 3D 사무실에서 BPMS 개발실로 이동한다.
- 정산, 작업비, 택배비, 재고·WMS, 현장업무, AI 검증 업무를 등록한다.
- 김포센터, 인천1센터, 공통으로 나누고 Codex, Claude Code, Hermes, 대표 검토 담당을 표시한다.
- 대기 → 진행 → 검토 → 완료 상태를 시험한다.
- 기록은 현재 브라우저의 localStorage에만 남는다. 고객 정보와 운영 원본을 입력하지 않는다.

## 공용 데이터 계약을 정할 때 필요한 키

- 조직: center_id, client_id, brand_id, alias_id, product_code
- 원본: source_system, source_file_id, source_row_id, imported_at, snapshot_date
- 업무: work_id, category, owner, status, requested_at, evidence_refs, reviewer, approved_at
- 금액: rate_version, quantity, unit_price, supply_amount, vat_amount, total_amount
- 추적: correlation_id, source_version, rule_version, changed_by, changed_at

원본 보존, 재업로드 교체 이력, 합계 대조, 승인 이력, 중복 처리 방지를 실제 API 연결의 선행 조건으로 둔다. 센터와 화주사 식별자가 합의되기 전에는 한 프로젝트의 정산값을 다른 프로젝트에서 자동 변경하지 않는다.

## 다음 구현 순서

1. 세 프로젝트의 센터·화주사·브랜드·상품 식별자 표를 맞춘다.
2. 읽기 전용 API로 작업비·택배비·재고·정산 요약을 3D 개발실에 보여준다.
3. 원본 수량과 금액의 차이를 자동 검증하고 근거 행으로 이동한다.
4. 대표 지시 → 담당 배정 → 실행 → 검토 → 승인 흐름을 공용 저장소에 기록한다.
5. 권한과 감사 로그를 검증한 뒤 승인된 쓰기 작업만 연결한다.

이 순서는 구현 계획이다. 현재 화면은 실제 API, 공용 DB, AI 실행에 연결되어 있지 않다.
