// client side
"use client";

// importing react hooks
// importing the Agent components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for ticket types that will be displayed
type TicketType = {
    id: number;
    group_id: number;
    sla_id: number;
    type_name: string;
    category: string;
    sub_category: string;
    require_intake_form: boolean;
};

// defining my form schema for type changes
const schemaTypeChanges = {
    id: null,
    group_id: null,
    sla_id: null,
    type_name: "",
    category: "",
    sub_category: "",
    require_intake_form: false
};

// creating my approvals details function
export default function TicketTypeDetails() {
    // creating constant variables to house all my data and use states
    const [ticketType, setTicketType] = useState<TicketType | null>(null);
    const [ticketTypeChanges, setTicketTypeChanges] = useState(schemaTypeChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [ticketTypeID, setTicketTypeID] = useState<string | null>(null);

    useEffect(() => {
        // fetching my localstorage for the ticket_type_id from the initial users page
        const storedTicketTypeID = localStorage.getItem("ticket_type_id");

        if (!storedTicketTypeID) {
            setError("No ticket type id found in local storage");
            setLoading(false);
            return;
        }

        setTicketTypeID(storedTicketTypeID);

        const fetchTicketType = async () => {
            try {
                const response = await fetch(`http://localhost:8000/ticket_type/${storedTicketTypeID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // ensuring response is okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                const data = await response.json();
                setTicketType(data);
                setTicketTypeChanges({
                    id: data.id,
                    group_id: data.group_id,
                    sla_id: data.sla_id,
                    type_name: data.type_name,
                    category: data.category,
                    sub_category: data.sub_category,
                    require_intake_form: data.require_intake_form
                });
                // catching any errors and then logging them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setTicketType(null);
            } finally {
                setLoading(false);
            }
        };

        fetchTicketType();
        // ensuring api is only called once
    }, []);

    // code for ticket type updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setTicketTypeChanges(ticketTypeChanges => ({ ...ticketTypeChanges, [name]: value }));
    };

    // define submssion function
    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/ticket_type/ticket_type_update/${ticketTypeID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(ticketTypeChanges),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }
            alert("Ticket type updated successfully");
            setShowPopUp(false);
            // catching any errors and then logging them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating ticket type");
        }
    };

    // defining deletion function
    const handleDeletion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/ticket_type/ticket_type_deletion/${ticketTypeID}`, {
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

            alert("Ticket type has been deleted");
            // catches and logs any errors
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attempting to delete the ticket type");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Current Ticket Type {ticketTypeID}</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit Ticket Type
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete Ticket Type
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load ticket types: {error}</p>}

                {/* if nothing is found then displays no approvals found */}
                {!loading && !error && !ticketType && <p className="text-gray-500">No ticket types found.</p>}

                {/* This will display the items in top bottom format for the selected ticket types */}
                {ticketType && (
                    <div className="bg-gray-600 p-4 shadow rounded text-black">
                        <p><strong>Ticket Type Id:</strong> {ticketType.id}</p>
                        <p><strong>Group Id:</strong> {ticketType.group_id}</p>
                        <p><strong>SLA Id:</strong> {ticketType.sla_id}</p>
                        <p><strong>Type Name:</strong> {ticketType.type_name}</p>
                        <p><strong>Category:</strong> {ticketType.category}</p>
                        <p><strong>Sub Category:</strong> {ticketType.sub_category}</p>
                        <p><strong>Intake Form Required:</strong> {ticketType.require_intake_form ? "Yes" : "No"}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Ticket Types</h2>

                            {/* created an object that displays the available schema for ticket types edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space */}
                            {Object.keys(ticketTypeChanges).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(ticketTypeChanges as any)[key] ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full border text-black p-2 rounded"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPopUp(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
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
