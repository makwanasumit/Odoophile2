'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Profile } from '@/payload-types'

import { HeaderNav } from './Nav'
import { PaginatedDocs } from 'payload'
import Logo from '@/components/Logo/Logo'

interface HeaderClientProps {
  user: PaginatedDocs<Profile>
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, user }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between items-center">
        <Link href="/" onClick={() => router.refresh()}>
          <Logo className='lg:h-10 md:h-8 sm:h-6 h-6 flex items-center ' />
        </Link>
        <HeaderNav data={data} user={user} />
      </div>
    </header>
  )
}
