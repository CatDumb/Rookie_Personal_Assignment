import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/Header/Profile";
import { ProfileSidebar } from "@/components/ui/profile-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import PersonalInformation from "../../Page/Profile/tabs/PersonalInformation";
import OrderHistory from "../../Page/Profile/tabs/OrderHistory";
import Settings from "../../Page/Profile/tabs/Settings";


const ProfilePage = () => {
    const { firstName, lastName } = useAuth();
    const [ activeTab, setActiveTab ] = useState("profile");

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-height)-var(--footer-height))]">
            <ProfileHeader text={`${firstName} ${lastName}`} />
            <div className="flex-1 flex min-h-0 overflow-hidden">
                <SidebarProvider className="flex-1 flex min-h-0">
                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-auto p-4">
                            <SidebarTrigger />
                            {activeTab === "profile" && <PersonalInformation />}
                            {activeTab === "order_history" && <OrderHistory />}
                            {activeTab === "settings" && <Settings />}
                        </div>
                    </div>
                </SidebarProvider>
            </div>
        </div>
    );
};

export default ProfilePage;
