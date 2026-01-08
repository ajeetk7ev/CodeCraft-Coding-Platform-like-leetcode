import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-gray-400" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-lg text-gray-300 mb-2">
          Page not found
        </p>
        <p className="text-sm text-gray-500 mb-8">
          The problem you’re looking for doesn’t exist or was moved.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button asChild variant="secondary" className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild className="bg-gray-800 hover:bg-gray-700 text-white">
            <Link to="/problems">
              Browse Problems
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
