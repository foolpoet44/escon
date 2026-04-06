// ============================================================================
// OpenAPI 3.0 스키마 생성
//
// API 문서를 Swagger UI에서 렌더링하기 위한 OpenAPI 스키마를 생성합니다.
// ============================================================================

export const OPENAPI_SPEC = {
  openapi: '3.0.0',
  info: {
    title: 'ESCON API',
    version: '0.1.0',
    description:
      'Robotics-focused skill map API for Smart Factory automation',
    contact: {
      name: 'ESCON Team',
    },
  },
  servers: [
    {
      url: 'https://escon.vercel.app/api',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development',
    },
  ],
  paths: {
    '/audit-logs': {
      get: {
        summary: '감사 로그 조회',
        description: '감사 로그를 조회합니다. 테이블명, 레코드 ID, 액션 타입으로 필터링할 수 있습니다.',
        operationId: 'getAuditLogs',
        tags: ['Audit'],
        parameters: [
          {
            name: 'tableName',
            in: 'query',
            description: '테이블 이름 (예: skills)',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'recordId',
            in: 'query',
            description: '레코드 ID',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'action',
            in: 'query',
            description: '액션 타입',
            schema: {
              type: 'string',
              enum: ['CREATE', 'UPDATE', 'DELETE'],
            },
          },
          {
            name: 'fromDate',
            in: 'query',
            description: '시작 날짜 (ISO 8601)',
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
          {
            name: 'toDate',
            in: 'query',
            description: '종료 날짜 (ISO 8601)',
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: '페이지 크기 (기본값: 20, 최대: 100)',
            schema: {
              type: 'integer',
              default: 20,
              maximum: 100,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: '페이지 오프셋 (기본값: 0)',
            schema: {
              type: 'integer',
              default: 0,
            },
          },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      type: 'object',
                      properties: {
                        logs: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              tableName: { type: 'string' },
                              recordId: { type: 'string' },
                              action: {
                                type: 'string',
                                enum: ['CREATE', 'UPDATE', 'DELETE'],
                              },
                              changes: { type: 'object' },
                              createdBy: { type: 'string' },
                              source: { type: 'string' },
                              createdAt: {
                                type: 'string',
                                format: 'date-time',
                              },
                            },
                          },
                        },
                        total: { type: 'integer' },
                        limit: { type: 'integer' },
                        offset: { type: 'integer' },
                      },
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    requestId: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false,
                    },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string' },
                        message: { type: 'string' },
                        details: { type: 'object' },
                      },
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    requestId: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
