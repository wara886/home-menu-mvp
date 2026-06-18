"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (data.ok) {
        sessionStorage.setItem("admin_authenticated", "true");
        onLogin();
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("验证失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-[430px] flex-col items-center justify-center bg-[#fff8f1] px-6">
      <div className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#ecfdf3] text-[#15803d]">
          <Lock size={30} aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-center text-[24px] font-bold text-stone-950">管理后台</h1>
        <p className="mt-2 text-center text-[15px] text-stone-500">请输入密码以继续</p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="输入管理员密码"
              autoFocus
              className="w-full rounded-[14px] border border-stone-200 bg-[#fffaf4] px-4 py-3.5 text-[16px] outline-none transition-colors focus:border-[#16a34a]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error ? (
            <p className="mt-3 text-center text-[14px] font-semibold text-red-500">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className={`mt-5 w-full rounded-full px-5 py-3.5 text-[17px] font-bold ${
              password.trim() && !isSubmitting
                ? "bg-[#16a34a] text-white active:scale-[0.99]"
                : "bg-stone-200 text-stone-500"
            }`}
          >
            {isSubmitting ? "验证中..." : "进入管理后台"}
          </button>
        </form>
      </div>
    </main>
  );
}
