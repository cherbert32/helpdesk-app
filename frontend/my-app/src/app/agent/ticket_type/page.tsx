// client side
"use client";

// importing react hooks
// importing the Agent components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';
import { useRouter } from "next/navigation";

// defining tsx type for ticket type that will be displayed
type TicketTypes = {
    id : number;
    type_name: string;
    category: string;
    sub_category: string;
    require_intake_form: boolean;
};

// defining my form schema for new submissions
const schemaNewTicketType = {
    group_id: null,
    sla_id: null,
    type_name: "",
    category: "",
    sub_category: "",
    require_intake_form: false
};

// creating my ticket details function
export default function TicketTypes() {

    // creating constant variables to house all my data and use states
    const [ticketTypes, setTicketType] = useState<TicketTypes[]>([]);
    const [newTicketType, setNewTicketTypes] = useState(schemaNewTicketType);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const response = await fetch("http://localhost:8000/ticket_type/", {
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
                console.log("Fetched ticket types:", data);

                if (Array.isArray(data)) {
                    setTicketType(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catching errors and then logging them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setTicketType([]);
            } finally {
                setLoading(false);
            }
        };
        // calling function
        fetchTicketTypes();
        // ensuring api only runs once 
    }, []);

    // defining new type function
    const handleNewTicketType = async (event: any) => {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/ticket_type/ticket_type_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(newTicketType),
            });

            // ensures response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ticket Type Creation Failed: ${errorText}`);
            }

            alert("Ticket Type has been created");
            setShowPopUp(false);
            // catches any errors
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating Ticket Type");
        }
    };

    // defining navigation function
    const handleViewTicketType = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        localStorage.setItem("ticket_type_id", id.toString());
        router.push('/agent/ticket_type/type_edits');
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Ticket Types</h1>
                </div>

                <button
                    className="bg-white text-black px-4 py-2 rounded"
                    onClick={() => setShowPopUp(true)}
                >
                    Create Ticket Type
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load ticket type: {error}
                    </p>
                )}

                {/* if nothing is found then displays no ticket types found*/}
                {!loading && !error && ticketTypes.length === 0 && (
                    <p className="text-gray-500">No ticket types found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Ticket Type ID</th>
                    <th className="p-4 text-left border-b">Type Name</th>
                    <th className="p-4 text-left border-b">Category</th>
                    <th className="p-4 text-left border-b">SubCategory</th>
                    <th className="p-4 text-left border-b">Intake Form Required?</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each agent and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {ticketTypes.map((ticketType) => (
                    <tr 
                        key={ticketType.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewTicketType(ticketType.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{ticketType.id}</td>
                        <td className="p-4 border-b font-semibold">{ticketType.type_name}</td>
                        <td className="p-4 border-b font-semibold">{ticketType.category}</td>
                        <td className="p-4 border-b font-semibold">{ticketType.sub_category}</td>
                        <td className="p-4 border-b font-semibold">{ticketType.require_intake_form}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewTicketType}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Create Ticket Type</h2>
                            {/* As to avoid having to hardcode input values, learned how to create an object to dynamically create these inputs
                                key={key} essentially helps keep track of each field on its own
                                {key.replace(/_/g, " ")}: because I made these varaibles with and underscore, this removes it; giving it a clearer look.*/}
                            {Object.keys(newTicketType).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // had experienced some issues with an item being undefined, so I put an empty "" and that helped solve my issues
                                        value={(newTicketType as any)[key] ?? ""}
                                        onChange={(event) =>
                                            setNewTicketTypes((previousData) => ({
                                                ...previousData,
                                                [key]: event.target.value,
                                            }))
                                        }
                                        className="w-full border text-black p-2 rounded"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPopUp(false)}
                                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-600 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-800 cursor-pointer"
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
