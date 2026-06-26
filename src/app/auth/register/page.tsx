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
import { Checkbox } from "@/components/ui/checkbox";
import {
  EyeIcon,
  EyeOffIcon,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useUserStore } from "@/store/user-store";

// Enhanced floating particles component
const FloatingParticles = () => {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const particles = Array.from({ length: 35 }, (_, i) => i);

  useEffect(() => {
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

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => {
        const size = Math.random() * 4 + 1;
        const colors = [
          "from-green-400 to-blue-400",
          "from-blue-400 to-purple-400",
          "from-purple-400 to-pink-400",
          "from-pink-400 to-red-400",
          "from-yellow-400 to-orange-400",
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        return (
          <motion.div
            key={particle}
            className={`absolute bg-gradient-to-r ${randomColor} rounded-full opacity-40 blur-sm`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
            }}
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              scale: 0,
            }}
            animate={{
              x: [
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
              ],
              y: [
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
              ],
              scale: [0, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
};

// Animated geometric shapes
const GeometricShapes = () => {
  const shapes = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => {
        const shapeType = shape % 3;
        const baseDelay = shape * 0.5;

        return (
          <motion.div
            key={shape}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              opacity: [0, 0.3],
              rotate: [0, 720],
            }}
            transition={{
              duration: 25 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
              delay: baseDelay,
            }}
          >
            {shapeType === 0 && (
              <div className="w-8 h-8 border-2 border-green-300 rotate-45 opacity-30" />
            )}
            {shapeType === 1 && (
              <div className="w-6 h-6 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-25" />
            )}
            {shapeType === 2 && (
              <div className="w-10 h-0.5 bg-gradient-to-r from-pink-300 to-yellow-300 transform rotate-12 opacity-30" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// Enhanced animated background component with multiple layers
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Primary gradient orbs */}
    <motion.div
      className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-green-400/30 to-blue-400/30 rounded-full blur-3xl"
      animate={{
        x: [0, -100],
        y: [0, 100],
        scale: [1, 1.3],
        rotate: [0, 360],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
      animate={{
        x: [0, 100],
        y: [0, -100],
        scale: [1, 1.4],
        rotate: [360, 0],
      }}
      transition={{
        duration: 30,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />

    {/* Secondary gradient orbs */}
    <motion.div
      className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-yellow-300/20 to-orange-400/20 rounded-full blur-2xl"
      animate={{
        x: [0, -80],
        y: [0, 60],
        scale: [0.8, 1.1],
        rotate: [0, -360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-teal-300/25 to-cyan-400/25 rounded-full blur-2xl"
      animate={{
        x: [0, 70],
        y: [0, -50],
        scale: [1, 1.2],
        rotate: [0, 360],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />

    {/* Pulsing background overlay */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10"
      animate={{
        opacity: [0.5, 0.8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  </div>
);

// Wave animation component
const AnimatedWaves = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.svg
      className="absolute bottom-0 left-0 w-full h-32"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
        fill="url(#wave-gradient)"
        animate={{
          d: [
            "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z",
            "M0,80 C300,40 600,120 900,80 C1050,50 1150,100 1200,80 L1200,120 L0,120 Z",
            "M0,40 C300,100 600,20 900,40 C1050,70 1150,10 1200,40 L1200,120 L0,120 Z",
            "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,197,94,0.1)" />
          <stop offset="50%" stopColor="rgba(59,130,246,0.1)" />
          <stop offset="100%" stopColor="rgba(168,85,247,0.1)" />
        </linearGradient>
      </defs>
    </motion.svg>

    <motion.svg
      className="absolute top-0 right-0 w-full h-32 transform rotate-180"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,40 C300,80 600,0 900,40 C1050,60 1150,20 1200,40 L1200,120 L0,120 Z"
        fill="url(#wave-gradient-2)"
        animate={{
          d: [
            "M0,40 C300,80 600,0 900,40 C1050,60 1150,20 1200,40 L1200,120 L0,120 Z",
            "M0,60 C300,20 600,80 900,60 C1050,40 1150,70 1200,60 L1200,120 L0,120 Z",
            "M0,20 C300,60 600,0 900,20 C1050,40 1150,10 1200,20 L1200,120 L0,120 Z",
            "M0,40 C300,80 600,0 900,40 C1050,60 1150,20 1200,40 L1200,120 L0,120 Z",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <defs>
        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(236,72,153,0.1)" />
          <stop offset="50%" stopColor="rgba(139,92,246,0.1)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0.1)" />
        </linearGradient>
      </defs>
    </motion.svg>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "corporate" as "individual" | "corporate",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsVisible(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Temel doğrulama
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Kullanım koşullarını kabul etmelisiniz");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setUser(data);

      router.push(
        formData.accountType === "individual" ? "/user/cards" : "/",
      );
      setLoading(false);
    } catch (err) {
      setError("Kayıt işlemi başarısız. Lütfen tekrar deneyin.");
      setLoading(false);
      console.error(err);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      console.log("Google ile kayıt yapılıyor...");
      // Örnek: window.location.href = "/api/auth/google";
    } catch (error) {
      console.error("Google kayıt hatası:", error);
      setError("Google ile kayıt yapılırken bir hata oluştu.");
    }
  };

  const handleAppleRegister = async () => {
    try {
      console.log("Apple ile kayıt yapılıyor...");
      // Örnek: window.location.href = "/api/auth/apple";
    } catch (error) {
      console.error("Apple kayıt hatası:", error);
      setError("Apple ile kayıt yapılırken bir hata oluştu.");
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
        staggerChildren: 0.15,
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-100">
      {/* Enhanced Background Layers */}
      <AnimatedBackground />
      <AnimatedWaves />
      <GeometricShapes />
      <FloatingParticles />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #22c55e 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "40px 40px"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      />

      {/* Subtle spotlight effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="w-full max-w-lg p-3 relative z-10"
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
              {/* Multiple layered glow effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-lg opacity-30"
                animate={{
                  scale: [1, 1.2],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-20"
                animate={{
                  scale: [0.8, 1.3],
                  rotate: [360, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />

              {/* Orbiting particles around logo */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="relative w-full h-full">
                  <motion.div
                    className="absolute w-2 h-2 bg-green-400 rounded-full top-0 left-1/2 transform -translate-x-1/2"
                    animate={{ scale: [0.5, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <motion.div
                    className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full bottom-0 left-1/2 transform -translate-x-1/2"
                    animate={{ scale: [1, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1,
                    }}
                  />
                </div>
              </motion.div>

              {/* Logo - Multiple fallbacks */}
              <motion.div
                className="relative z-10 h-14 flex items-center justify-center"
                animate={{ y: [0, -2] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              >
                {!logoError ? (
                  <motion.img
                    src="/company_logo.png"
                    alt="Şirket Logosu"
                    className="h-12 w-auto object-contain"
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
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
                  <motion.div
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  >
                    COMPANY
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-blue-900 bg-clip-text text-transparent mb-3"
            variants={itemVariants}
          >
            Hesap Oluşturun
          </motion.h1>

          <motion.div
            className="flex items-center justify-center space-x-2 text-gray-600"
            variants={itemVariants}
          >
            <Star className="h-4 w-4 text-green-500" />
            <p>Platformumuza katılın ve başlayın</p>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </motion.div>
        </motion.div>

        {/* Register Card */}
        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl relative overflow-hidden">
            {/* Enhanced Card glow effect with multiple layers */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-xl"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(168,85,247,0.1) 100%)",
                  "linear-gradient(180deg, rgba(168,85,247,0.1) 0%, rgba(34,197,94,0.1) 50%, rgba(59,130,246,0.1) 100%)",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Subtle pulsing border */}
            <motion.div
              className="absolute inset-0 rounded-xl border border-gradient-to-r from-green-300/20 via-blue-300/20 to-purple-300/20"
              animate={{
                borderColor: ["rgba(34,197,94,0.2)", "rgba(59,130,246,0.2)"],
                scale: [1, 1.005],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            <CardHeader className="space-y-1 pb-6 relative z-10">
              <CardTitle className="text-2xl flex items-center justify-center space-x-3">
                <motion.div
                  className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <UserPlus className="h-5 w-5 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Kayıt Ol
                </span>
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Hesap oluşturmak için bilgilerinizi girin
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Type */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <User className="h-4 w-4 text-indigo-500" />
                    <span>Üyelik Tipi</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          accountType: "individual",
                        }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-left transition-all duration-200 ${
                        formData.accountType === "individual"
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900">
                        Bireysel
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Kişisel kartlarınızı yönetin
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          accountType: "corporate",
                        }))
                      }
                      className={`rounded-lg border-2 px-4 py-3 text-left transition-all duration-200 ${
                        formData.accountType === "corporate"
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900">
                        Kurumsal
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        Ekip ve üyelerinizi yönetin
                      </span>
                    </button>
                  </div>
                </motion.div>

                {/* Name Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <User className="h-4 w-4 text-green-500" />
                    <span>Ad Soyad</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ali Yılmaz"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                      required
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent rounded-lg pointer-events-none"
                      animate={{
                        borderColor: formData.name
                          ? "rgba(34,197,94,0.3)"
                          : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

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
                      name="email"
                      type="email"
                      placeholder="ornek@sirket.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      required
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-transparent rounded-lg pointer-events-none"
                      animate={{
                        borderColor: formData.email
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
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4 text-purple-500" />
                    <span>Şifre</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
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
                        borderColor: formData.password
                          ? "rgba(168,85,247,0.3)"
                          : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  className="space-y-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700 flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4 text-orange-500" />
                    <span>Şifre Tekrar</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <motion.button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center w-6 h-6"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{ transformOrigin: "center center" }}
                      >
                        <AnimatePresence mode="wait">
                          {showConfirmPassword ? (
                            <motion.div
                              key="eye-off-confirm"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <EyeOffIcon className="h-4 w-4 text-gray-500" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="eye-on-confirm"
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
                        borderColor: formData.confirmPassword
                          ? "rgba(249,115,22,0.3)"
                          : "transparent",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                {/* Terms Checkbox */}
                <motion.div
                  className="flex items-start space-x-3 p-4   rounded-lg"
                  whileHover={{ backgroundColor: "" }}
                >
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={() => setAcceptTerms(!acceptTerms)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600  cursor-pointer leading-relaxed"
                  >
                    <Link
                      href="#"
                      className="text-green-600 hover:text-green-800 hover:underline font-medium"
                    >
                      Kullanım Şartları
                    </Link>{" "}
                    ve{" "}
                    <Link
                      href="#"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      Gizlilik Politikası
                    </Link>
                    &apos;nı kabul ediyorum
                  </label>
                </motion.div>

                {/* Enhanced Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 hover:from-green-700 hover:via-blue-700 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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
                          <span>Hesap oluşturuluyor...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>Hesap Oluştur</span>
                          <motion.div
                            animate={{ x: [0, 4] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Enhanced Button glow effects */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 rounded-lg"
                      whileHover={{ opacity: 0.3 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-full"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </Button>
                </motion.div>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-gray-100 p-6 relative z-10">
              <motion.p
                className="text-sm text-gray-600 flex items-center space-x-1"
                variants={itemVariants}
              >
                <span>Zaten hesabınız var mı?</span>
                <Link
                  href="/auth/login"
                  className="text-green-600 hover:text-blue-600 font-medium transition-colors duration-200 hover:underline flex items-center space-x-1"
                >
                  <span>Giriş Yap</span>
                  <CheckCircle className="h-3 w-3" />
                </Link>
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Security Badge */}
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-600 font-medium">
              Güvenli Kayıt Sistemi
            </span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
