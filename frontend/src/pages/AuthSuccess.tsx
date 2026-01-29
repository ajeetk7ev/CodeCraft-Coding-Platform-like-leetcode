import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { setToken, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (token) {
        setToken(token);
        // We need to fetch the user data because the callback only sends the token
        // fetchUser will update the store and local storage
        await fetchUser();
        toast.success("Login Successful");
        navigate("/");
      } else {
        toast.error("Authentication failed. Please try again.");
        navigate("/login");
      }
    };

    handleAuth();
  }, [token, setToken, fetchUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <LoaderCircle className="h-10 w-10 text-indigo-500 animate-spin" />
      <p className="text-slate-400 text-lg font-medium animate-pulse">
        Finalizing authentication...
      </p>
    </div>
  );
}
