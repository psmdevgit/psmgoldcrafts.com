"use client";


import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/loginpage.css"; // ✅ Ensure your custom CSS is loaded
import pothylogo from "../../assets/PothysLogo.png"  // ✅ Import your logo image
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // API base URL (Uses `.env.local` for flexibility)
  const API_BASE_URL = "https://erp-server-r9wh.onrender.com" ;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // ✅ Client-side validation before sending request
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");

      setLoading(false);
      return;
    }


    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        console.log("✅ Login successful!", data);
        localStorage.setItem("username", username); 
console.log(username);
     // Determine redirect URL
    let redirectUrl: string;
    switch (username?.toLowerCase()) {
      case "casting":
        redirectUrl = "/Departments/Casting/casting_table";
        break;
      case "pouch":
        redirectUrl = "/Departments/Filing/add_filing_details/Grinding_Table";
        break;
      case "grinding":
        redirectUrl = "/Departments/Grinding/Grinding_Table";
        break;
      case "setting":
        redirectUrl = "/Departments/Setting/Setting_Table";
        break;
      case "polishing":
        redirectUrl = "/Departments/Polishing/Polishing_Table";
        break;
      case "dull":
        redirectUrl = "/Departments/Dull/Dull_Table";
        break;
      case "plating":
        redirectUrl = "/Departments/Plating/Plating_Table";
        break;
      case "cutting":
        redirectUrl = "/Departments/Cutting/Cutting_Table";
        break;
      default:
        redirectUrl = "/Orders"; // 👈 Default Orders URL
        break;
    }
        
// Redirect user
    router.push(redirectUrl);
      } else {
        setError(data.error || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  
  return (
  
    <div className="container bods " >
      <div className="form">
        <div className="sign-in-section">
<div className="flex justify-center items-center flex-col">
          <Image src={pothylogo} alt="Pothys Logo" className="logo" width={200} height={200}/>                        
  <h3>PSM GOLD CRAFTS</h3> 
</div>

<div className="form-content">
  {error && <p className="error-message">{error}</p>}
</div>

          <h1>Log in</h1>

          <form onSubmit={handleLogin}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <div className="checkbox-field">
                <input id="rememberMe" type="checkbox" />
                <label htmlFor="rememberMe">Remember Me</label>
              </div>
              {/* <a href="#">Forgot Password?</a> */}
            </div>

            <button type="submit" className={`btn btn-signin bg-maroon-700 hover:bg-maroon-800 text-white`}   disabled={loading}>
              {loading ? "Logging in..." : "Submit"}
            </button>
          </form>

          {/* ✅ Terms & Conditions and Privacy Policy Links */}
          <div className="links">
            {/* <a href="/terms-and-conditions">Terms & Conditions</a>
            <a href="/privacy-policy">Privacy Policy</a> */}
          </div>
        </div>
      </div>
      
    </div>
 
  );
}
