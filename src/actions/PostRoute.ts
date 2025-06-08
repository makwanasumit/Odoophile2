"use server"

import { redirect } from "next/navigation"

export default async function PostRoute() {

    return redirect("/posts/page/1")
}