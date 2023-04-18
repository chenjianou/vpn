import { type NextPage } from 'next'
import Head from 'next/head'
import { signIn, signOut, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

const AutoImport: React.FC<{
  userId: string
}> = ({ userId }) => {
  const [clash, setClash] = useState('')
  const [shadowrocket, setShadowrocket] = useState('')

  useEffect(() => {
    const clashUrl = `${location.origin}/api/vpn/clash/${userId}`
    setClash(`clash://install-config?url=${encodeURIComponent(clashUrl)}&name=FreeVPN`)

    // const shadowrocketUrl = `${location.origin}/api/vpn/shadowrocket/${userId}`
    setShadowrocket(`shadowrocket://add/sub://${window.btoa(clashUrl)}?remark=FreeVPN`)
  }, [])

  const apps = [
    { name: 'Clash', url: clash },
    { name: 'Shadowrocket', url: shadowrocket },
  ]

  return (
    <>
      {
        apps.map(app => (<a
          className="rounded-full text-center bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          href={app.url}
        >{app.name}</a>))
      }
    </>
  )
}

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>

      <div className='flex flex-col gap-2'>
        { sessionData ? (<AutoImport userId={sessionData.user.id} />) : (<></>) }

        <button
          className="rounded-full text-center bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? 'Sign out' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>FreeVPN</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex overflow-auto min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <AuthShowcase />
      </main>
    </>
  )
}

export default Home
