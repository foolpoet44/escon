// ============================================================================
// /docs - API 문서 페이지
//
// Swagger UI를 사용하여 API를 시각적으로 문서화합니다.
// ============================================================================

import Head from 'next/head';

export const metadata = {
  title: 'ESCON API Documentation',
  description: 'Interactive API documentation for ESCON',
};

export default function DocsPage() {
  return (
    <>
      <Head>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.js" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css"
        />
      </Head>
      <div id="swagger-ui" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }} />
      <style dangerouslySetInnerHTML={{__html: `
        .swagger-ui { font-family: sans-serif; }
        .swagger-ui .topbar { background-color: #1a1a1a; }
      `}} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              // SwaggerUIBundle 초기화
              const ui = SwaggerUIBundle({
                url: "/api/docs",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
              });
              window.ui = ui;
            };
          `,
        }}
      />
    </>
  );
}
