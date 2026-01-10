import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";

interface Option {
    id: string;
    label: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export default function MultiSelect({
    label,
    options,
    selected,
    onChange,
    placeholder = "Select...",
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((item) => item !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">
                {label}
            </label>
            <div
                className="w-full min-w-[200px] bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 cursor-pointer hover:border-gray-700 transition-colors flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 max-w-[calc(100%-24px)]">
                    {selected.length === 0 && (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                    {selected.map((id) => (
                        <span
                            key={id}
                            className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleOption(id);
                            }}
                        >
                            {options.find((o) => o.id === id)?.label || id}
                            <X size={12} className="cursor-pointer hover:text-white" />
                        </span>
                    ))}
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-800">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-gray-950 text-white text-sm px-3 py-1.5 rounded border border-gray-800 focus:outline-none focus:border-indigo-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-gray-500 text-sm p-2 text-center">No options found</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-center gap-2 px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded cursor-pointer"
                                    onClick={() => toggleOption(option.id)}
                                >
                                    <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(option.id)
                                                ? "bg-indigo-600 border-indigo-600"
                                                : "border-gray-600"
                                            }`}
                                    >
                                        {selected.includes(option.id) && (
                                            <Check size={12} className="text-white" />
                                        )}
                                    </div>
                                    {option.label}
                                </div>
                            ))
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
