import { useState } from "react";
import AuthLayout from "@/components/core/auth/AuthLayout";
import AuthHeader from "@/components/core/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormError from "@/components/common/FormError";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, User, Mail, Lock, AtSign, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_URL } from "@/utils/api";

export const inputClass =
  "bg-slate-950/50 border-slate-800 focus:border-indigo-500 focus:ring-1 ring-indigo-500 text-slate-100 placeholder:text-slate-600 h-12 rounded-xl transition-all duration-300";

type SignupErrors = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
};

export default function Signup() {
  const { signup, authIsLoading } = useAuthStore();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: undefined,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const res = await signup(
      form.fullName,
      form.username,
      form.email,
      form.password
    );

    if (!res.success) {
      if (res.message) {
        toast.error(res.message);
      }
      // Zod field errors
      if (res.errors) {
        const fieldErrors = res.errors;
        setErrors({
          fullName: fieldErrors.fullName?.[0],
          username: fieldErrors.username?.[0],
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
      }
    } else {
      toast.success(res.message || "Signup Successfully");
      setForm({ fullName: "", username: "", email: "", password: "" });
      navigate("/login");
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <AuthLayout>
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => navigate(-1)}
        className="absolute top-8 left-0 sm:left-8 p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
      </motion.button>

      <AuthHeader
        title="Create Account"
        subtitle="Join our global community of expert coders"
      />

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <motion.div variants={itemVariants} className="space-y-1">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            <Input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className={`${inputClass} pl-12`}
            />
          </div>
          <FormError message={errors.fullName} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1">
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            <Input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className={`${inputClass} pl-12`}
            />
          </div>
          <FormError message={errors.username} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              className={`${inputClass} pl-12`}
            />
          </div>
          <FormError message={errors.email} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} pl-12 pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <FormError message={errors.password} />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <div className="bg-slate-950 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest absolute">
              Or continue with
            </div>
          </div>

          <Button
            type="button"
            onClick={() => (window.location.href = `${API_URL}/auth/google`)}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Button
            disabled={authIsLoading}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {authIsLoading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-sm text-slate-500 mt-8 text-center"
      >
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </motion.p>
    </AuthLayout>
  );
}
