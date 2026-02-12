// client side
"use client";

// importing react hooks
import { useEffect, useState } from "react";
// importing react router
import { useRouter } from "next/navigation";
// importing the user components
import UserSidebar from '@/app/components/user_sidebar';
import UserNotifBar from '@/app/components/user_notifbar';

// defining tsx type for approvals that will be displayed
type Approvals = {
    id : number;
    ticket_id: number;
    created_on: string;
    status: string;
    approval_type: string;
};


// creating my approvals function
export default function Approvals() {

    // creating constant variables to house all my data and use states
    const [approvals, setApprovals] = useState<Approvals[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // useEffect is similar to a side function; grabs my data from the API call
    useEffect(() => {
        const fetchApprovals = async () => {
            try {
                const response = await fetch("http://localhost:8000/approvals/user/", {
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
                console.log("Fetched approvals:", data);

                // if the data is not in an array format, then throw an error code
                if (Array.isArray(data)) {
                    setApprovals(data);
                } else {
                    throw new Error("Unexpected response format (not an array)");
                }
                // catch any errors and log them
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
                // setting the array into an empty array ensures that no incorrect data is displayed
                setApprovals([]);
            } finally {
                setLoading(false);
            }
        };
        // calling the function
        fetchApprovals();
        //ensuring that the api calls only once   
    }, []);



    const handleViewApproval = (id: number) => {
        // Argument of type 'number' is not assignable to parameter of type 'string'
        // localStorage can only be set as a string
        // localStorage.setItem("user_id", id);
        // selecting on the button will take the agent to the next page to view approval details
        localStorage.setItem("approval_id", id.toString());
        router.push('/user/approvals/approval_edits');
    };


    return (
        <div className="flex h-screen">
            <UserSidebar />
            <UserNotifBar />

            <main className="flex-1 p-6 overflow-auto">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold">All Approvals</h1>
                </div>

                {loading && <p className="text-gray-500">Loading...</p>}

                {/* shows error if we failed to fetch data */}
                {error && (
                    <p className="text-red-600 font-medium">
                        Failed to load approvals: {error}
                    </p>
                )}

                {/* displays the "no approvals found" message if there array was empty*/}
                {!loading && !error && approvals.length === 0 && (
                    <p className="text-gray-500">No approvals found.</p>
                )}

                {/* Creating a table out of the available data within the array */}
                <table className="mt-2 min-w-full bg-white rounded shadow-sm text-black">
                <thead>
                    <tr>
                    <th className="p-4 text-left border-b">Approval ID</th>
                    <th className="p-4 text-left border-b">Ticket ID</th>
                    <th className="p-4 text-left border-b">Created On</th>
                    <th className="p-4 text-left border-b">Status</th>
                    <th className="p-4 text-left border-b">Approval Type</th>
                    </tr>
                </thead>
                <tbody>

                    {/* looping through each approval and displaying each as a row
                        made each row clickable so that it provides a more modern/cleaner look*/}
                    {approvals.map((approval) => (
                    <tr 
                        key={approval.id} 
                        className="hover:bg-gray-400 cursor-pointer" 
                        onClick={() => handleViewApproval(approval.id)}
                    >
                    
                        <td className="p-4 border-b font-semibold">{approval.id}</td>
                        <td className="p-4 border-b font-semibold">{approval.ticket_id}</td>
                        <td className="p-4 border-b font-semibold">{approval.created_on}</td>
                        <td className="p-4 border-b font-semibold">{approval.status}</td>
                        <td className="p-4 border-b font-semibold">{approval.approval_type}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </main>
        </div>
    );

}
