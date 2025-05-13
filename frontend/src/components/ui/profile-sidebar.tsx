import {ShoppingCart, Settings, User } from "lucide-react"
import { useTranslation } from "react-i18next";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
  const { t } = useTranslation();
  const items = [
    {
      id: "profile",
      title: t("profile_sidebar_profile"),
      url: "#profile",
      icon: User,
    },
    {
      id: "order_history",
      title: t("profile_sidebar_order_history"),
      url: "#order_history",
      icon: ShoppingCart,
    },
    {
      id: "settings",
      title: t("profile_sidebar_settings"),
      url: "#settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="h-full">
      <SidebarContent className="h-full">
        <SidebarGroup className="h-full">
          <SidebarGroupLabel>{t('profile_sidebar_application')}</SidebarGroupLabel>
          <SidebarGroupContent className="h-full">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.id} // Dynamically set active state
                    onClick={() => setActiveTab(item.id)}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
