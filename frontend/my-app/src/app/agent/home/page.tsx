// client side
"use client";

// importing required react hooks
import { useEffect, useState } from "react";

// importing required "pacakges" from recharts that allow me to create pie charts
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// importing my required agent components
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from "@/app/components/agent_notifbar";

// creating a list of colors that allow up to 6 different colors
// grabbed these colors from colors that meet ada compliance
const COLORS = ["#0056D2", "#009688", "#FFB300", "#FB8C00", "#7C4DFF", "#E91E63"];


// creating my user dashboard function
export default function AgentDashboard() {

  // creating my constant variables that will house
  const [averageSatisfaction, setAverageSatisfaction] = useState<number | null>(null);
  const [firstResponseDelinquency, setFirstResponseDelinquency] = useState<number | null>(null);
  const [reopenedTickets, setReopenedTickets] = useState<number | null>(null);
  const [resolvedByAgent, setResolvedByAgent] = useState([]);
  const [resolvedByGroup, setResolvedByGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // creating my constant variables for each dashboard; repeating similar logic for each item
        const averageSatisfactionResponse = await fetch("http://localhost:8000/analytics/average_satisfaction", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}` 
        },
      });

        const delinquencyResponse = await fetch("http://localhost:8000/analytics/total_first_response_delinquency", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}` 
        },
      });

        const reopenedResponse = await fetch("http://localhost:8000/analytics/reopened_tickets", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}` 
        },
      });

        const resolvedAgentResponse = await fetch("http://localhost:8000/analytics/total_tickets_resolved_by_agents", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}` 
        },
      });

        const resolvedGroupResponse = await fetch("http://localhost:8000/analytics/total_tickets_resolved_by_groups", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}` 
        },
      });
        
      // checking to see if any of these varaibles are not okay. if they return an error then they should all throw an error code for simplicity sakes
      // in the future this would be separated 
        if (!averageSatisfactionResponse.ok || !delinquencyResponse.ok || !reopenedResponse.ok || !resolvedAgentResponse.ok || !resolvedGroupResponse.ok) {
          throw new Error("Error fetching data");
        }
        
        // parsing each json and setting the state
        // originally had the items below separated but was educated on how to make this even better and reduce the amount that I need to type

        // historic example below 

        // const averageSatisfactionData = await averageSatisfactionResponse.json();
        // setAverageSatisfaction(averageSatisfactionData);
        
        setAverageSatisfaction(await averageSatisfactionResponse.json());
        setFirstResponseDelinquency(await delinquencyResponse.json());
        setReopenedTickets(await reopenedResponse.json());
        setResolvedByAgent(await resolvedAgentResponse.json());
        setResolvedByGroup(await resolvedGroupResponse.json());
      
        // catching and logging any errors
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // calling the function
    fetchData();
    // makes sure this only runs once
  }, []);

  return (
    // had to call the agent notification bar in under a separate div because it started to display incorrectly
    <div className="flex h-screen">
      <AgentSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex justify-end p-4">
          <AgentNotifBar />
        </div>

        <main className="p-8">
          <h1 className="text-2xl font-bold mb-2">Agent Dashboard</h1>

          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <>
              {/* creating my top section that houses current metrics*/}
              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="bg-white shadow-md rounded p-6 text-center">
                  <h2 className="text-black text-md">Avg. Satisfaction</h2>
                  <p className="text-3xl font-bold text-blue-900">{averageSatisfaction?.toFixed(2)}</p>
                </div>
                <div className="bg-white shadow-md rounded p-6 text-center">
                  <h2 className="text-black text-md">First Response Delinquency</h2>
                  <p className="text-3xl font-bold text-red-900">{firstResponseDelinquency}</p>
                </div>
                <div className="bg-white shadow-md rounded p-6 text-center">
                  <h2 className="text-black text-md">Reopened Tickets</h2>
                  <p className="text-3xl font-bold text-orange-900">{reopenedTickets}</p>
                </div>
              </div>


              {/* Bar Chart Below */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-4">Tickets Resolved by Agent</h2>
                  <BarChart width={500} height={300} data={resolvedByAgent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="full_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </div>
                

                {/* Pie Chart Below */}
                <div className="flex flex-col items-center">
                  <h2 className="text-xl font-semibold mb-4">Tickets Resolved by Group</h2>
                  <PieChart width={400} height={400}>
                    <Pie
                      data={resolvedByGroup}
                      dataKey="count"
                      nameKey="group_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label
                    >
                      {/* Sets the colors for each variable (currently only supports 6 colors for each group as there only two groups: Comms and Tech) */}
                      {/* Colors are set based on the index of the item; 0 = #0056D2, etc */}
                      {resolvedByGroup.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
