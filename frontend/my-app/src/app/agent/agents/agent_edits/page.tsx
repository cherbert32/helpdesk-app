// client side
"use client";


// importing react hooks
// importing react router
// importing the Agent components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for my agent information that will be displayed
type Agent = {
    id: number;
    full_name: string;
    email: string;
    password: string;
    agent_type: string;
    group_id: number;
    active: boolean;
    created_at: string;
    created_by: number;
    updated_by: number;
    updated_at: string;
};

// defining my form schema for agent updates
const schemaAgentChanges = {
    full_name: "",
    email: "",
    password: "",
    agent_type: "",
    group_id: 0,
    active: true
};


// creating my agents details functions
export default function AgentDetails() {

    // creating constant variables to house all my data and use states
    const [agent, setAgent] = useState<Agent | null>(null);
    const [agentChanges, setAgentChanges] = useState(schemaAgentChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [agentID, setAgentID] = useState<string | null>(null);

    

    useEffect(() => {
        // fetching my localstorage for the user_id from the initial users page
        const fetchAgent = async () => {
            // for whatever reason, some pages responseulted in the stored ids being null. my assumption is that it would run the function faster than what it does to load
            // or identify the id. created a variable to ensure the first fetch always has an id and the responsets can pull the stored id without any issues
            const storedAgentID = localStorage.getItem("agent_id");
            
            // throws out an error if the item fails
            if (!storedAgentID) {
                setError("No agent id found in local storage");
                setLoading(false);
                return;
            }
            setAgentID(storedAgentID);
            try {
                // using my stored agent id to pull the specific details of the agent
                const response = await fetch(`http://localhost:8000/agents/${storedAgentID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // Ensure responseponse is okay; 200-299
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                // creating a constant data variable that houses the json from the api call
                const data = await response.json();
                setAgent(data);
                // setting the updated form items to what was pulled from the api call
                setAgentChanges({
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    agent_type: data.agent_type,
                    group_id: data.group_id,
                    active: data.active
                });
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // if an error occurs, set the error agent to null
                setAgent(null);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchAgent();
        // ensuring that the API calls only once
    }, []);

    // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

        // updating the agent details with the new value without affecting the other values if I don't update them
        // without this, it would overwrite all items if left blank :(
        setAgentChanges( agentChanges =>({ ...agentChanges, [name]: value }));

    };

    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page; my assumption is that once it reloads it loses the id
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/agents/agent_update/${agentID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                // making the updates into a json format 
                body: JSON.stringify(agentChanges),
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }
            // alerts the agent that the user has been created and closes the pop up
            alert("Agent updated successfully");
            setShowPopUp(false);
            // catches and logs any errors
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating agent");
        }
    };

    // defining my deactivation function
    const handleDeactivate = async () => {
        try {
            const response = await fetch(`http://localhost:8000/agents/agent_deactivation/${agentID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },

            });
            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deactivation Failed: ${errorText}`);
            }
            // alerts the agent that the agent has been deactivated
            alert("Agent has been deactivated");
            // catches any error and logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while deactivating agent");
        }
    };

    // defining my deletion function
    const handleDeletion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/agents/agent_deletion/${agentID}`, {
                method: "DELETE",
                headers: {
                    // kept getting an error here because backend code wasn't expecting json
                    //"Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
            });
            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deletion Failed: ${errorText}`);
            }

            // alerts the agent that the agent has been deleted
            alert("Agent has been deleted");
            // catches any error and logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to delete the agent");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Current Agent ID: {agentID}</h1>

                <div className="flex space-x-6 mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit Agent
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-amber-600 text-white hover:bg-amber-900 cursor-pointer"
                        onClick={handleDeactivate}
                    >
                        Deactivate Agent
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete Agent
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load agent: {error}</p>}

                {/* if nothing is found then displays no agents found*/}
                {!loading && !error && !agent && <p className="text-gray-500">No agents found.</p>}
                
                {/* This will display the items in top bottom format so they can see corresponding data about the agent;
                    I was able to manually add a way to read boolean values as active or inactive. will not be doing this
                    for the current state of the app, but in future iterations will pull the needed data to allow the agents to select
                    either active or inactive*/}
                {agent && (
                    <div className="bg-gray-300 p-4 shadow rounded text-black">
                        <p><strong>Agent Id:</strong> {agent.id}</p>
                        <p><strong>Full Name:</strong> {agent.full_name}</p>
                        <p><strong>Email:</strong> {agent.email}</p>
                        <p><strong>Agent Type:</strong> {agent.agent_type}</p>
                        <p><strong>Group Id:</strong> {agent.group_id}</p>
                        <p><strong>Status:</strong> {agent.active ? "Active" : "Inactive"}</p>
                        <p><strong>Created By:</strong> {agent.created_by}</p>
                        <p><strong>Created At:</strong> {agent.created_at}</p>
                        <p><strong>Updated By:</strong> {agent.updated_by}</p>
                        <p><strong>Updated At:</strong> {agent.updated_at}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Agent</h2>
                            {/* created an object that displays the available schema for agent edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(agentChanges).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(agentChanges as any)[key] ?? ""}
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
