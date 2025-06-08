import Image from 'next/image';
import React from 'react';

type Props = {
    className?: string;
};

export default function LiquidChromeTextEffect({ className = '' }: Props) {
    return (
        <div className={`flex items-center justify-center w-full ${className}`}>
            <div className="flex flex-col items-center md:flex-row md:gap-6 ">
                <h1
                    className="text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text text-center"
                    style={{
                        backgroundImage: "url('/loading2.gif')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Loading
                </h1>

                <div className="relative mt-6 md:mt-0 w-[150px] md:w-[200px] h-[112px] md:h-[150px]">
                    <Image
                        fill
                        src="/loadinganimated.gif"
                        alt="loading animation background"
                        className="brightness-200 object-cover"
                        unoptimized
                    />
                    <Image
                        fill
                        src="/loading2.gif"
                        alt="liquid chrome overlay"
                        className="absolute inset-0 object-cover mix-blend-color opacity-60"
                        unoptimized
                    />
                </div>
            </div>
        </div>
    );
}
