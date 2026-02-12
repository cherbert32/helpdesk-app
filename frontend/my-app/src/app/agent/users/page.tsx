// client side
"use client";

// importing react hooks
// importing react router
// importing the Agent components
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';


// defining tsx type for my user information that will be displayed
type UsersInformation = {
    id: number;
    full_name: string;
    email: string;
};


// defining my form schema for new use creation
const schemaNewUser = {
    full_name: "",
    email: "",
    password: "",
    division: "",
    program: "",
    employee_type: "",
    supervisor_id: 0
};

// creating my users functions
export default function Users() {

    // creating constant variables to house all my data and use states // creating constant variables to house all my data and use states
    const [users, setUsers] = useState<UsersInformation[]>([]);
    const [newUser, setNewUser] = useState(schemaNewUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8000/users/", {
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
                console.log("Fetched users:", data);

                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catching any errors and then logging  them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        // calling function
        fetchUsers();
        // ensuring api only calls once
    }, []);

    // defining new user function
    const handleNewUser = async (event: any) => {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/users/user_creation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(newUser),
            });

            // ensuring reponse is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`User Creation Failed: ${errorText}`);
            }

            alert("User has been created");
            setShowPopUp(false);
            // catching any errors
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating user");
        }
    };

    const handleViewProfile = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        localStorage.setItem("user_id", id.toString());
        router.push('/agent/users/user_edits');
    };


    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />
            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Users</h1>
                </div>

                <button
                    className="mt-2 w-40 p-2 bg-white text-black shadow-lg border rounded hover:bg-gray-400 cursor-pointer"
                    onClick={() => setShowPopUp(true)}
                >
                    Create User
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load users: {error}
                    </p>
                )}

                {/* displays the "no users found" message if there array was empty*/}
                {!loading && !error && users.length === 0 && (
                    <p className="text-gray-500">No users found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Full Name</th>
                    <th className="p-4 text-left border-b">User ID</th>
                    <th className="p-4 text-left border-b">Email</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each agent and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {users.map((user) => (
                    <tr 
                        key={user.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewProfile(user.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{user.full_name}</td>
                        <td className="p-4 border-b font-semibold">{user.id}</td>
                        <td className="p-4 border-b font-semibold">{user.email}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewUser}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit User</h2>
                            {/* As to avoid having to hardcode input values, learned how to create an object to dynamically create these inputs
                                key={key} essentially helps keep track of each field on its own
                                {key.replace(/_/g, " ")}: because I made these varaibles with and underscore, this removes it; giving it a clearer look.*/}
                            {Object.keys(newUser).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // had experienced some issues with an item being undefined, so I put an empty "" and that helped solve my issues
                                        value={(newUser as any)[key] ?? ""}
                                        onChange={(event) =>
                                            setNewUser((previousData) => ({
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
