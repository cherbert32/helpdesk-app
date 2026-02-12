// client side
"use client";

// importing react hooks
import { useEffect, useState } from "react";
// importing react router
import { useRouter } from "next/navigation";
// importing the Agent side navigation bar
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for tickets that will be displayed
type Tickets = {
    id : number;
    title: string;
    agent_id: number;
    group_id: number;
    ticket_status: string;
    submitted_on: string;
};


// creating my tickets function
export default function Tickets() {
    const [tickets, setTickets] = useState<Tickets[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch("http://localhost:8000/tickets/agent/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // Ensure response is okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                // creating a constant data variable that houses the json from the api call
                const data = await response.json();
                console.log("Fetched tickets:", data);

                // if the data is not in an array format, then throw an error code
                if (Array.isArray(data)) {
                    setTickets(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting the array into an empty array ensures that no incorrect data is displayed
                setTickets([]);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchTickets();
        //ensuring that the api calls only once
    }, []);



    const handleViewTicket = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // when agent clicks on the button then it takes them to the ticket history screen
        localStorage.setItem("ticket_id", id.toString());
        router.push('/agent/tickets/ticket_history');
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Tickets</h1>
                </div>


                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load tickets: {error}
                    </p>
                )}

                {/* displays the "no approvals found" message if there array was empty*/}
                {!loading && !error && tickets.length === 0 && (
                    <p className="text-gray-500">No tickets found.</p>
                )}
                
                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Ticket ID</th>
                    <th className="p-4 text-left border-b">Title</th>
                    <th className="p-4 text-left border-b">Agent ID</th>
                    <th className="p-4 text-left border-b">Group ID</th>
                    <th className="p-4 text-left border-b">Ticket Status</th>
                    <th className="p-4 text-left border-b">Submitted On</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each feedback and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {tickets.map((ticket) => (
                    <tr 
                        key={ticket.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewTicket(ticket.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{ticket.id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.title}</td>
                        <td className="p-4 border-b font-semibold">{ticket.agent_id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.group_id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.ticket_status}</td>
                        <td className="p-4 border-b font-semibold">{ticket.submitted_on}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </main>
        </div>
    );

}
