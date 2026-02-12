// client side
"use client";

// importing react hooks
// importing react router
// importing the Agent components
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';


// defining tsx type for my ticket sla information that will be displayed
type TicketSLAs = {
    id : number;
    sla_type: string;
    first_response_time: string;
    resolution_time: string;
};

// defining my form schema for new sla creation
const schemaNewSLAs = {
    sla_type: "",
    first_response_time: "PT48H",
    resolution_time: "PT48H",
};


export default function TicketSLAs() {

    // creating constant variables to house all my data and use states
    const [ticketSLAs, setTicketSLAs] = useState<TicketSLAs[]>([]);
    const [newTicketSLAs, setNewTicketSLAs] = useState(schemaNewSLAs);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        const fetchTicketSLAs = async () => {
            try {
                const response = await fetch("http://localhost:8000/ticket_slas/", {
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

                const data = await response.json();
                console.log("Fetched ticket SLAs:", data);

                if (Array.isArray(data)) {
                    setTicketSLAs(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // closes the pop up if the agent has been created and alerts the agent
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setTicketSLAs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketSLAs();
    }, []);

    // defining new ticket sla function
    const handleNewTicketSLA = async (event: any) => {
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/ticket_slas/sla_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(newTicketSLAs),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ticket SLA Creation Failed: ${errorText}`);
            }

            alert("Ticket SLA has been created");
            setShowPopUp(false);
            // catch any errors and then log them
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating Ticket SLA");
        }
    };

    const handleViewTicketSLA = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        localStorage.setItem("sla_id", id.toString());
        router.push('/agent/ticket_sla/sla_edits');
    };
        // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
    
        setNewTicketSLAs(currentSLA => ({ ...currentSLA, [name]: value }));
    
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Service Level Agreements</h1>
                </div>

                <button
                    className="mt-2 w-40 p-2 bg-white text-black shadow-lg border rounded hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowPopUp(true)}
                >
                    Create Service Level Agreement
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load service level agreement: {error}
                    </p>
                )}

                {/* displays the "No SLAs found" message if there array was empty*/}
                {!loading && !error && ticketSLAs.length === 0 && (
                    <p className="text-gray-500">No SLAs found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">SLA ID</th>
                    <th className="p-4 text-left border-b">SLA Type</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each agent and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {ticketSLAs.map((ticketSLA) => (
                    <tr 
                        key={ticketSLA.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewTicketSLA(ticketSLA.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{ticketSLA.id}</td>
                        <td className="p-4 border-b font-semibold">{ticketSLA.sla_type}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                
                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewTicketSLA}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Create SLA</h2>
                            <div className="mb-4">
                                <label className ="block text-sm font-medium text-black mb-1">SLA Type</label>
                                <input
                                    name="sla_type"
                                    value={newTicketSLAs.sla_type}
                                    onChange={handleInputChange}
                                    className="w-full border text-black p-2 rounded"
                                />
                            </div>

                            <div className="mb-4">
                                <label className ="block text-sm font-medium text-black mb-1">First Response Time</label>
                                <select
                                    name="first_response_time"
                                    value={newTicketSLAs.first_response_time}
                                    onChange={handleInputChange}
                                    className="w-full border text-black p-2 rounded"
                                >
                                    <option value="PT48H"> 2 days</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className ="block text-sm font-medium text-black mb-1">Resolution Time</label>
                                <select
                                    name="resolution_time"
                                    value={newTicketSLAs.resolution_time}
                                    onChange={handleInputChange}
                                    className="w-full border text-black p-2 rounded"
                                >
                                    <option value="PT72H"> 3 days</option>
                                    <option value="PT96H"> 4 days</option>
                                    <option value="PT120H"> 5 days</option>
                                    <option value="PT144H"> 6 days</option>
                                    <option value="PT168H"> 7 days</option>
                                    <option value="PT192H"> 8 days</option>
                                    <option value="PT216H"> 9 days</option>
                                    <option value="PT240H"> 10 days</option>
                                </select>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPopUp(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Create SLA
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );

}
