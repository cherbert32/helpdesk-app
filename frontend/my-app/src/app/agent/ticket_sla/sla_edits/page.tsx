// client side
"use client";

// importing react hooks
// importing the Agent components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';


// defining tsx type for slas that will be displayed
type TicketSLA = {
    id : number;
    sla_type: string;
    first_response_time: string;
    resolution_time: string;
};

// defining my form schema for sla changes
const schemaSLAChanges = {
    sla_type: "",
    first_response_time: "",
    resolution_time: "",
};


// creating my ticket sla function
export default function TicketSLADetails() {
    const [ticketSLA, setTicketSLA] = useState<TicketSLA | null>(null);
    const [ticketSLAChanges, setTicketSLAChanges] = useState(schemaSLAChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [ticketSLAID, setTicketSLAID] = useState<string | null>(null);
    
    useEffect(() => {
        // fetching my localstorage for the sla id from the initial agents page
        const fetchSLA = async () => {
            const storedTicketSLAID = localStorage.getItem("sla_id");
            setTicketSLAID(storedTicketSLAID);
            if (!storedTicketSLAID) {
                setError("No ticket sla id found in local storage");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:8000/ticket_slas/${storedTicketSLAID}`, {
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
                setTicketSLA(data);
                setTicketSLAChanges({
                    sla_type: data.sla_type,
                    first_response_time: data.first_response_time,
                    resolution_time: data.resolution_time,
                });
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setTicketSLA(null);
            } finally {
                setLoading(false);
            }
        };

        // calling the function
        fetchSLA();
        //ensuring that the api calls only once
    }, []);

    // code for ticket type updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

        // this prevents any entry from nulling all other entries if they are not interacted with
        setTicketSLAChanges(ticketSLAChanges => ({ ...ticketSLAChanges, [name]: value }));

    };
    // defining sla update function
    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {   
            const response = await fetch(`http://localhost:8000/ticket_slas/sla_update/${ticketSLAID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(ticketSLAChanges),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }
            alert("Ticket SLA updated successfully");
            setShowPopUp(false);
            // catching errors and then logging them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating ticket sla");
        }
    };

    // defining deletion function
    const handleDeletion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/ticket_slas/sla_deletion/${ticketSLAID}`, {
                method: "DELETE",
                headers: {
                    // kept getting an error here because backend code wasn't expecting json
                    //"Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
            });
            
            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deletion Failed: ${errorText}`);
            }

            alert("Ticket SLA has been deleted");
            // catching errors and then logging them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to delete the ticket sla");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Current Service Level Agreement {ticketSLAID}</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit SLA
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete SLA
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                 {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load SLAs: {error}</p>}

                {/* if nothing is found then displays no slas found*/}
                {!loading && !error && !ticketSLA && <p className="text-gray-500">No SLAs found.</p>}

                {/* This will display the items in top bottom format for the selected sla*/}
                {ticketSLA && (
                    <div className="bg-gray-600 p-4 shadow rounded text-black">
                        <p><strong>SLA Type:</strong> {ticketSLA.sla_type}</p>
                        <p><strong>First Response Time:</strong> {ticketSLA.first_response_time}</p>
                        <p><strong>Resolution Time:</strong> {ticketSLA.resolution_time}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Service Level Agreement</h2>
                            {/* this section is based on the schema options*/}
                            {/* experiencing errors when doing first response time and resolution time*/}
                            {/* backend is expecting time interval so hh:mm:ss*/}
                            {/* need to convert the available options into a dropdown with preselected days*/}
                            {/* values from 2 days to 10 days (in hours) will be added for now*/}
                            <div className="mb-4">
                                <label className ="block text-sm font-medium text-black mb-1">SLA Type</label>
                                <input
                                    name="sla_type"
                                    value={ticketSLAChanges.sla_type}
                                    onChange={handleInputChange}
                                    className="w-full border text-black p-2 rounded"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className ="block text-sm font-medium text-black mb-1">First Response Time</label>
                                <select
                                    name="first_response_time"
                                    value={ticketSLAChanges.first_response_time}
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
                                    value={ticketSLAChanges.resolution_time}
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
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
