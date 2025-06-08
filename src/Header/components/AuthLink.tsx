"use client";

import { getUserData } from '@/actions/getUserData';
import React, { useEffect, useState } from 'react';
import Menu from './Menu/Menu';
import Image from 'next/image';
import Link from 'next/link';
import { PaginatedDocs } from 'payload';
import { Profile } from '@/payload-types';
import { Media } from '@/components/Media';

export interface UserPayload {
    id: string;
    iat?: number;
    exp?: number;
    email?: string;
    name?: string;
}

type props = {
    user: PaginatedDocs<Profile>;
}

const AuthLink: React.FC<props> = ({ user: AuthUser }) => {
    const data = AuthUser?.docs[0];
    const [user, setUser] = useState<UserPayload | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const fetchUser = async () => {
        const user = await getUserData();
        setUser(user?.email ? user : null);
    };

    useEffect(() => {
        fetchUser();

        const handleAuthChange = () => fetchUser();
        window.addEventListener("auth-change", handleAuthChange);

        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);

    const toggleMenu = () => setShowMenu(prev => !prev);

    const placeholderImage = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAugMBIgACEQEDEQH/xAAbAAEAAwEBAQEAAAAAAAAAAAAAAwQFAgEGB//EADMQAAICAQEGAwUHBQAAAAAAAAABAgMRBAUSITFBYTJRcSJCYoGhExQVUnLR4TNTkbHB/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AP3EAAAAAAAAA5lNR5gdAgla3yWCNtvqwLLml1R59pH8yKwAtKafJo6yUz1N+bAtgrxta58SWFil2YHYAAAAAAAAAAAAAAAABBZZnhEDqy3pH/JC2zwAAAAAAAAAAABJCxrgydPKKh3XNxfYCyDxPKTR6AAAAAAAAAAPG8Jt9AOLZ4WFzK51KWXk5AAAAc2WQqg5WSSR7OUYRc5PCjzMTU3y1Fu9Ll0XkgLV20pZxVFJdHIg+/ahvx/RFcAXK9pWxftqMl2WDQ0+pr1EcwfHrF80YZ7CUoSUo8GnlNAfQAh0l61FKmvEuEl3JgAAAlpnj2ScplmuW9EDsAAAAAAAAjveI48yQr3PM12AjAAAAAUtqWONUYL33x+RlmhtdPNXlhmeAAAAAAW9l2ON+70kuRrGLoE/vdeDaAAAAS0S9poiOovEl6gWgAAAAAAACtb42WSrZ42ByAAAAAq7SqdmnclxcOODIPoefMydbpJVNzrWa89PdAqAAAAS6eid81GHLrLogLOyqm7JXPwxW6u7NM4qrjVXGEOCX1OwAAAAAC2uR6eLkegAAAAAAr3eMsEN65S+QEIAAAAAAc2WwqWbJKPqBXu0FNj3opwl5og/C8vhcsfp/kls2jVHhGM5/REb2n5U8P1/wB3Xs2pPM5Slj5FyEYwilBKK7FKO0628SrlH0eSzVqabeEJ8fJ8GBKB0AAAAD2PFpI8O6lmSwBZAAAAAAAAOZrei0dACoeEl0cPKIwABQ2jqt3NFbw/ea/0A1ev3W4afi+Tl0M6Tc5OU25S82zwAAAAC4ceoAFzS66dbUbczh59UakJRnHei8p8mj5/uWdBqnTPcf9N8/hA2AAALFMcJt9SGEd6SRaSwgAAAAAAAAAAA8ksorSg4stHM4qSApXWKquU37qyYTblJyl4m8s1truVdMY44Slz7GR1AAAAAAAAAAADX2db9pRuN+1Dh8i2ll+plbKcvvDglneibsK1FdwFcNyPc7AAAAAAAAAAAAAAAOLK42RcJxUovmmjK1eyWsy0zyvyP/hsAD5Sdc65ONkHF/FwOT6qyqFkcWQUl3RTt2VppeFSg/hf7gYINWWxn7ly+aOPwe7+7D6gZo6GpHY08+1dFeiJ69j0xebJzn2zhAYscyaUVlvoi9pdl3W4dq+zj9TZq09NKxVXGPoS4Ah0+mq00d2qCXm+rJgAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAf//Z"; // Ideally use an actual image file

    return (
        <div className="relative">
            {user ? (
                <div className="relative flex items-center space-x-2">
                    <div
                        className="h-8 w-8 relative rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 overflow-hidden border border-indigo-500 shadow-sm cursor-pointer"
                        onClick={toggleMenu}
                    >
                        {data?.avatar ? (
                            <Media
                                resource={data.avatar}
                                fill
                                alt="Avatar"
                                imgClassName="w-full h-full object-cover"
                            />
                        ) : (
                            <Image
                                src={placeholderImage}
                                alt="Avatar"
                                fill
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    {showMenu &&


                        <Menu user={user} setShowMenu={setShowMenu} />}
                </div>
            ) : (
                <Link
                    href="/login"
                    className="text-sm font-medium transition-transform duration-100 hover:border-b-2 dark:border-white border-black dark:text-white text-black"
                >
                    Login
                </Link>
            )}
        </div>
    );
};

export default AuthLink;
