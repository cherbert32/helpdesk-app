// client side
"use client";

// importing react hooks
// importing react router
// importing the Agent components
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';;


// defining tsx type for my group information that will be displayed
type Groups = {
    id : number;
    group_name: string;
};

// defining my form schema for new group creation
const schemaNewGroups = {
    group_name: ""
};

// creating my groups functions
export default function Groups() {
    
    // creating constant variables to house all my data and use states
    const [groups, setGroups] = useState<Groups[]>([]);
    const [newGroup, setNewGroup] = useState(schemaNewGroups);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        // defining fetch group function
        const fetchGroups = async () => {
            try {
                const response = await fetch("http://localhost:8000/groups/", {
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
                console.log("Fetched groups:", data);

                if (Array.isArray(data)) {
                    setGroups(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catching errors and then logging them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };

        // calling function
        fetchGroups();
        // ensuring api calls only once
    }, []);

    // defining new group function
    const handleNewGroup = async (event: any) => {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/groups/group_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(newGroup),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Group Creation Failed: ${errorText}`);
            }

            alert("Group has been created");
            setShowPopUp(false);
            // catching errors and then logging them
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating Group");
        }
    };

    const handleViewGroup = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        localStorage.setItem("group_id", id.toString());
        router.push('/agent/groups/group_edits');
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Groups</h1>
                </div>

                <button
                    className="mt-2 w-40 p-2 bg-white text-black shadow-lg border rounded hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowPopUp(true)}
                >
                    Create Group
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load groups: {error}
                    </p>
                )} 

                 {/* displays the "no groups found" message if there array was empty*/}
                {!loading && !error && groups.length === 0 && (
                    <p className="text-gray-500">No groups found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Group ID</th>
                    <th className="p-4 text-left border-b">Group Name</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each agent and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {groups.map((group) => (
                    <tr 
                        key={group.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewGroup(group.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{group.id}</td>
                        <td className="p-4 border-b font-semibold">{group.group_name}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                
                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewGroup}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Group</h2>
                            {/* created an object that displays the available schema for agent edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(newGroup).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(newGroup as any)[key] ?? ""}
                                        onChange={(event) =>
                                            setNewGroup((previousData) => ({
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
