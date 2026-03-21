
"use client";

import { cn } from "@/lib/utils";
import React from 'react';


const LoadingCubeAnimation = () => (
  <div className="scene">
    <div className="cube">
      <div className="face front"></div>
      <div className="face back"></div>
      <div className="face right"></div>
      <div className="face left"></div>
      <div className="face top"></div>
      <div className="face bottom"></div>
    </div>
  </div>
);


type AuthLoadingScreenProps = {
    action: 'login' | 'logout';
};

export function AuthLoadingScreen({ action }: AuthLoadingScreenProps) {
    const text = action === 'login' ? "connecting....." : "disconnecting....";
    
    return (
        <div className="fixed inset-0 z-[200] flex h-screen w-screen flex-col items-center justify-center bg-background">
            <style>
                {`
                    .scene {
                        width: 200px;
                        height: 200px;
                        perspective: 600px;
                    }

                    .cube {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        transform-style: preserve-3d;
                        transform: translateZ(-100px);
                        animation: rotate-cube 8s infinite linear;
                    }

                    .face {
                        position: absolute;
                        width: 200px;
                        height: 200px;
                        border: 2px solid hsl(var(--primary));
                        background: hsla(var(--primary), 0.1);
                        box-shadow: 0 0 20px hsl(var(--primary) / 0.5);
                    }

                    .front  { transform: rotateY(  0deg) translateZ(100px); }
                    .back   { transform: rotateY(180deg) translateZ(100px); }
                    .right  { transform: rotateY( 90deg) translateZ(100px); }
                    .left   { transform: rotateY(-90deg) translateZ(100px); }
                    .top    { transform: rotateX( 90deg) translateZ(100px); }
                    .bottom { transform: rotateX(-90deg) translateZ(100px); }

                    @keyframes rotate-cube {
                        from { transform: rotateY(0deg) rotateX(0deg); }
                        to { transform: rotateY(360deg) rotateX(360deg); }
                    }
                `}
            </style>
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center">
                <LoadingCubeAnimation />
                <p className="text-pop text-center text-3xl font-bold tracking-wider text-white mt-8" style={{ fontFamily: 'monospace' }}>
                    {text}
                </p>
            </div>
        </div>
    );
}
