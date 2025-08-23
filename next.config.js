/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['res.cloudinary.com'], // ✅ Cloudinary 이미지 도메인 허용
  },



  
  // ✅ Next.js API 요청 프록시 설정
  // - 프론트엔드 코드에서는 항상 /api/... 형태로 요청을 보낼 수 있게 함
  //   예) fetch("/api/auth/local")  →  실제 요청은 Strapi 서버로 전달
  // - 이렇게 하면 프론트 코드에서 API 서버 주소(https://api.dongdong-ui.com)를 직접 쓰지 않아도 됨
  // - 로컬 개발 환경과 배포 환경에서 동일한 코드로 동작 (환경에 맞게 destination 자동 적용)
  // - CORS 문제도 줄어들고, API 서버 주소를 한 곳에서만 관리할 수 있어 유지보수성이 높아짐
  async rewrites() {
    return [
      {
        source: "/api/:path*",             // 프론트에서 /api/로 시작하는 요청은
        destination: `${process.env.NEXT_PUBLIC_API_SERVER_URL}/:path*`, // Strapi 서버로 전달
      },
    ];
  },
}

module.exports = nextConfig