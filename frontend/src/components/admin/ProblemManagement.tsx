import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import { Eye, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import toast from "react-hot-toast";

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  published: boolean;
  createdBy: {
    username: string;
    email: string;
  };
  createdAt: string;
}

interface ProblemDetails extends Problem {
  description: string;
  constraints: string[];
  examples: any[];
  testcases: any[];
  boilerplates: any[];
  tags: string[];
  companyTags: string[];
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
  };
}

const ProblemManagement = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetails | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [searchTerm]);

  const fetchProblems = async () => {
    try {
      const params = new URLSearchParams();
      params.append("limit", "100"); // Get all problems for admin
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(`${API_URL}/problems?${params}`);
      setProblems(response.data.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
      toast.error("Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (problemId: string, currentlyPublished: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/problems/${problemId}/publish`, {
        published: !currentlyPublished,
      });
      toast.success(`Problem ${!currentlyPublished ? "published" : "unpublished"} successfully`);
      fetchProblems();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Failed to update problem status");
    }
  };

  const previewProblem = async (problemId: string) => {
    try {
      const response = await axios.get(`${API_URL}/problems/${problemId}`);
      setSelectedProblem(response.data);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching problem details:", error);
      toast.error("Failed to fetch problem details");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {problem.title}
                      </div>
                      <div className="text-sm text-gray-500">/{problem.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      problem.published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {problem.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {problem.createdBy.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(problem.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewProblem(problem._id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(problem._id, problem.published)}
                    >
                      {problem.published ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-600" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problem Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Problem Preview</DialogTitle>
          </DialogHeader>
          {selectedProblem && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProblem.title}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(selectedProblem.difficulty)}`}>
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    By {selectedProblem.createdBy.username}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedProblem.description }}
                />
              </div>

              {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProblem.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {constraint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProblem.examples && selectedProblem.examples.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Examples</h3>
                  <div className="space-y-4">
                    {selectedProblem.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium mb-2">Example {index + 1}:</div>
                        {example.input && (
                          <div className="mb-2">
                            <strong>Input:</strong> {example.input}
                          </div>
                        )}
                        {example.output && (
                          <div className="mb-2">
                            <strong>Output:</strong> {example.output}
                          </div>
                        )}
                        {example.explanation && (
                          <div>
                            <strong>Explanation:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProblem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-xl font-bold text-blue-600">
                      {selectedProblem.stats.totalSubmissions}
                    </div>
                    <div className="text-sm text-gray-600">Total Submissions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-xl font-bold text-green-600">
                      {selectedProblem.stats.acceptedSubmissions}
                    </div>
                    <div className="text-sm text-gray-600">Accepted</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProblemManagement;