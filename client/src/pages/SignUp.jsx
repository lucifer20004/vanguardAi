import { useState } from "react";

export default function SignUp({ onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [error, setError] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);

  // Save credentials to localStorage on signup
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !targetJob) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    localStorage.setItem("userCredentials", JSON.stringify({ email, password, targetJob }));
    onSignUp({ email, password, targetJob });
  };

  // Sign in logic
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    const creds = JSON.parse(localStorage.getItem("userCredentials") || "{}");
    if (creds.email === signInEmail && creds.password === signInPassword) {
      setSignInError("");
      onSignUp(creds);
    } else {
      setSignInError("Invalid email or password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F2D9A0]">
      <div className="bg-[#F2D9A0] p-8 rounded-xl shadow-red w-96 flex flex-col gap-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setShowSignIn(false)}
            className={
              showSignIn
                ? "bg-[#F2D9A0] text-red-600 border border-red-600 shadow-red"
                : "bg-red-600 text-white border border-red-600 shadow-red"
            }
            style={{ boxShadow: '0 2px 8px 0 #D7263D' }}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setShowSignIn(true)}
            className={
              !showSignIn
                ? "bg-[#F2D9A0] text-red-600 border border-red-600 shadow-red"
                : "bg-red-600 text-white border border-red-600 shadow-red"
            }
            style={{ boxShadow: '0 2px 8px 0 #D7263D' }}
          >
            Sign In
          </button>
        </div>
        {!showSignIn ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sign Up</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 text-sm"
            />
            <input
              type="text"
              placeholder="Target Job (e.g. Software Developer)"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              className="border p-2 text-sm"
            />
            {error && <div className="text-red-600 text-xs font-semibold">{error}</div>}
            <button
              type="submit"
              className="bg-red-600 text-white border border-red-600 shadow-red"
              style={{ boxShadow: '0 2px 8px 0 #D7263D' }}
            >
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Sign In</h2>
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className="border p-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="border p-2 text-sm"
            />
            {signInError && <div className="text-red-600 text-xs font-semibold">{signInError}</div>}
            <button
              type="submit"
              className="bg-red-600 text-white border border-red-600 shadow-red"
              style={{ boxShadow: '0 2px 8px 0 #D7263D' }}
            >
              Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
