// client side
"use client";

// importing react hooks
// importing react router
// importing the user components
import { useEffect, useState } from "react";
import UserSidebar from '@/app/components/user_sidebar';
import UserNotifBar from '@/app/components/user_notifbar';

// defining tsx type for feedback information that will be displayed
type Feedback = {
    id: number;
    ticket_id: number;
    agent_id: number;
    rating: number;
    comments: string;
    created_by: number;
};

// creating feedback changes submission form
const FeedbackChanges = {
    id: 0,
    ticket_id: 0,
    agent_id: 0,
    rating: 0,
    comments: ""
};


// creating my feedback functions
export default function FeedbackPage() {

    // creating constant variables to house all my data and use states
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [feedbackUpdate, setFeedbackUpdate] = useState(FeedbackChanges);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [feedbackID, setFeedbackID] = useState<string | null>(null);

    // useEffect is similar to a side function; grabs my data from the API call
    useEffect(() => {
        const fetchFeedback = async () => {
            const storedFeedbackID = localStorage.getItem("feedback_id");
            setFeedbackID(storedFeedbackID);
            if (!storedFeedbackID) {
                setError("No feedback id was found in local sotrage");
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:8000/feedback/user/${storedFeedbackID}`, {
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
                console.log("Fetched Feedback:", data);
                setFeedback(data);
                setFeedbackUpdate(data);

                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting feedback to null if nothing is returned
                setFeedback(null);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchFeedback();
        // ensuring the api is only called once
    }, []);


    // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

        // updating the feedback cahanges with the new value without affecting the original
        // without this, it would overwrite all items if left blank :(
        setFeedbackUpdate(feedbackChanges => ({ ...feedbackChanges, [name]: value }));

    };


    const handleSubmit = async (event: any) => {
        // Error: localStorage is not defined
        // whenever I would press submit it would fail
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page; my assumption is that once it reloads it loses the id
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/feedback/user/update/${feedbackID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },

                // making the updates into a json format
                body: JSON.stringify(feedbackUpdate),
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Update Failed: ${errorText}`);
            }

            // alerts the user that their feedback was updated successfully
            alert("Feedback has been udpated successfully");
            setShowPopUp(false);
            // catches and logs any errors
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while updating feedback");
        }
    };

    // defining my deletion function
    const handleDeletion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/feedback/user/delete/${feedbackID}`, {
                method: "DELETE",
                headers: {
                    // kept getting an error here because backend code wasn't expecting json
                    //"Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Deletion Failed: ${errorText}`);
            }

            // alerts the user that the feedback was deleted
            alert("Feedback has been deleted successfully");
            // catches any error and logs them
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to delete the feedback");
        }
    };

    return (
        <div className="flex h-screen">
            <UserSidebar />
            <UserNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                    <h1 className="text-2xl font-bold">Feedback {feedbackID}</h1>

                    <div className="mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Edit Feedback
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleDeletion}
                    >
                        Delete Feedback
                    </button>
                </div>
               

                

                {/* shows error if we failed to fetch data */}
                {loading && <p className="text-gray-500">Loading...</p>}

                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load feedbakck: {error}
                    </p>
                )}

                {/* if nothing is found then displays no feedback found*/}
                {!loading && !error && !feedback && <p className="text-gray-500">No feedback found.</p>}

                {/* This will display the items in top bottom format so they can see corresponding data about the feedback*/}
                {feedback && (
                    <div className="bg-gray-600 p-4 shadow rounded text-black">
                        <p><strong>ID:</strong> {feedback.id}</p>
                        <p><strong>Ticket ID:</strong> {feedback.ticket_id}</p>
                        <p><strong>Agent ID:</strong> {feedback.agent_id}</p>
                        <p><strong>Rating:</strong> {feedback.rating}</p>
                        <p><strong>Comment:</strong> {feedback.comments}</p>
                        <p><strong>Created By:</strong> {feedback.created_by}</p>
                    </div>
                )}
                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Feedback</h2>
                            {/* created an object that displays the available schema for feedback edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(feedbackUpdate).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(feedbackUpdate as any)[key] ?? ""}
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
