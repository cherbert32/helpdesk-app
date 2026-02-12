// client side
"use client";


// importing react hooks
// importing the User components
import { useState, useEffect } from "react";
import UserSidebar from "@/app/components/user_sidebar";
import UserNotifBar from '@/app/components/user_notifbar';


// defining tsx type for approvals that will be displayed
type Approval = {
    id : number;
    ticket_id: number;
    created_on: string;
    status: string;
    approval_type: string;
};

// defining my form schema for approval decision
const schemaDecision = {
    status:"",
    comments:""
};

// creating my approvals details function
export default function ApprovalDetails() {
    const [approval, setApproval] = useState<Approval | null>(null);
    const [decision, setDecision] = useState(schemaDecision);    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPopUp, setShowPopUp] = useState(false);
    const [approvalID, setApprovalID] = useState<string | null>(null);
    
    useEffect(() => {
        // fetching my localstorage for the user_id from the initial users page
        const fetchApproval = async () => {
            const storedApprovalID = localStorage.getItem("approval_id");
            setApprovalID(storedApprovalID);
            // if there is no approval id then return an error
            if (!storedApprovalID) {
                setError("No approval id found in local storage");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/approvals/user/${storedApprovalID}`, {
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
                setApproval(data);
                // assigning decision to the schema 
                setDecision({
                    status: data.status,
                    comments: data.comments
                })
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // set approval to null so that no incorrect data is displayed
                setApproval(null);
            } finally {
                setLoading(false);
            }
        };

        // calling the function
        fetchApproval();
        //ensuring that the api calls only once
    }, []);

    // code for user updates
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;

        // this prevents any entry from nulling all other entries if they are not interacted with
        setDecision(decision => ({ ...decision, [name]: value }));

    };

    const handleDecision = async (event: any) => {
        // Error: localStorage is not defined
        // documentation shows that it is best to include the preventDefault as without
        // it reloads the page
        event.preventDefault();

        try {
            const response = await fetch(`http://localhost:8000/approvals/decision/${approvalID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },
                // making the decision into json format
                body: JSON.stringify(decision),
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Decision Failed: ${errorText}`);
            }  
            // alerts the user that their decision was performed successfully
            alert("Decision was performed successfully");
            setShowPopUp(false);
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attempting to make decision");
        }
    };

    // defining resubmission function
    const handleresubmission = async () => {
        try {
            const token = localStorage.getItem("user_token");
            if (!token) {
                alert("User token not found. Please log in again.");
                return;
            }

            const response = await fetch(`http://localhost:8000/approvals/user/resubmit/${approvalID}`, {
                method: "POST",
                headers: {

                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },
                // making the resubmission into a json format
                body: JSON.stringify({
                    status: "Pending",
                    comments: "resubmitting approval."
                })
            });

            // if the response is not within the accepted status codes then fails
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`resubmission Failed: ${errorText}`);
            }
            // alerts the user that the approval has been resubmitted and closes the pop up
            alert("Approval has been resubmitted.");
            // catches and logs any errors
        } catch (err: any) {
            console.error("Update error:", err);
            alert("An error occurred while attemping to resubmit approval");
        }
    };

    return (
        <div className="flex h-screen">
            <UserSidebar />
            <UserNotifBar />
            
            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">Approval {approvalID}</h1>

                <div className="mb-4">
                    <button
                        className="px-4 py-2 rounded flex-1 bg-white text-black hover:bg-gray-400 cursor-pointer"
                        onClick={() => setShowPopUp(true)}
                    >
                        Make Decision
                    </button>
                    <button
                        className="px-4 py-2 rounded flex-1 bg-red-600 text-white hover:bg-red-900 cursor-pointer"
                        onClick={handleresubmission}
                    >
                        Resubmit Approval
                    </button>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && <p className="text-red-600 font-medium">Failed to load approval: {error}</p>}

                {/* if nothing is found then displays no approvals found*/}
                {!loading && !error && !approval && <p className="text-gray-500">No approvals found.</p>}

                {/* This will display the items in top bottom format for the selected approvals*/}    
                {approval && (
                    <div className="bg-gray-600 p-4 shadow rounded text-black">
                        <p><strong>Group Id:</strong> {approval.id}</p>
                        <p><strong>Ticket Id:</strong> {approval.ticket_id}</p>
                        <p><strong>Created On:</strong> {approval.created_on}</p>
                        <p><strong>Status:</strong> {approval.status}</p>
                        <p><strong>Approval Type:</strong> {approval.approval_type}</p>
                    </div>
                )}

                {showPopUp && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                        <form
                            onSubmit={handleDecision}
                            className="bg-white p-6 rounded shadow-md w-full max-w-lg"
                        >
                            <h2 className="text-xl font-bold text-black mb-4">Edit Approvals</h2>
                            {/* created an object that displays the available schema for approvals edits similar to a for loop function
                                because some of my schema had underscores, I replaced them with an empty space*/}
                            {Object.keys(decision).map((key) => (
                                <div key={key} className="mb-4">
                                    <label className="block text-sm font-medium text-black mb-1 capitalize">
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <input
                                        name={key}
                                        // if the value is left empty, then it make it an empty string as to avoid undefined errors
                                        value={(decision as any)[key] ?? ""}
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
