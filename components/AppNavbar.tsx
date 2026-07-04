import { Navbar } from "@/components/Navbar";
import { useNavbarBadges } from "@/hooks/useNavbarBadges";

type AppNavbarProps = {
  activeTabId: string;
  onTabPress: (id: string) => void;
};

export function AppNavbar({ activeTabId, onTabPress }: AppNavbarProps) {
  const { hasHeartBadge, unreadChatCount } = useNavbarBadges({
    suppressHeartBadge: activeTabId === "heart",
  });

  return (
    <Navbar
      tabs={[
        { id: "index", iconName: "home", label: "홈" },
        {
          id: "heart",
          iconName: "heart",
          label: "마음",
          hasDotBadge: hasHeartBadge,
        },
        {
          id: "chat",
          iconName: "chat",
          label: "대화",
          badgeCount: unreadChatCount,
        },
        { id: "my", iconName: "person", label: "마이" },
      ]}
      activeTabId={activeTabId}
      onTabPress={onTabPress}
      activeColor="#1F2937"
      inactiveColor="#9CA3AF"
    />
  );
}
