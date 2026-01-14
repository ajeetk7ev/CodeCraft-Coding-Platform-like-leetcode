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
      navigate("/");
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
