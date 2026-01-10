import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
    from?: number;
    to: number;
    duration?: number;
    className?: string;
}

export default function AnimatedCounter({
    from = 0,
    to,
    duration = 2,
    className = "",
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const springValue = useSpring(from, {
        duration: duration * 1000,
        bounce: 0,
    });

    const display = useTransform(springValue, (latest) => Math.floor(latest));

    useEffect(() => {
        if (isInView) {
            springValue.set(to);
        }
    }, [isInView, to, springValue]);

    return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
