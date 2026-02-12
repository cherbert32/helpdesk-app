// this tells next.js to run on the client side
"use client";

// importing react hooks 
import { useEffect, useState } from "react";

// this is related to my database schema
type AgentNotification = {
    id: number;
    ticket_id: number;
    agent_id: number;
    read: boolean;
    message: string;
    sent_at: string;
}

// function that will house agent notification pop up
export default function AgentNotifBar() {

    // assigning constant variables that will house relevant data
    const [showPopUp, setShowPopUp] = useState(false);
    const [notifications, setNotifications] = useState<AgentNotification[]>([]);
    const [pendingNotifications, setPendingNotifications] = useState(false);


    // using useEffect to run once page loads to fetch notifications
    // useEffect works similar to a side function such as fetching my data from api calls
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // API get call to pull all notifications
                const response = await fetch("http://localhost:8000/agent_notifications/", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // grabing the authentication token that is stored locally
                        Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                    },
                });
                //if the response is not between 200-299 then that means something went wrong and it returns an error message    
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Notifications couldn't be retreived: ${errorText}`);
                }
                //if the response is okay "successful" then parse through the json items from the GET API call
                const data = await response.json();

                // set notifications varaible with that data
                setNotifications(data)
                // if data.length is greater than 1 then there is pending notifications else no notificaitons
                // this logic will be used to determine the color of the button
                setPendingNotifications(data.length > 0);
            } catch (err: any) {
                console.error("Notification error:", err);
            }
        }; // calls the function and then after it has been defined
            fetchNotifications();
        // took a bit to understand this, but without it would constantly call the API call
        // this empty array essentially tells react to only run itself once and that's it
    }, []);

    // creating a function that marks the notification as read. when the page gets refreshed
    // the notification should disappear
    const readNotification = async(notification_id: any) => {
        try {
            // same logic as above but as a PUT API call
            // uses the notification id passed from the function, upon clicking it, to interact with the notification
            const response = await fetch(`http://localhost:8000/agent_notifications/${notification_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("agent_token") || ""}`,
                },
            });

            if(!response.ok) {
                const errorText = await response.text();
                throw new Error(`Message was unable to be marked read: ${errorText}`);
            }

            // this logic loops through the current list of notification and if it matches the one clicked, then it marks it as read
            // then it updates the state with the current list
            // had some help from documentation and my manager on this matter
            setNotifications((currentData) =>
                currentData.map((current) => (current.id === notification_id ? {...current, read: true} : current
            ))    
            );
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        // this is the notification button that will go on the top right of the screen
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={() => setShowPopUp((prev) => !prev)}
                className={`px-4 py-2 font-semibold rounded shadow ${
                    pendingNotifications
                    // if the pendingNotifications are > 1 then it makes the button red
                    // this allows the user to visually see any pending notifications
                        ? "bg-red-600 text-white hover:bg-red-950 cursor-pointer"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-600 cursor-pointer"
                }`}
            >
                Notifications
            </button>
                {/* The code below corresponds to the items that are displayed in the pop up menu */}
            {showPopUp && (
                <div className="mt-2 w-80 bg-white text-black shadow-lg border border-gray-300 rounded p-4">
                    <h3 className="text-lg font-bold mb-2">Your Notifications</h3>
                        {/* loops through the notifications array and displays each */}
                        {notifications.map((notification) => (
                            <div 
                            key={notification.id} 
                            className={`mb-2 border-b pb-2 cursor-pointer ${notification.read? "" : "bg-gray-200 hover:bg-gray-400"}`}
                            // on click trigger the readNotification function and perform the put API call with the identified id
                            onClick={() => readNotification(notification.id)}
                            >
                                <p><strong>Notification ID:</strong> {notification.id}</p>
                                <p><strong>Message:</strong> {notification.message}</p>
                                </div>
                            ))}
                </div>
            )}
        </div>
    );
}
