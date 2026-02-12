// client side
"use client";


// importing react hooks
// importing react router
// importing the Agent components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for my user information that will be displayed
type User = {
    id: number;
    full_name: string;
    email: string;
    password: string;
    division: string;
    program: string;
    active: boolean;
    employee_type: string;
    supervisor_id: number;
    created_at: Date;
    created_by: number;
    updated_by: number;
    updated_at: Date;
};


// defining my form schema for user updates
const schemaUserChanges = {
    full_name: "",
    email: "",
    password: "",
    division: "",
    program: "",
    active: true,
    employee_type: "",
    supervisor_id: 0
};


// creating my user details functions
export default function UserDetails() {

    // creating constant variables to house all my data and use states
    const [user, setUser] = useState<User | null>(null);
    const [userChanges, setUserChanges] = useState(schemaUserChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [userID, setUserID] = useState<string | null>(null);

    useEffect(() => {
        // fetching my localstorage for the user_id from the initial users page
        const fetchUser = async () => {
            // for whatever reason, some pages responseulted in the stored ids being null. my assumption is that it would run the function faster than what it does to load
            // or identify the id. created a variable to ensure the first fetch always has an id and the responsets can pull the stored id without any issues
            const storedUserID = localStorage.getItem("user_id");
            
            if (!storedUserID) {
                setError("No user id found in local storage");
                setLoading(false);
                return;
            }
            setUserID(storedUserID);
            try {
                const res = await fetch(`http://localhost:8000/users/${storedUserID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });
                // ensures response is okay
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Server Error (${res.status}): ${errorText}`);
                }

                const data = await res.json();
                setUser(data);
                setUserChanges({
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    division: data.division,
                    program: data.program,
                    active: data.active,
                    employee_type: data.employee_type,
                    supervisor_id: data.supervisor_id
                });
                // catches any errors
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        // calls function
        fetchUser();
        // ensures this is only called once
    }, []);

    // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        // updating the agent details with the new value without affecting the other values if I don't update them
        // without this, it would overwrite all items if left blank :(
        setUserChanges( userChanges =>({ ...userChanges, [name]: value }));

    };

    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would update an employee's information once it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const res = await fetch(`http://localhost:8000/users/user_update/${userID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(userChanges),
            });
            // ensures reponse is okay
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Update Failed: ${errorText}`);
            }
            alert("User updated successfully");
            setShowPopUp(false);
            // catches any errors
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating user");
        }
    };

    // defining deactivation function
    const handleDeactivate = async () => {
        try {
            const res = await fetch(`http://localhost:8000/users/user_deactivation/${userID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },

            });
            // ensures response is okay
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Deactivation Failed: ${errorText}`);
            }

            alert("User has been deactivated");
            // catches any errors and logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while deactivating user");
        }
    };

    // defining deletion function
    const handleDeletion = async () => {
        try {
            const res = await fetch(`http://localhost:8000/users/user_deletion/${userID}`, {
                method: "DELETE",
                headers: {
                    // kept getting an error here because backend code wasn't expecting json
                    //"Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
            });
            // ensures response is okay
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Deletion Failed: ${errorText}`);
            }

            alert("User has been deleted");
            // catches any errors and then logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to delete the user");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Current User {userID}</h1>

                <div className="flex space-x-6 mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit User
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-amber-600 text-white hover:bg-amber-900 cursor-pointer"
                        onClick={handleDeactivate}
                    >
                        Deactivate User
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete User
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load user: {error}</p>}

                {/* if nothing is found then displays no users found*/}
                {!loading && !error && !user && <p className="text-gray-500">No users found.</p>}

                {/* This will display the items in top bottom format so they can see corresponding data about the usert;
                    I was able to manually add a way to read boolean values as active or inactive. will not be doing this
                    for the current state of the app, but in future iterations will pull the needed data to allow the agents to select
                    either active or inactive*/}
                {user && (
                    <div className="bg-gray-600 p-4 shadow rounded text-black">
                        <p><strong>User Id:</strong> {user.id}</p>
                        <p><strong>Full Name:</strong> {user.full_name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Division:</strong> {user.division}</p>
                        <p><strong>Program:</strong> {user.program}</p>
                        <p><strong>Status:</strong> {user.active ? "Active" : "Inactive"}</p>
                        <p><strong>Employee Type:</strong> {user.employee_type}</p>
                        <p><strong>Supervisor ID:</strong> {user.supervisor_id}</p>
                        <p><strong>Created At:</strong> {user.created_at.toString()}</p>
                        <p><strong>Updated At:</strong> {user.updated_at.toString()}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit User</h2>
                            {/* created an object that displays the available schema for agent edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(userChanges).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(userChanges as any)[key] ?? ""}
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
