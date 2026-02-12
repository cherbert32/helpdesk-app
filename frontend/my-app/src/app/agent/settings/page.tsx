// client side
"use client";

// importing react hooks
// importing the Agent components

import { useRouter } from "next/navigation";
import AgentSidebar from '@/app/components/agent_sidebar';
import AgentNotifBar from '@/app/components/agent_notifbar';


// creating a function that houses all buttons that redirect agent to corresponding pages not in side bar
export default function SettingsPage() {
    const router = useRouter();

    return (
        <div className="flex h-screen">
            <AgentSidebar />
            {/* Experiences some issues with displaying the notfication pop up and had to create it in another div */}
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="flex justify-end p-4">
                    <AgentNotifBar />
                </div>
                {/* creating a grid level with 3 columns*/}
                {/* each button when clicked takes users to their corresponding sections*/}
                <div className="p-8 grid md:grid-cols-3 gap-6">
                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/agent/agents")}
                    >
                        <p className="text-lg font-semibold text-black">Agents</p>
                    </div>
                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/agent/groups")}
                    >
                        <p className="text-lg font-semibold text-black">Groups</p>
                    </div>

                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/agent/ticket_type")}
                    >
                        <p className="text-lg font-semibold text-black">Ticket Types</p>
                    </div>

                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/agent/ticket_sla")}
                    >
                        <p className="text-lg font-semibold text-black">Service Level Agreements</p>
                    </div>

                    <div
                        className="cursor-pointer text-black bg-white w-full rounded-lg shadow-md p-4 hover:bg-gray-400 hover:scale-105 transition-transform duration-300"
                        onClick={() => router.push("/agent/all_feedback")}
                    >
                        <p className="text-lg font-semibold text-black">All feedback</p>
                    </div>
                </div>
            </div>
        </div>
    );
}