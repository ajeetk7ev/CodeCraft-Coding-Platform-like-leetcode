import { Lightbulb } from "lucide-react";

export default function SolutionsTab() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="bg-gray-800/50 p-4 rounded-2xl mb-4 border border-gray-700/50">
                <Lightbulb className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
                Solutions Coming Soon
            </h3>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                Community solutions will be enabled shortly.
                You'll be able to share and discuss different approaches here.
            </p>
        </div>
    );
}
