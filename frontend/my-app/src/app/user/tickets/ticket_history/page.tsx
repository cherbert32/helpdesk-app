// client side
"use client";

// importing react hooks
// importing react router
// importing the user components
import { useState, useEffect } from "react";
import UserSidebar from "@/app/components/user_sidebar";
import UserNotifBar from "@/app/components/user_notifbar";

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

// creating user schema for making feedback
const schemaMakeFeedback = {
  rating: 0,
  comments: ""
};

// creating user schema for making comments
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
  const [makeFeedback, setMakeFeedback] = useState(schemaMakeFeedback);
  const [createComment, setCreateComment] = useState(schemaCreateComment);
  const [comments, setComments] = useState<CommentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketID, setTicketID] = useState<string | null>(null);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  // useEffect is similar to a side function
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
        const response = await fetch(`http://localhost:8000/tickets/user/${storedTicketID}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
          },
        });

        // ensures that response is okay
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        setTicket(data);
        // catching any errors
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
        // if any errors are present then it nulls the value as to avoid any potential issues
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };

    // calling function
    fetchTicket();
    // ensures that api is only called once
  }, []);

  // using another user effect to ensure that conversation history is fetched appropriately and once the ticket id is available
  useEffect(() => {
    if (!ticketID) return;

    // fectching conversation function
    const fetchConversation = async () => {
      try {
        const response = await fetch(`http://localhost:8000/ticket_history/user/${ticketID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
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

  // defining function to open feedback popup
  const openFeedbackPopup = (event: any) => {
    event.preventDefault();
    setShowFeedbackPopup(true);
  };

  // defining make feedback function
  const submitFeedback = async (event: any) => {
    event.preventDefault();
    try {
      if (!ticketID) {
        alert("No ticket ID found. Cannot create feedback.");
        return;
      }
      const response = await fetch(`http://localhost:8000/feedback/user/create/${ticketID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
        },
        body: JSON.stringify({
          rating: makeFeedback.rating,
          comments: makeFeedback.comments,
        }),
      });

      // ensures that response is okay
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission Failed: ${errorText}`);
      }

      alert("Feedback submitted successfully!");
      setShowFeedbackPopup(false);
      setMakeFeedback(schemaMakeFeedback);
      // catch any errors and log them
    } catch (err: any) {
      console.error("Submission error:", err);
      alert("An error occurred while submitting feedback.");
    }
  };

  // defining comment creation function
  const handleCommentCreation = async () => {
    try {
      if (!ticketID) {
        alert("No ticket ID found. Cannot create comment.");
        return;

        
      }
      const userId = localStorage.getItem("user_id");
        if (!userId) {
          alert("No user ID found. Cannot create comment.");
          return;
        }

      const response = await fetch(`http://localhost:8000/ticket_history/user_comment/${ticketID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
        },
        body: JSON.stringify({
          ticket_id: parseInt(ticketID),
          message: createComment.message,
          user_id: parseInt(userId),
          is_private: false,
        }),
      });

      // ensures response is okay
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unable to create comment: ${errorText}`);
      }

      // Refresh comments after posting a new one
      // this creates a constant refresh for any comments that are made
      setCreateComment({ ticket_id: 0, message: "", is_private: false });

      if (ticketID) {
        const response = await fetch(`http://localhost:8000/ticket_history/user/${ticketID}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
          },
        });
        const data = await response.json();
        setComments(data);
      }
      // catching any errors that arise
    } catch (err: any) {
      console.error("Comment creation error:", err);
      alert("An error occurred while creating comment");
    }
  };

  return (
    <div className="flex h-screen">
      <UserSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex justify-end p-4">
          <UserNotifBar />
        </div>

        <div className="flex justify-between items-start p-10">
          {/* if the title isn't found, then it sets it to ticket title. without it then it gives me a highlighted ticket that might be null */}
          <h1 className="text-2xl font-bold">{ticket?.title || "Ticket Title"}</h1>
          <div className="space-x-2">
            <button
              onClick={openFeedbackPopup}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
            >
              Make Feedback
            </button>
          </div>
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}

        {/* shows error if we failed to fetch data */}
        {error && <p className="text-red-600 font-medium">Failed to load comments and ticket information: {error}</p>}

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
                    {comment.user_id ? `Agent ${comment.agent_id}` : `User ${comment.user_id}`}:
                  </div>
                  <div>{comment.message}</div>
                  {/* This section ensures to add the datetime at the bottom of the ticket history */}
                  <div className="text-xs text-gray-600">{new Date(comment.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>

          {/* This section below defines the right side of the page that displays the ticket details */}
          <div className="w-1/3 bg-white rounded shadow p-4 space-y-2 overflow-y-auto max-h-full text-black">
            {ticket ? (
              Object.entries(ticket).map(([key, value]) => (
                <div key={key}>
                  <div className="font-semibold capitalize">{key.replace(/_/g, " ")}:</div>
                  <div className="text-gray-700">{String(value)}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No ticket details available.</p>
            )}
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

        {showFeedbackPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <form
              onSubmit={submitFeedback}
              className="bg-white p-6 rounded shadow-md w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-black">Submit Feedback</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">Rating</label>
                {/* creating an input function that contains a numerical selection for ratings */}
                <input
                  type="number"
                  name="rating"
                  value={makeFeedback.rating}
                  onChange={(e) => setMakeFeedback({ ...makeFeedback, rating: Number(e.target.value) })}
                  className="w-full border p-2 rounded text-black"
                  min="0"
                  max="5"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">Comments</label>
                {/* added a comments functional to make it look more formalized */}
                <textarea
                  name="comments"
                  value={makeFeedback.comments}
                  onChange={(e) => setMakeFeedback({ ...makeFeedback, comments: e.target.value })}
                  className="w-full border p-2 rounded text-black"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowFeedbackPopup(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-900 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
