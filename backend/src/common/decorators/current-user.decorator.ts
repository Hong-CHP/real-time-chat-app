import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/** 
 * ctx（ExecutionContext）
	当前请求的“执行上下文”

	它包含：
	HTTP 请求
	WebSocket
	RPC（微服务）
*/
export const CurrentUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext)=>{
		const request = ctx.switchToHttp().getRequest();
		return request.user;
	}
)