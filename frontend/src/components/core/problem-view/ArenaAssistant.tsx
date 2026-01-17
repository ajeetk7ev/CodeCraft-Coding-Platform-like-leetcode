import { useState, useEffect, useRef } from "react";
import {
    X,
    Send,
    Bot,
    Trash2,
    Minimize2,
    Maximize2,
    Copy,
    Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/utils/api";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuthStore } from "@/stores/authStore";
import { copyToClipboard } from "@/utils/clipboard";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    problemContext: {
        title: string;
        description: string;
        difficulty: string;
        tags: string[];
    };
    getCurrentCode: () => string;
    getCurrentLanguage: () => string;
}

const CodeBlock = ({ language, children }: { language: string, children: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(children);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="rounded-lg overflow-hidden my-4 border border-indigo-500/20 bg-[#0f172a]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-500/10 border-b border-indigo-500/10">
                <span className="text-[10px] uppercase font-medium text-indigo-300">{language || 'text'}</span>
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-white/5 rounded-md transition-colors text-indigo-400"
                    title="Copy code"
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '12px',
                    background: 'transparent',
                    fontSize: '11px',
                    lineHeight: '1.5',
                }}
                wrapLines={true}
                wrapLongLines={true}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
};

export default function ArenaAssistant({ isOpen, onClose, problemContext, getCurrentCode, getCurrentLanguage }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Window State
    const [size, setSize] = useState({ width: 450, height: 600 });
    const dragControls = useDragControls();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { token } = useAuthStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Handle Resize
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (ev: MouseEvent) => {
            // Since anchored right, moving left (negative delta) increases width
            const newWidth = Math.max(300, Math.min(800, startWidth + (startX - ev.clientX)));
            const newHeight = Math.max(300, Math.min(900, startHeight + (ev.clientY - startY)));

            setSize({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const currentCode = getCurrentCode();
            const currentLanguage = getCurrentLanguage();

            const response = await fetch(`${API_URL}/arena/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    problemContext,
                    userCode: currentCode,
                    language: currentLanguage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch response");
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";
            let buffer = "";

            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim() === "") continue;

                    if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6);
                        if (dataStr === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.content) {
                                assistantMessage += parsed.content;
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1].content = assistantMessage;
                                    return newMessages;
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${error.message || "Failed to generate response. Please try again."}` },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = () => {
        sendMessage(input);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    drag
                    dragListener={false}
                    dragControls={dragControls}
                    dragMomentum={false}
                    dragElastic={0}
                    style={{
                        width: size.width,
                        height: isMinimized ? 60 : size.height
                    }}
                    className={`fixed right-4 top-20 flex flex-col bg-[#1e293b]/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-xl z-50 overflow-hidden`}
                >
                    {/* Header - Draggable Area */}
                    <div
                        className="p-4 border-b border-indigo-500/20 flex items-center justify-between bg-indigo-500/10 cursor-move select-none"
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <div className="flex items-center gap-2">
                            <Bot className="text-indigo-400" size={20} />
                            <h3 className="font-semibold text-indigo-100">Arena Assistant</h3>
                        </div>
                        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                            {(messages.length > 0 && !isLoading) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearChat}
                                    className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            )}
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1 hover:bg-white/5 rounded-lg transition-colors text-indigo-300"
                            >
                                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-10">
                                        <Bot size={48} className="mx-auto mb-4 text-indigo-500/30" />
                                        <p>👋 Hi! I'm Arena.</p>
                                        <p className="text-sm mt-2 mb-6">Ask me anything about this problem or your code!</p>

                                        <div className="grid grid-cols-1 gap-2 max-w-[80%] mx-auto">
                                            {[
                                                "Give me a hint 💡",
                                                "Why is my code failing? 🐞",
                                                "Optimize time complexity ⚡",
                                                "Explain this problem 📖"
                                            ].map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => sendMessage(suggestion)}
                                                    className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-xs text-indigo-200 transition-colors text-left"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20"
                                                : "bg-[#0f172a] text-indigo-50 border border-indigo-500/20 rounded-tl-none"
                                                }`}
                                        >
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:p-0 prose-pre:rounded-lg prose-code:text-indigo-300 max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            return match ? (
                                                                <CodeBlock language={match[1]}>
                                                                    {String(children).replace(/\n$/, '')}
                                                                </CodeBlock>
                                                            ) : (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-[#0f172a] border border-indigo-500/20 rounded-2xl rounded-tl-none p-4 flex gap-2">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#0f172a]/50 border-t border-indigo-500/20">
                                <div className="flex gap-2">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Ask a question..."
                                        className="bg-[#1e293b] border border-indigo-500/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-white"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !input.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                    >
                                        <Send size={18} />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 px-1 text-center">
                                    Arena may provide inaccurate info. Verification is recommended.
                                </p>
                            </div>

                            {/* Resize Handle - Bottom Left (grows left and down) */}
                            <div
                                className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize z-50 flex items-end justify-start p-1"
                                onMouseDown={handleResizeMouseDown}
                            >
                                <div className="w-2 h-2 bg-indigo-500/40 rounded-bl-sm" />
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
