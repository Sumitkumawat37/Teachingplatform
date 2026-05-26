import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    fetch(`/api/email/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(`Email verified successfully! You can now sign in, ${data.name}.`);
          setTimeout(() => navigate("/login?verified=true"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Invalid or expired verification link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to the verification service. Please try again.");
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-[#12122a]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-900/30 border border-purple-500/15 p-10">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
              <p className="text-gray-500 text-sm">Please wait a moment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-3">Email Verified!</h1>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <p className="text-gray-600 text-xs mb-6">Redirecting to login in 3 seconds…</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Sign In Now
              </button>
            </>
          )}
          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-3">Verification Failed</h1>
              <p className="text-gray-400 text-sm mb-8">{message}</p>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Sign Up Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
