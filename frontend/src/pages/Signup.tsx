import { useState } from "react";
import AuthLayout from "@/components/core/auth/AuthLayout";
import AuthHeader from "@/components/core/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const inputClass =
  "bg-gray-900 text-gray-300 placeholder:text-gray-500 border-gray-700 focus:border-indigo-500 focus:ring-indigo-500";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(form);
  }

  return (
    <AuthLayout>
      <AuthHeader
        title="Create your account"
        subtitle="Start solving problems and track your progress"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
           className={inputClass}
        />

        <Input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
           className={inputClass}
        />

        <Input
          type="email"
          name="email"
          placeholder="Email address"
          value={form.email}
          onChange={handleChange}
           className={inputClass}
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
           className={inputClass}
        />

        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
          Create Account
        </Button>
      </form>

      <p className="text-sm text-gray-400 mt-6 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-400 hover:underline">
          Log in
        </a>
      </p>
    </AuthLayout>
  );
}
