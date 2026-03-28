import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API } from "@/lib/api";
import axios from "axios";

const LOGO_URL = "https://customer-assets.emergentagent.com/job_instant-roadtax/artifacts/kuquahg0_insta%20logo.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter your username and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password,
      });
      
      if (response.data.success) {
        sessionStorage.setItem("adminAuth", "true");
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 flex items-center justify-center py-8" data-testid="admin-login-page">
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src={LOGO_URL} alt="InstaRoadTax" className="w-12 h-12 rounded-lg" />
            <span className="text-xl font-bold text-indigo-600">Instaroadtax.my</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-500">Enter your admin credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-light mt-2"
                  data-testid="input-admin-username"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-light mt-2"
                  data-testid="input-admin-password"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-6"
                data-testid="btn-admin-login"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
