import { getUserData } from "@/actions/getUserData";
import EditProfile from "./components/EditProfile";
import configPromise from '@payload-config';
import { getPayload } from 'payload';

export default async function Page() {

    const profile = await getUserData()


    const payload = await getPayload({ config: configPromise })

    const data = await payload.find({
        collection: 'profiles',
        where: {
            user: {
                equals: profile?.id
            }
        }
    })
 



    return (
        <div className="relative flex flex-[1] flex-col items-center py-2 px-4 sm:px-6 lg:px-8 max-w-none">
            <EditProfile data={data} />
        </div>
    );
}