import { z } from 'zod'
import axios from 'axios'
import {
  createTRPCRouter,
  publicProcedure,
} from '@/server/api/trpc'
import { env } from '@/env.mjs'

export const vpnRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      }
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany()
  }),
  getSecretMessage: publicProcedure.query(() => {
    return 'you can now see this secret message!'
  }),
  register: publicProcedure.input(z.object({ email: z.string(), password: z.string(), userId: z.string() })).query(async ({ ctx, input }) => {
    if (!input.userId) {
      return {
        code: 500,
        message: '请先登录',
      }
    }
    try {
      let data = await ctx.prisma.dageAccount.findFirst({
        where: { userId: input.userId, expired: false },
      })
      if (!data) {
        await axios.post(`${env.DOMAIN}api/v1/passport/auth/register`, { email: input.email, password: input.password })
        data = await ctx.prisma.dageAccount.create({
          data: {
            email: input.email,
            password: input.password,
            userId: input.userId,
            expired: false,
          },
        })
      }
      return {
        code: 200,
        data,
      }
    }
    catch (error) {
      return {
        code: 500,
        data: JSON.stringify(error),
      }
    }
  }),
  login: publicProcedure.query(async () => {
    const data = await axios.post(`${env.DOMAIN}api/v1/passport/auth/login`, { email: 'chenjianou1@qq.com', password: 'Cjok1234' }).then(res => res.data.data)
    return data
  }),
  getNode: publicProcedure.input(z.object({ email: z.string(), password: z.string() }))
    .query(async ({ input }) => {
      const data = await axios.post(`${env.DOMAIN}api/v1/passport/auth/login`, input).then(res => res.data.data)
      return axios.get(`https://www.dgydgy.com/api/v1/client/subscribe?token=${data.token}`, {
        headers: {
          'User-Agent': 'clash',
        },
      }).then(res => ({
        userInfo: res.headers['subscription-userinfo'],
        data: res.data.replace(/大哥云/g, 'FreeVPN'),
      }))
    }),
})
