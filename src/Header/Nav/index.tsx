'use client'

import React from 'react'

import type { Header as HeaderType, Profile } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import AuthLink from '../components/AuthLink'
import { PaginatedDocs } from 'payload'


type Props = {
  data: HeaderType,
  user: PaginatedDocs<Profile>
}

export const HeaderNav: React.FC<Props> = ({ data, user }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <AuthLink user={user} />
    </nav>
  )
}
