import { useState } from "react";
import AuthLayout from "@/components/core/auth/AuthLayout";
import AuthHeader from "@/components/core/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormError from "@/components/common/FormError";
import { inputClass } from "./Signup";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function Login() {
  const { login, authIsLoading } = useAuthStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const res = await login(form.email, form.password);

    if (!res.success) {
      if (res.message) {
        toast.error(res.message);
      }
      // Zod field errors
      if (res.errors) {
        const fieldErrors = res.errors;
        setErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
      }
    } else {
      toast.success(res.message || "Registered Successfully");
    }
  }

  return (
    <AuthLayout>
      <button
        onClick={() => navigate(-1)}
        className="self-start w-8 h-8  justify-center  bg-gray-600 rounded-full  text-gray-300 hover:text-gray-100 flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <AuthHeader
        title="Welcome back"
        subtitle="Login to continue your coding journey"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          <FormError message={errors.email} />
        </div>

        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={inputClass}
          />
          <FormError message={errors.password} />
        </div>

        <div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} pr-10`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <FormError message={errors.password} />
        </div>

        <Button
          disabled={authIsLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
        >
          {authIsLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      <p className="text-sm text-gray-400 mt-6 text-center">
        {" "}
        Don’t have an account?{" "}
        <Link to="/signup" className="text-indigo-400 hover:underline">
          {" "}
          Sign up{" "}
        </Link>{" "}
      </p>
    </AuthLayout>
  );
}
