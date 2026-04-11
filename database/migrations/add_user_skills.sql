-- ESCON: 사용자별 스킬 수준 관리 테이블 추가
-- 가이드 주신 구조를 기반으로 실제 skills 테이블과 연결되도록 최적화했습니다.

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE, -- skill_node_id 대신 실제 테이블명인 skills를 참조합니다.
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id) -- 동일 사용자가 동일 스킬을 중복 등록하는 것을 방지합니다.
);

-- 빠른 조회를 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
