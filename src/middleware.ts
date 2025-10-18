import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";

export default authMiddleware();

export const config = { matcher: ['/((?!_next|favicon.ico|.*\\.png).*)',] };