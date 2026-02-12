// client side
"use client";

// importing react hooks
// importing react router
// importing the Agent components
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';


// defining tsx type for my agent information that will be displayed
type AgentsInformation = {
    id: number;
    full_name: string;
    email: string;
};


// defining my form schema for new agent creation
const schemaNewAgent = {
    full_name: "",
    email: "",
    password: "",
    agent_type: "",
    group_id: 0,
    active: true
};

// creating my agents functions
export default function Agents() {

    // creating constant variables to house all my data and use states // creating constant variables to house all my data and use states
    const [agents, setAgents] = useState<AgentsInformation[]>([]);
    const [newAgent, setNewAgent] = useState(schemaNewAgent);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function; grabs my data from the API call
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                // getting all agents that exist
                const response = await fetch("http://localhost:8000/agents/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // Ensure response is okay; 200-299
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }
                // creating a constant data variable that houses the json from the api call
                const data = await response.json();
                console.log("Fetched agents:", data);
                
                // if the data is not in an array format, then throw an error code
                if (Array.isArray(data)) {
                    setAgents(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting the array into aan empty array ensures that no incorrect data is displayed
                setAgents([]);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchAgents();
        // ensuring that the api calls only once
    }, []);

    // creating a function that performs the agent creation api
    const handleNewAgent = async (event: any) => {
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/agents/agent_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                // creating the creation submission into json format for the body returned
                body: JSON.stringify(newAgent),
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Agent Creation Failed: ${errorText}`);
            }

            // closes the pop up if the agent has been created and alerts the agent
            alert("Agent has been created");
            setShowPopUp(false);
            // catching any errors and then logging them
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating agent");
        }
    };

    const handleViewProfile = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        // selecting on the button will take the user to the next page to view agent details
        localStorage.setItem("agent_id", id.toString());
        router.push('/agent/agents/agent_edits');
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Agents</h1>
                </div>

                <button
                    className="mt-2 w-40 p-2 bg-white text-black shadow-lg border rounded hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowPopUp(true)}
                >
                    Create Agent
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-900 font-medium">
                        Failed to load agents: {error}
                    </p>
                )}

                {/* displays the "no agents found" message if there array was empty*/}
                {!loading && !error && agents.length === 0 && (
                    <p className="text-gray-500">No agents found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Full Name</th>
                    <th className="p-4 text-left border-b">Agent ID</th>
                    <th className="p-4 text-left border-b">Email</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each agent and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {agents.map((agent) => (
                    <tr 
                        key={agent.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewProfile(agent.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{agent.full_name}</td>
                        <td className="p-4 border-b font-semibold">{agent.id}</td>
                        <td className="p-4 border-b font-semibold">{agent.email}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewAgent}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Agent</h2>
                            {/* As to avoid having to hardcode input values, learned how to create an object to dynamically create these inputs
                                key={key} essentially helps keep track of each field on its own
                                {key.replace(/_/g, " ")}: because I made these varaibles with and underscore, this removes it; giving it a clearer look.*/}
                            {Object.keys(newAgent).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // had experienced some issues with an item being undefined, so I put an empty "" and that helped solve my issues
                                        value={(newAgent as any)[key] ?? ""}
                                        onChange={(event) =>
                                            setNewAgent((previousData) => ({
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
                                    // when pressed, it closes the pop up
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
