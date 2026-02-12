// client side
"use client";

// importing react hooks
// importing the User components

import { useRouter } from "next/navigation";
import UserSidebar from '@/app/components/user_sidebar';
import UserNotifBar from '@/app/components/user_notifbar';

// creating a function that houses all buttons that redirect user to corresponding pages not in side bar
export default function SettingsPage() {
    // creating a constant varaible that uses the userRouter state from react hook
    const router = useRouter();
    // users have the ability to download a report of all tickets
    const downloadReport = async () => {
        try {
            const response = await fetch(`http://localhost:8000/analytics/report`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("user_token") || ""}`,
                },
            });

            // ensuring the response is okay
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Unable to download report: ${errorText}`);
            }

            // blob waits for the response and turns it into a binary file
            const blob = await response.blob();
            // creates the url object
            const url = window.URL.createObjectURL(blob);
            // creates an anchor in javascript
            const link = document.createElement("a");
            // sets the anchor link to the url object
            link.href = url;
            // tells the browser to download the file and name it "ticket_report"
            link.setAttribute("download", "ticket_report.xlsx");
            // appends the link to the page
            document.body.appendChild(link);
            // creates a click event 
            link.click();
            // once the link is clicked, it removes it
            link.remove();
            // removes the url object off the memory
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Report download error:", err);
            alert("An error occurred while attempting to create report");
        }
    };



    return (
        <div className="flex h-screen">
            <UserSidebar />
            {/* Experiences some issues with displaying the notfication pop up and had to create it in another div */}
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="flex justify-end p-4">
                    <UserNotifBar />
                </div>

                {/* creating a grid level with 3 columns*/}
                {/* one button will take user to the feedback page while the other will download a report*/}
                <div className="p-8 grid grid-cols-3 gap-6">
                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/user/feedback")}
                    >
                        <p className="text-lg font-semibold text-black">Feedback</p>
                    </div>

                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={downloadReport}
                    >
                        <p className="text-lg font-semibold text-black">Download Report</p>
                    </div>
                </div>
            </div>
        </div>
    );
}