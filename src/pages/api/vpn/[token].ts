import { type NextApiRequest, type NextApiResponse } from 'next'
import { TRPCError } from '@trpc/server'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import type { DageAccount } from '@prisma/client'
import { createTRPCContext } from '@/server/api/trpc'
import { appRouter } from '@/server/api/root'

async function vpnRouter(req: NextApiRequest, res: NextApiResponse) {
  // 创建上下文和调用者
  const ctx = await createTRPCContext({ req, res })
  const caller = appRouter.createCaller(ctx)
  try {
    const { token } = req.query
    const registerData = await caller.vpn.register({ email: `${Math.random().toString(36).slice(-6)}@qq.com`, password: 'Cjok1234', userId: token as string })
    if (registerData.code !== 200) return res.status(200).json({ code: 500, message: '不存在' })
    const { email, password } = registerData.data as DageAccount
    const vpnConfig = await caller.vpn.getNode({ email, password })
    // res.status(200).json(vpnConfig);
    res.status(200).send(vpnConfig)
  }
  catch (cause) {
    if (cause instanceof TRPCError) {
      // 一个 tRPC 错误在此发生
      const httpCode = getHTTPStatusCodeFromError(cause)
      return res.status(httpCode).json(cause)
    }
    // 另一个错误在此发生
    console.error(cause)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export default vpnRouter
