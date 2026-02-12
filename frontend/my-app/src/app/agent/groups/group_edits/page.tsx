// client side
"use client";

// importing react hooks
// importing the Agent components

import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for my group information that will be displayed
type Group = {
    id : number;
    group_name: string;
};

// defining my group changes schema
const schemaGroupChanges = {
    group_name: ""
};

// creating my group details function
export default function GroupDetails() {

    // creating constant variables to house all my data and use states
    const [group, setGroup] = useState<Group | null>(null);
    const [groupChanges, setGroupChanges] = useState(schemaGroupChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [groupID, setGroupId] = useState<string | null>(null);
    
    useEffect(() => {
        // fetching my localstorage for the group_id from the initial agent page
        const fetchGroup = async () => {
            const storedGroupID = localStorage.getItem("group_id");
            setGroupId(storedGroupID);
            // if no id is found then return error
            if (!storedGroupID) {
                setError("No group id found in local storage");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/groups/${storedGroupID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // ensuring that response is okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                // assigning data to setGroup
                const data = await response.json();
                setGroup(data);
                setGroupChanges({
                    group_name: data.group_name
                });
                // catching errors and then logging them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setGroup(null);
            } finally {
                setLoading(false);
            }
        };

        // calling function
        fetchGroup();
        // ensuring api only runs once
    }, []);

    // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        // this prevents any entry from nulling all other entries if they are not interacted with
        setGroupChanges(groupChanges => ({ ...groupChanges, [name]: value }));

    };

    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/groups/group_update/${groupID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(groupChanges),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }
            alert("Group updated successfully");
            setShowPopUp(false);
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating group");
        }
    };


    const handleDeletion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/groups/group_deletion/${groupID}`, {
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

            alert("Group has been deleted");
            // catching any errrors and logging them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to delete the group");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Current Group {groupID}</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit Group
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete Group
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load group: {error}</p>}

                {/* if nothing is found then displays no groups found*/}
                {!loading && !error && !group && <p className="text-gray-500">No groups found.</p>}

                {/* displays items top to bottom */}
                {group && (
                    <div className="bg-gray-300 p-4 shadow rounded text-black">
                        <p><strong>Group Id:</strong> {group.id}</p>
                        <p><strong>Group Name:</strong> {group.group_name}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Group</h2>
                             {/* created an object that displays the available schema for group edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(groupChanges).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(groupChanges as any)[key] ?? ""}
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
