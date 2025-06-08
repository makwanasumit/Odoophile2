"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPayload } from '../AuthLink';

const Menu = ({ user, setShowMenu }: { user: UserPayload, setShowMenu: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const router = useRouter();
    const username = user.email?.split("@")[0];

    const handleLogout = async () => {
        await fetch("/api/users/logout", {
            method: "POST",
        });
        window.dispatchEvent(new Event("auth-change"));
        router.push("/login");
    };

    return (
        <div onMouseLeave={() => setShowMenu(false)} className="absolute top-10 right-0 z-50 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-2xl rounded-lg w-56 sm:w-64">
            <ul className="text-sm   text-black dark:text-white ">
                <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => router.push(`/profile/${username}`)}>
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{user.name || username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-200 truncate">{user.email}</p>
                </li>
                <li className="p-3 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Link href="/reading-list" className="block w-full text-left">Reading List</Link>
                </li>
                <li className="p-3 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <Link href="/dashboard" className="block w-full text-left">Dashboard</Link>
                </li>
                <li
                    className="p-3 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-red-500 font-medium cursor-pointer"
                    onClick={handleLogout}
                >
                    Logout
                </li>
            </ul>
        </div>
    );
};

export default Menu;
