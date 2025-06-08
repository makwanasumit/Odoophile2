"use server"

import { headers } from "next/headers";
import { redirect } from "next/navigation";



export default async function CheckAuth(pathname: string) {


    const headerList = await headers(); // No need to await headers()
    const cookieHeader = headerList.get("cookie");

    if (!cookieHeader) {
        return { success: false, error: "No cookies found" };
    }

    const match = cookieHeader.match(/(?:^|;\s*)payload-token=([^;]*)/);
    const payloadToken = match ? match[1] : null;

    if (!payloadToken) {
        return redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    } else {
        return redirect("/new");
    }
}
