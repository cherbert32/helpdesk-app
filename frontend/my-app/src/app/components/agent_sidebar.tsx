// this tells next.js to run on the client side
"use client";

// importing react hooks and navigation
import { useState } from "react";
import { useRouter } from "next/navigation";


// creating my agent side bar function
export default function AgentSidebar() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <div className="p-4 bg-black h-screen w-64">

      <div className="mt-16 space-y-2">
      <button
        type="button"
        className="w-full p-4 bg-white text-black rounded-lg shadow-md cursor-pointer hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
        onClick= {() => router.push("/agent/home")}
        disabled={loading}
      >
        {loading ? "Navigating to..." : "Home"}
      </button>


      <button
        type="button"
        className="w-full p-4 bg-white text-black rounded-lg shadow-md cursor-pointer hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
        onClick= {() => router.push("/agent/tickets")}
        disabled={loading}
      >
        {loading ? "Navigating to..." : "Tickets"}
        </button>

        <button
        type="button"
        className="w-full p-4 bg-white text-black rounded-lg shadow-md cursor-pointer hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
        onClick= {() => router.push("/agent/approvals")}
        disabled={loading}
      >
        {loading ? "Navigating to..." : "Approvals"}
        </button>

        <button
        type="button"
        className="w-full p-4 bg-white text-black rounded-lg shadow-md cursor-pointer hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
        onClick= {() => router.push("/agent/users")}
        disabled={loading}
      >
        {loading ? "Navigating to..." : "Users"}
        </button>


        <button
        type="button"
        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
        onClick= {() => router.push("/agent/settings")}
        disabled={loading}
      >
        {loading ? "Navigating to..." : "Settings"}
        </button>
      </div>
    </div>
  );
}
