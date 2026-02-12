// client side
"use client";

// importing react hooks
// importing react router
// importing the User components

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserSidebar from '@/app/components/user_sidebar';
import UserNotifBar from '@/app/components/user_notifbar';

// defining tsx type for feedback information that will be displayed
type AllFeedback = {
    id: number;
    rating: number;
    created_by: number;
};

// creating my feedback functions
export default function AllFeedback() {
    const [allFeedback, setAllFeedback] = useState<AllFeedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const router = useRouter();

    // useEffect is similar to a side function; grabs my data from the API call
    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch("http://localhost:8000/feedback/user/all_feedback/", {
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

                if (Array.isArray(data)) {
                    setAllFeedback(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting the array into an empty array ensures that no incorrect data is displayed
                setAllFeedback([]);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchFeedback();
        //ensuring that the api calls only once
    }, []);


    const handleViewProfile = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        // selecting on the button will take the user to the next page to view feedback details
        localStorage.setItem("feedback_id", id.toString());
        router.push('/user/feedback/feedback_edits');
    };


    return (
        // I was able to place both side bar and notification bar within the same div. not sure what had happened to the other pages
        <div className="flex h-screen">
            <UserSidebar />
            <UserNotifBar />
            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Feedback</h1>
                </div>


                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load all feedback: {error}
                    </p>
                )}

                {/* displays the "no feedback found" message if there array was empty*/}
                {!loading && !error && allFeedback.length === 0 && (
                    <p className="text-gray-500">No feedback found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">ID</th>
                    <th className="p-4 text-left border-b">Rating</th>
                    <th className="p-4 text-left border-b">Created By ID</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each feedback and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {allFeedback.map((feedback) => (
                    <tr 
                        key={feedback.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewProfile(feedback.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{feedback.id}</td>
                        <td className="p-4 border-b font-semibold">{feedback.rating}</td>
                        <td className="p-4 border-b font-semibold">{feedback.created_by}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </main>
        </div>
    );

}
