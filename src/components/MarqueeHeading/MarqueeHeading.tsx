"use client"
import React from 'react'
import Marquee from "react-fast-marquee";


const MarqueeHeading = ({ text, className }: { text: string, className?: string }) => {

    return (
        <div className={` ${className ? className : "gradient"} absolute top-0 left-0 w-full h-[150px] sm:h-[200px] -z-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold overflow-hidden`}>
            <Marquee gradient={false} speed={50} className='h-full'>
                <div className="flex items-center gap-12 px-4 whitespace-nowrap  text-white uppercase">
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                    <h1>{text}</h1>
                </div>
            </Marquee>
        </div>

    )
}

export default MarqueeHeading