// /src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 1. 앞으로 우리 앱에서 사용할 가상의 API 경로 (이름은 상관없음)
    createProxyMiddleware({
      target: 'https://apis.data.go.kr/B551011/KorService2', // 2. 실제 API 서버의 전체 기본 주소
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // 3. '/api' 경로를 제거하고 서버로 요청
      },
    })
  );
};