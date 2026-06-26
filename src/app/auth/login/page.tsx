"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  LogIn,
  Mail,
  Lock,
  Sparkles,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

// Floating particles component
const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isClient, setIsClient] = useState(false);
  const particles = Array.from({ length: 15 }, (_, i) => i);

  useEffect(() => {
    setIsClient(true);

    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    <motion.div
      className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-3xl"
      animate={{
        x: [0, -100, 0],
        y: [0, 100, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
      setLoading(false);
    } catch (err) {
      setError(
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
      );
      setLoading(false);
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Google OAuth işlemi burada implement edilecek
      console.log("Google ile giriş yapılıyor...");
      // Örnek: window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google giriş hatası:", error);
      setError("Google ile giriş yapılırken bir hata oluştu.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      // Apple OAuth işlemi burada implement edilecek
      console.log("Apple ile giriş yapılıyor...");
      // Örnek: window.location.href = "/api/auth/apple";
    } catch (error) {
      console.error("Apple giriş hatası:", error);
      setError("Apple ile giriş yapılırken bir hata oluştu.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateX: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AnimatedBackground />
      <FloatingParticles />

      <motion.div
        className="w-full max-w-md p-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Header Section */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {!logoError ? (
                <Image
                  src="/company_logo.png"
                  alt="Şirket Logosu"
                  width={120}
                  height={120}
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    console.log("Company logo failed, trying default...");
                    e.currentTarget.src = "/defaultcompanylogo.png";
                    e.currentTarget.onerror = () => {
                      console.log(
                        "Default logo also failed, showing text logo",
                      );
                      setLogoError(true);
                    };
                  }}
                />
              ) : (
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  COMPANY
                </div>
              )}
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3"
            variants={itemVariants}
          >
            Hoş Geldiniz
          </motion.h1>

          <motion.div
            className="flex items-center justify-center space-x-2 text-gray-600"
            variants={itemVariants}
          >
            <Shield className="h-4 w-4 text-blue-500" />
            <p>Güvenli girişle hesabınıza erişin</p>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </motion.div>
        </motion.div>

        {/* Login Card */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl relative overflow-hidden">
            {/* Card glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(236,72,153,0.1) 100%)",
                  "linear-gradient(90deg, rgba(236,72,153,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(168,85,247,0.1) 100%)",
                  "linear-gradient(90deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.1) 50%, rgba(59,130,246,0.1) 100%)",
                ],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            <CardHeader className="space-y-1 pb-6 relative z-10">
              <CardTitle className="text-2xl flex items-center justify-center space-x-3">
                <motion.div
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <LogIn className="h-5 w-5 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Giriş Yap
                </span>
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                E-posta ve şifrenizle güvenli giriş yapın
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>E-posta adresi</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@sirket.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      required
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent rounded-lg pointer-events-none"
                      animate={{
                        borderColor: email
                          ? "rgba(59,130,246,0.3)"
                          : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4 text-purple-500" />
                      <span>Şifre</span>
                    </label>
                    <Link
                      href="#"
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center w-6 h-6"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ transformOrigin: "center center" }}
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="eye-off"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <EyeOffIcon className="h-4 w-4 text-gray-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="eye-on"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <EyeIcon className="h-4 w-4 text-gray-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent rounded-lg pointer-events-none"
                      animate={{
                        borderColor: password
                          ? "rgba(168,85,247,0.3)"
                          : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    disabled={loading}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center space-x-2"
                        >
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>Giriş yapılıyor...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>Giriş Yap</span>
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Button glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 rounded-lg"
                      whileHover={{ opacity: 0.2 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </form>

              {/* Social Login Buttons */}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-gray-100 p-6 relative z-10">
              <motion.p
                className="text-sm text-gray-600 flex items-center space-x-1"
                variants={itemVariants}
              >
                <span>Henüz hesabınız yok mu?</span>
                <Link
                  href="/auth/register"
                  className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200 hover:underline flex items-center space-x-1"
                >
                  <span>Kaydol</span>
                  <CheckCircle className="h-3 w-3" />
                </Link>
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Security Badge */}
      </motion.div>
    </div>
  );
}
