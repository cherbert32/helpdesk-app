// client side
"use client";

// importing react hooks
// importing agent components
// importing recharts
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import UserSidebar from "@/app/components/user_sidebar";
import UserNotifBar from '@/app/components/user_notifbar';

// creating a list of colors that allow up to 6 different colors
// grabbed these colors from colors that meet ada compliance
const COLORS = ["#0056D2", "#009688", "#FFB300", "#FB8C00", "#7C4DFF", "#E91E63"];

// creating my user dashboard function
export default function UserDashboard() {

   // creating my constant variables that will house
  const [statusData, setStatusData] = useState([]);
  const [employeeTypeData, setEmployeeTypeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // creating my constant variables for each dashboard; repeating similar logic for each item
        const ticketStatusResponse = await fetch("http://localhost:8000/analytics/tickets_by_status", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("user_token") || ""}` 
        },
      });

        const employeeTypeResponse = await fetch("http://localhost:8000/analytics/tickets_by_employee_type", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("user_token") || ""}` 
        },
      });

      // checking to see if any of these varaibles are not okay. if they return an error then they should all throw an error code for simplicity sakes
      // in the future this would be separated
        if (!ticketStatusResponse.ok || !employeeTypeResponse.ok) {
          throw new Error("Error fetching data");
        }

        // parsing each json and setting the state
        // originally had the items below separated but was educated on how to make this even better and reduce the amount that I need to type

        // historic example below 

        // const ticketStatusData = await ticketStatusResponse.json();
        // setAverageSatisfaction(ticketStatusData);

        setStatusData(await ticketStatusResponse.json());
        setEmployeeTypeData(await employeeTypeResponse.json());

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
    // had to call the user notification bar in under a separate div because it started to display incorrectly
    <div className="flex h-screen">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex justify-end p-4">
          <UserNotifBar />
        </div>

        <main className="p-8">
          <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-8">
              {/* Pie chart for tickets by their status */}
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Tickets by Status</h2>
                <PieChart width={400} height={400}>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="ticket_status"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {/* Sets the colors for each variable (currently only supports 6 colors for each group as there only two groups: Comms and Tech) */}
                    {/* Colors are set based on the index of the item; 0 = #0056D2, etc */}
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>

              {/* Pie chart for tickets by employee type */}
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-4">Tickets by Employee Type</h2>
                <PieChart width={400} height={400}>
                  <Pie
                    data={employeeTypeData}
                    dataKey="count"
                    nameKey="employee_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {/* Sets the colors for each variable (currently only supports 6 colors for each group as there only two groups: Comms and Tech) */}
                    {/* Colors are set based on the index of the item; 0 = #0056D2, etc */}
                    {employeeTypeData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
