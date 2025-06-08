import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'

import type { Header } from '@/payload-types'
import { getUserData } from '@/actions/getUserData'

import { getPayload } from 'payload'
import configPromise from '@payload-config'



export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()

  const sessionUser = await getUserData()

  const payload = await getPayload({ config: configPromise })

  const user = await payload.find({
    collection: 'profiles',
    where: {
      user: {
        equals: sessionUser?.id
      },

    }
  })



  return <HeaderClient data={headerData} user={user} />
}



