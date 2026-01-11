import React from "react";
import { Hammer, Sparkles, Timer } from "lucide-react";
import { Link } from "react-router-dom";

interface ComingSoonProps {
    title: string;
    description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
    return (
        <div className=" flex  pt-40 flex-col items-center justify-center p-6 bg-gray-950 text-white overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />

            <div className="z-10 flex flex-col items-center text-center max-w-2xl px-4">
                {/* Icon with Glowing Effect */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="relative bg-gray-900/50 border border-gray-800 p-6 rounded-3xl backdrop-blur-xl">
                        <Timer className="h-16 w-16 text-indigo-400 animate-bounce-slow" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin-slow" />
                </div>

                {/* Text Content */}
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                    {title}
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
                    {description}
                </p>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Link
                        to="/problems"
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                    >
                        Explore Problems
                        <Hammer className="h-5 w-5" />
                    </Link>
                    <Link
                        to="/"
                        className="px-8 py-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 font-bold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                    >
                        Back Home
                    </Link>
                </div>

                {/* Bottom Badge */}
                <div className="mt-16 flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                        Development in progress
                    </span>
                </div>
            </div>

            <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 8s infinite linear;
        }
      `}</style>
        </div>
    );
};

export default ComingSoon;
