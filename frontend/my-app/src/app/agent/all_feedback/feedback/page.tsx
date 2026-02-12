// client side
"use client";

// importing react hooks
import { useEffect, useState } from "react";
// importing the Agent components
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';

// defining tsx type for my feedback information that will be displayed
type Feedback = {
    id: number;
    ticket_id: number;
    agent_id: number;
    rating: number;
    comments: string;
    created_by: number;
};

// creating my feedback functions
export default function Feedback() {

    // creating constant variables to house all my data and use states
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                const response = await fetch(`http://localhost:8000/feedback/agent/${storedFeedbackID}`, {
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
                
                // creating a constant data variable that houses the json from the api call
                const data = await response.json();
                console.log("Fetched Feedback:", data);
                setFeedback(data);

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

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            <AgentNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">Feedback ID: {feedbackID}</h1>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load feedback: {error}
                    </p>
                )}
                {/* if nothing is found then displays no feedback found*/}
                {!loading && !error && !feedback && <p className="text-gray-500">No feedback found.</p>}

                {/* This will display the items in top bottom format so they can see corresponding data about the feedback*/}
                {feedback && (
                    <div className="bg-gray-300 p-4 shadow rounded text-black">
                        <p><strong>ID:</strong> {feedback.id}</p>
                        <p><strong>Ticket ID:</strong> {feedback.ticket_id}</p>
                        <p><strong>Agent ID:</strong> {feedback.agent_id}</p>
                        <p><strong>Rating:</strong> {feedback.rating}</p>
                        <p><strong>Comment:</strong> {feedback.comments}</p>
                        <p><strong>Created By:</strong> {feedback.created_by}</p>
                    </div>
                )}
            </main>
        </div>
    );

}
