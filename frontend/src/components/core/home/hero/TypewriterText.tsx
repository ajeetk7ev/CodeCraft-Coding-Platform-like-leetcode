import { useEffect, useState } from "react";

const words = [
  "Practice DSA",
  "Crack Interviews",
  "Compete in Contests",
  "Build Confidence",
];

export default function TypewriterText() {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (charIndex < words[wordIndex].length) {
        setText((prev) => prev + words[wordIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setText("");
          setCharIndex(0);
          setWordIndex((prev) => (prev + 1) % words.length);
        }, 1200);
      }
    }, 80);

    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex]);

  return (
    <span className="text-indigo-400 border-r-2 border-indigo-400 pr-1 animate-pulse">
      {text}
    </span>
  );
}
