import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import axios from "axios";

const OTP_COOLDOWN = 300; // 5 minutes

const AdminAuth = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

     const res = await axios.post("/api/user/login", {
       email,
       password,
     });

     if (!res.data.success) {
      console.log(res.data.message);
       toast.error(res.data.message);
       return;
     }

      setUser(res.data.user);
      toast.success(res.data.message);
      
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!mobile) return toast.error("Enter mobile number");

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/login/otp/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("OTP sent on WhatsApp 📲");
      setOtpSent(true);
      setTimer(OTP_COOLDOWN);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");

    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/login/otp/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mobile, otp }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUser(data.user);
      toast.success(data.message);
      
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover relative bg-no-repeat w-full bg-center  bg-gray-100"
      style={{
        backgroundImage: "url('/loginbg.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <form
        onSubmit={handleEmailLogin}
        className=" relative z-10  w-[500px] rounded-xl  bg-white/10  ring-1 ring-white/30 p-6 py-12 text-white"
      >
        <div className=" flex justify-center items-center gap-3 mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="37"
              height="36"
              viewBox="0 0 37 36"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clip-rule="evenodd"
                d="M35.07 35.1435C35.07 35.1435 29.264 26.2731 33.9124 17.5718C39.1068 7.84895 34.86 -4.29153e-06 34.86 -4.29153e-06H2.74747C2.74747 -4.29153e-06 6.98672 7.84755 1.79657 17.569C-2.85004 26.2723 2.98433 35.1435 2.98433 35.1435H35.07Z"
                fill="white"
              />
            </svg>
          </div>
          <div className=" flex flex-col ">
            <h1 className=" text-2xl/[20px] font-semibold ">
              E-Commerce Store
            </h1>
            <Link
              to={"https://rebootai.in/"}
              target="_blank"
              className=" text-[#9B9B9B] font-medium"
            >
              By RebootAi
            </Link>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Welcome Back Admin
        </h2>

        {/* EMAIL LOGIN */}

        <input
          type="email"
          placeholder="Email"
          className="w-full  p-2 mb-3 h-[3.5rem] rounded bg-white/10 ring-1 ring-white/30 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full  p-2 h-[3.5rem] mb-4 rounded bg-white/10 ring-1 ring-white/30 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-[#1252D4] hover:brightness-125 text-white py-2 font-semibold rounded h-[3.5rem]"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <div className="flex items-center my-5">
          <div className="grow border-t" />
          <span className="mx-3 text-[#9B9B9B] text-sm">OR</span>
          <div className="grow border-t" />
        </div>

        {/* WHATSAPP LOGIN */}
        <button
          type="button"
          onClick={() => setShowOtpModal(true)}
          className="w-full border border-white text-white py-2 h-[3.5rem] font-semibold rounded hover:bg-green-50 hover:text-green-600"
        >
          Login via Whatapp OTP
        </button>

        <div className=" mt-4 flex justify-center items-center flex-col  text-center">
          <div className=" text-sm">Support Helpline +91 9088576170</div>
          <div className=" text-sm">Monday to Saturday 11:00 am - 6:00 pm</div>
        </div>
        <div className=" mt-6 flex flex-row gap-2 items-center justify-center">
          <div className=" text-sm">Follow Us</div>
          <div className=" text-base flex flex-row gap-1">
            <Link to={"https://www.facebook.com/therebootai"} target="_blank">
              <FaFacebook />
            </Link>
            <Link to={"https://www.instagram.com/therebootai/"} target="_blank">
              <FaInstagram />
            </Link>
            <Link to={"#"}>
              <FaLinkedinIn />
            </Link>
            <Link to={"https://x.com/therebootai"} target="_blank">
              <FaTwitter />
            </Link>
          </div>
        </div>
      </form>

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg w-[340px]">
            <h3 className="text-lg font-semibold mb-4 text-center">
              WhatsApp OTP Login
            </h3>

            {!otpSent ? (
              <>
                <input
                  placeholder="Enter mobile number"
                  className="w-full border p-2 mb-4 rounded"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />

                <button
                  disabled={loading || timer > 0}
                  onClick={sendOtp}
                  className="w-full bg-green-600 text-white py-2 rounded"
                >
                  Send OTP
                </button>
              </>
            ) : (
              <>
                <input
                  placeholder="Enter OTP"
                  className="w-full border p-2 mb-3 rounded"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  disabled={loading}
                  onClick={verifyOtp}
                  className="w-full bg-black text-white py-2 rounded"
                >
                  Verify & Login
                </button>

                {timer > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Resend OTP in {timer}s
                  </p>
                )}
              </>
            )}

            <button
              className="text-sm text-gray-500 mt-4 block mx-auto underline"
              onClick={() => {
                setShowOtpModal(false);
                setOtpSent(false);
                setOtp("");
                setMobile("");
                setTimer(0);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuth;
