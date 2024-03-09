import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // clerk 홈페이지에서 내 webhooks탭에서 내 Endpoint URL에 설정한 값
  publicRoutes: ['/api/webhooks/clerk']
});
 
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};