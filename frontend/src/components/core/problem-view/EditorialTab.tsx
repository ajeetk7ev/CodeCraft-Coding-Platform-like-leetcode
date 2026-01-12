import { BookOpen } from "lucide-react";

export default function EditorialTab() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="bg-gray-800/50 p-4 rounded-2xl mb-4 border border-gray-700/50">
                <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Editorial Coming Soon
            </h3>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Our team is working on crafting a detailed editorial for this problem.
                Check back later for an in-depth explanation!
            </p>
        </div>
    );
}
