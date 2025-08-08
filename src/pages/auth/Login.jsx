import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GraduationCap, Mail, Lock } from "lucide-react";
import logo from "./logo.jpg";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  // useEffect(() => {
  //   fetch("https://source.unsplash.com/600x400/?education,learning")
  //     .then((response) => setImage(response.url))
  //     .catch(() => setImage(""));
  // }, []);

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
      // console.log(response.data.user.role);
      if (response.data) {
        login(response.data);
        let redirectPath = "";
        if (response.data.user.role == "admin") {
          redirectPath = "/admin";
        } else {
          redirectPath =
            response.data.user.role === "teacher"
              ? "/teacher/dashboard"
              : "/student/dashboard";
        }

        navigate(redirectPath);
      }
    } catch (err) {
      console.log("error", error);
      toast.error("Login failed. Try again.");

      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row-reverse">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center  text-slate-600">
            <img
              src={"/Nexus.jpeg"}
              alt="Logo"
              className="h-[150px] w-[150px] object-cover"
            />
          </div>
          <h1 className="text-[20px] lg:text-[30px]   text-center text-black lg:my-2 font-[Poppins]">
            OneCampus
          </h1>
          <h2 className="text-2xl lg:text-3xl font-sf  font-bold text-center text-black mb-6 lg:mb-8">
            Welcome back!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent1"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  className="pl-10 w-full p-3 border border-accent1 text-slate-600 outline-none rounded-lg focus:ring-2 focus:ring-accent2 focus:border-primary placeholder:text-slate-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent1"
                  size={20}
                />
                <input
                  id="password"
                  type="password"
                  className="pl-10 w-full p-3 border border-accent1 text-slate-600 outline-none rounded-lg focus:ring-2 focus:ring-accent2 focus:border-primary placeholder:text-slate-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white transition duration-150 ${
                loading
                  ? "bg-accent2 hover:cursor-not-allowed"
                  : "bg-accent1/80 hover:bg-accent1/90"
              }`}
            >
              {!loading ? "Sign in" : "Signing in ..."}
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Gradient Background */}
      <div className="hidden lg:block w-full lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <img
            src="/loginbg.jpg"
            alt="Students studying"
            className="object-cover w-full h-full mix-blend-overlay"
          />
        </div>
        <div className="relative h-full flex items-center justify-center p-6 lg:p-12">
          <div className="text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">
              Transform Your Learning Journey
            </h2>
            <p className="text-sm lg:text-lg">
              Join our community of learners and educators to experience
              education like never before.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
