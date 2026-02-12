// client side
"use client";

// importing react hooks
import { useEffect, useState } from "react";
// importing react router
import { useRouter } from "next/navigation";
// importing the user components
import UserSidebar from '@/app/components/user_sidebar';
import UserNotifBar from '@/app/components/user_notifbar';

// defining tsx type for tickets that will be displayed
type Tickets = {
    id : number;
    title: string;
    agent_id: number;
    group_id: number;
    ticket_status: string;
    submitted_on: string;
};

// defining ticket creation form
const schemaCreateTicket = {
    ticket_type_id: 0,
    sla_id: 0,
    group_id: 0,
    title: "",
    description: "",
    priority: "",
    due_date: "",
};

// creating my tickets function
export default function Tickets() {
    const [tickets, setTickets] = useState<Tickets[]>([]);
    const [newTicket, setNewTicket] = useState(schemaCreateTicket);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch("http://localhost:8000/tickets/user/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                    },
                });

                // Ensure response is okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                // creating a constant data variable that houses the json from the api call
                const data = await response.json();
                console.log("Fetched tickets:", data);

                // if the data is not in an array format, then throw an error code
                if (Array.isArray(data)) {
                    setTickets(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }

                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting the array into an empty array ensures that no incorrect data is displayed
                setTickets([]);
            } finally {
                setLoading(false);
            }
        };

        // calling the function
        fetchGroups();
        //ensuring that the api calls only once
    }, []);

    // creating my new ticket function
    const handleNewTicket = async (event: any) => {
        event.preventDefault();

        try {
            const response = await fetch("http://localhost:8000/tickets/user/create_ticket/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },
                // making the newticket into json format
                body: JSON.stringify(newTicket),
            });

            // Ensure response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ticket Creation Failed: ${errorText}`);
            }

            // alert user that tickt has been created
            alert("Ticket has been created");
            setShowPopUp(false);
            // catch any errors and log them
        } catch (err: any) {
            console.error("Creation error:", err);
            alert("An error occurred while creating ticket");
        }
    };

    const handleViewTicket = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // had to set the id to a string in order to prevent the ticket_id retrieval from failing
        localStorage.setItem("ticket_id", id.toString());
        router.push('/user/tickets/ticket_history');
    };


    return (
        <div className="flex h-screen">
            <UserSidebar />
            <UserNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Tickets</h1>
                </div>

                <button
                    className="bg-white text-black px-4 py-2 rounded"
                    onClick={() => setShowPopUp(true)}
                >
                    Create Ticket
                </button>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load tickets: {error}
                    </p>
                )}

                {/* displays the "no tickets found" message if there array was empty*/}
                {!loading && !error && tickets.length === 0 && (
                    <p className="text-gray-500">No tickets found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Ticket ID</th>
                    <th className="p-4 text-left border-b">Title</th>
                    <th className="p-4 text-left border-b">Agent ID</th>
                    <th className="p-4 text-left border-b">Group ID</th>
                    <th className="p-4 text-left border-b">Ticket Status</th>
                    <th className="p-4 text-left border-b">Submitted On</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each ticket and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {tickets.map((ticket) => (
                    <tr 
                        key={ticket.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewTicket(ticket.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{ticket.id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.title}</td>
                        <td className="p-4 border-b font-semibold">{ticket.agent_id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.group_id}</td>
                        <td className="p-4 border-b font-semibold">{ticket.ticket_status}</td>
                        <td className="p-4 border-b font-semibold">{ticket.submitted_on}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                {/* create ticket popup*/}
                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleNewTicket}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Create Ticket</h2>
                            {/* created an object that displays the available schema for ticket creation similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(newTicket).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        // although the user should enter all required information
                                        value={(newTicket as any)[key] ?? ""}
                                        onChange={(event) =>
                                            setNewTicket((previousData) => ({
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
                                    className= "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );

}
