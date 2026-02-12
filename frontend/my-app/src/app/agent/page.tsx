// this tells next.js to run on the client side
"use client";

// due to the similarity between the agent login and user login, this page is a
// direct copy of the user login page but switches out the last button

// importing required react hooks
import { useState } from "react";

// importing router to link to other screens
import { useRouter } from "next/navigation";

// creating a function that will house agent login page
export default function AgentLoginPage() {

  // creating constant variables that will be used for this page/function
  const [userEmail, setAgentEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // creating a handl logging function as a async in order to allow functions to wait for api
  const handleLogin = async (e: React.FormEvent) => {
    // prevents page from reloading data 
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      // creating a constant body variable to hold user credentials from form
      const body = new URLSearchParams();
      body.append("username", userEmail);
      body.append("password", password);
      
      // logging the submission
      // my manager taught me how to debug using my browsers developor console as it can help knowing where some issues arise
      // included it to scale debugging issues in the future
      console.log("Submitting login with:", body.toString());
      
      // constant response variable to house the response from the API call
      // await means that it will wait until there is a response from the api to call
      const response = await fetch("http://localhost:8000/agents/agent_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // this sends the body of the URLSearchParams into the api call
        body: body.toString(),
      });
      
      // creating a data variable to house the response of the api call
      const data = await response.json();
  
      //if the response is not between 200-299 then that means something went wrong and it returns an error message
      if (!response.ok) {
        setMessage(data.detail || "Login failed.");
      } else {
        // if the login is successful, within the 200-299 range, then stores the user authentication token for later use
        localStorage.setItem("agent_token", data.access_token);
        setMessage("Login successful!");
        router.push("/agent/home");
      }
    } catch (error) {
      // if something happens, like a backend server being down, then catch that error and display it
      console.error("Login error:", error);
      setMessage("Server error. Please try again.");
    } finally {
      // set loading to false if it fails or succedds
      setLoading(false);
    }
  };
  

  return (
    // building out a form that allows the user to enter their credentials
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Agent Login</h1>
      {/* Creating email input */}
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
        value={userEmail}
        onChange={(e) => setAgentEmail(e.target.value)}
        required
      />

      {/* Creating password input */}
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-950 disabled:opacity-50 cursor-pointer"
        // based on the setLoading button, when loading is true, this prevents the button from being clicked on twice
        // if it is true, the button now reads "Loggin in..." if it's false, it reads "Login"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        type="button"
        className="w-full rounded px-4 py-2 bg-gray-600 text-white  hover:bg-gray-800 cursor-pointer"
        // when the user clicks the button, it takes them to the agent log in page
        onClick={() => router.back()}
      >
        {loading ? "Sending to...": "Go Back"}
      </button>
      {/* based on the logged setMessage variables. Displays whatever gets logged. */}
      {message && (
        <p className="text-sm text-center mt-2 text-white font-medium">{message}</p>
      )}
    </form>
  );
}
