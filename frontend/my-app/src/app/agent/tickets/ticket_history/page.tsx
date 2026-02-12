// client side
"use client";

// importing react hooks
// importing react router
// importing the user components
import { useState, useEffect } from "react";
import AgentSidebar from "@/app/components/agent_sidebar";
import AgentNotifBar from "@/app/components/agent_notifbar";

// defining tsx type for tickets that will be displayed
type Ticket = {
    user_id: number;
    agent_id: number;
    ticket_type_id: number;
    sla_id: number;
    group_id: number;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    ticket_status: string;
    priority: string;
    due_date: string;
};

// defining form for ticket update schema
const schemaTicketUpdate = {
    user_id: 0,
    agent_id: 0,
    ticket_type_id: 0,
    sla_id: 0,
    group_id: 0,
    title: "",
    description: "",
    category: "",
    subcategory: "",
    ticket_status: "",
    priority: "",
    due_date: ""
};

// creating agent schema for making comments
const schemaCreateComment = {
    ticket_id: 0,
    message: "",
    is_private: false,
};

// defining tsx type for comment history that will be displayed
type CommentHistory = {
    id: number;
    ticket_id: number;
    message: string;
    is_private: boolean;
    created_at: string;
    user_id: number;
    agent_id: number;
};

// defining ticket interaction function
export default function TicketInteractions() {

    // creating constant variables to house data and states
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [updateTicket, setUpdateTicket] = useState(schemaTicketUpdate);
    const [createComment, setCreateComment] = useState(schemaCreateComment);
    const [comments, setComments] = useState<CommentHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ticketID, setTicketID] = useState<string | null>(null);

    useEffect(() => {
        const fetchTicket = async () => {
            // creating a stored id variable for the ticket id
            const storedTicketID = localStorage.getItem("ticket_id");
            if (!storedTicketID) {
                setError("No ticket id found in local storage");
                setLoading(false);
                return;
            }
            setTicketID(storedTicketID);

            try {
                const response = await fetch(`http://localhost:8000/tickets/agent/${storedTicketID}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // ensure response is okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server Error (${response.status}): ${errorText}`);
                }

                const data = await response.json();
                setTicket(data);
                setUpdateTicket(data);
                // catches any errors and then logs them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                setTicket(null);
            } finally {
                setLoading(false);
            }
        };
        // calls function
        fetchTicket();
        // ensure api is only called once
    }, []);

    useEffect(() => {
        if (!ticketID) return;

        // defines fetch conversation function
        const fetchConversation = async () => {
            try {
                const response = await fetch(`http://localhost:8000/ticket_history/agent/${ticketID}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });

                // ensures response was okay
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gathering ticket comment history failed: ${errorText}`);
                }

                const data = await response.json();
                setComments(data);
                // catching any errors and logging them
            } catch (err: any) {
                console.error("Retrieval error:", err);
                alert("An error occurred while retrieving comment history");
            }
        };
        // calls the function
        fetchConversation();
        // runs only if the ticket id is found
    }, [ticketID]);

    // defines ticket changes function
    const handleTicketChanges = (event: any) => {
        const { name, value } = event.target;
        setUpdateTicket((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (event: any) => {
        // preventing page reloading
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/tickets/agent/update/${ticketID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify(updateTicket),
            });

            // ensures response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }

            alert("Ticket was updated successfully");
            // catches any errors and logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating ticket");
        }
    };

    const handleCommentCreation = async () => {
        try {
            if (!ticketID) {
                alert("No ticket ID found. Cannot create comment.");
                return;
            }
            const response = await fetch(`http://localhost:8000/ticket_history/agent_comment/${ticketID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
                body: JSON.stringify({
                    ticket_id: parseInt(ticketID),
                    message: createComment.message,
                    is_private: createComment.is_private,
                }),
            });

            // ensuring response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Unable to create comment: ${errorText}`);
            }

            // Refresh comments after posting
            setCreateComment({ ticket_id: 0, message: "", is_private: false });

            if (ticketID) {
                const response = await fetch(`http://localhost:8000/ticket_history/agent/${ticketID}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });
                const data = await response.json();
                setComments(data);
            }
            // catching any errors and logging them
        } catch (err: any) {
            console.error("Comment creation error:", err);
            alert("An error occurred while creating comment");
        }
    };

    // defining draft approval start function
    const startDraftApproval = async () => {
        try {
            const response = await fetch(`http://localhost:8000/approvals/start_draft_approval_process/${ticketID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
            });

            // ensures response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Unable to start draft approval process: ${errorText}`);
            }

            alert("Draft approval started!");
            // catching any errors that arise
        } catch (err: any) {
            console.error("Draft approval error:", err);
            alert("An error occurred while starting draft approval process");
        }
    };

    return (
        <div className="flex h-screen">
            <AgentSidebar />

            <div className="flex-1 flex flex-col overflow-auto">
                <div className="flex justify-end p-4">
                    <AgentNotifBar />
                </div>

                <div className="flex justify-between items-start p-10">
                    {/* if the title isn't found, then it sets it to ticket title. without it then it gives me a highlighted ticket that might be null */}
                    <h1 className="text-2xl font-bold">{ticket?.title || "Ticket Title"}</h1>
                    <div className="space-x-2">
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
                        >
                            Update Ticket
                        </button>
                        <button
                            onClick={startDraftApproval}
                            className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded cursor-pointer"
                        >
                            Start Draft Approval
                        </button>
                    </div>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load comments and ticket information: {error}
                    </p>
                )}

                {/* if nothing is found then displays no comments found */}
                {!loading && !error && !comments && <p className="text-gray-500">No comments found.</p>}

                <div className="flex flex-1 gap-4 px-4 pb-4 overflow-hidden">
                    {/* This section below defines the left side of the page so it displays the comment history */}
                    <div className="w-2/3 space-y-3 overflow-y-auto">
                        {comments.length === 0 ? (
                            <p className="text-gray-500">No comments found.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-100 rounded p-2 text-sm text-black">
                                    <div className="font-semibold">
                                        {/* displays either the agent id or user id */}
                                        {comment.agent_id ? `Agent ${comment.agent_id}` : `User ${comment.user_id}`}:
                                    </div>
                                    <div>{comment.message}</div>
                                    {/* This section ensures to add the datetime at the bottom of the ticket history */}
                                    <div className="text-xs text-gray-600">{new Date(comment.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* This section below defines the right side of the page that displays the ticket details */}
                    <div className="w-1/3 bg-white rounded shadow p-4 overflow-y-auto max-h-full">
                        <form className="space-y-3">
                            {Object.entries(updateTicket).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm text-black capitalize mb-1">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        value={value ?? ""}
                                        onChange={handleTicketChanges}
                                        className="w-full border text-gray-800 p-2 rounded"
                                    />
                                </div>
                            ))}
                        </form>
                    </div>
                </div>

                {/* this section below defines the comment creation section of the screen */}
                <div className="flex items-center gap-2 p-4 border-t">
                    <input
                        type="text"
                        placeholder="Add comment"
                        className="flex-1 border p-3 rounded"
                        value={createComment.message}
                        onChange={(e) => setCreateComment({ ...createComment, message: e.target.value })}
                    />
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
                        onClick={handleCommentCreation}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
