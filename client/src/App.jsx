import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import "./index.css";

/**
 * Main Application Component
 * Isme humne Dashboard ko wrap kiya hai taaki future mein 
 * agar aapko Routing ya Context add karna ho toh asani ho.
 */
function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <SignUp onSignUp={setUser} />;
  }

  return (
    <div className="App">
      <Dashboard user={user} onLogout={() => {
        setUser(null);
        // localStorage.removeItem("userCredentials"); // Do not wipe credentials on logout
      }} />
    </div>
  );
}

export default App;