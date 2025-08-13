import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );
      
      if (response.data) {
        login(response.data);
        let redirectPath = "";
        if (response.data.user.role === "admin") {
          redirectPath = "/admin";
        } else {
          redirectPath =
            response.data.user.role === "teacher"
              ? "/teacher/dashboard"
              : "/student/dashboard";
        }
        toast.success("Login successful!");
        navigate(redirectPath);
      }
    } catch (err) {
      console.log("error", err);
      toast.error("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row font-sans">
      {/* Left side - Image and Welcome Text */}
      <div className="relative hidden lg:flex w-full lg:w-1/2 items-end justify-center p-12 bg-gradient-to-r from-green-700 to-green-700 bg-cover bg-center">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
          alt="University Campus"
          className="absolute inset-0 object-cover w-full h-full opacity-40"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1000x1200/111827/ffffff?text=Campus'; }}
        />
         <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute z-10 text-white top-5 left-10 "
        >
          <img src="/logo_full.png" alt="" className="h-12" />
        
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-white top-[-50%] left-[-10%]"
        >
          <h2 className="text-4xl font-bold leading-tight mb-3 ">
            Empowering Minds, <br /> One Login at a Time.
          </h2>
          <p className="text-lg text-gray-100">
            Welcome to the future of learning with KIITX LMS.
          </p>
          <div className="mt-2 flex gap-2">
          <div className="h-4 w-4  bg-white rounded-full"></div>
          <div className="h-4 w-4  bg-white rounded-full"></div>
           <div className="h-4 w-8  bg-white rounded-full"></div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-left mb-10">
            <h1 className="text-4xl font-bold text-gray-800">
              KIITX LMS
            </h1>
            <p className="text-gray-500 mt-2">Welcome back! Please sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <a href="#" className="text-sm text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all duration-300 ease-in-out transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
