// ============================================================================
// API 응답 스키마 정의
//
// 모든 API 엔드포인트의 요청/응답 타입을 중앙에서 관리합니다.
// OpenAPI 문서 생성에도 사용됩니다.
// ============================================================================

// ============================================================================
// 기본 응답 형식
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  requestId: string;
}

// ============================================================================
// 감사 로그 스키마
// ============================================================================
export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changes: Record<string, { old: any; new: any }>;
  createdBy: string;
  source: string; // 'api', 'cli', 'ui', etc.
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetAuditLogsRequest {
  tableName?: string;
  recordId?: string;
  action?: 'CREATE' | 'UPDATE' | 'DELETE';
  fromDate?: string; // ISO 8601
  toDate?: string; // ISO 8601
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
}

export interface GetAuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// 기술 검색 스키마
// ============================================================================
export interface SearchSkillsRequest {
  query: string;
  domain?: string;
  limit?: number;
  offset?: number;
}

export interface Skill {
  id: string;
  name: string;
  domain: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchSkillsResponse {
  skills: Skill[];
  total: number;
  query: string;
}

// ============================================================================
// AI 매칭 스키마
// ============================================================================
export interface MatchSkillsRequest {
  description: string;
  domain?: string;
  topN?: number; // default: 5
}

export interface SkillMatch {
  skillId: string;
  skillName: string;
  score: number; // 0-1
  reasoning: string;
}

export interface MatchSkillsResponse {
  matches: SkillMatch[];
  processingTimeMs: number;
}

// ============================================================================
// 시간별 데이터 스키마
// ============================================================================
export interface GetSkillVersionsRequest {
  recordId: string;
  fromDate?: string; // ISO 8601
  toDate?: string; // ISO 8601
}

export interface SkillVersion {
  version: number;
  validFrom: string;
  validTo: string | null;
  data: Record<string, any>;
  changedBy: string;
  changeReason?: string;
}

export interface GetSkillVersionsResponse {
  recordId: string;
  versions: SkillVersion[];
  current: SkillVersion;
}

// ============================================================================
// 상태 코드 정의
// ============================================================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// 에러 코드 정의
// ============================================================================
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
