import { Text, View } from "react-native";

interface TabBarProps {
  Tab1?: string;
  Tab2?: string;
}

export default function TabBar({ Tab1 = "Tab1", Tab2 = "Tab2" }: TabBarProps) {
  return (
    <View
      className="w-[372px] h-[40px] rounded-[36px] flex-row items-center px-[20px] bg-[#d33e3e]"
      style={{ flexDirection: "row", backgroundColor: "#d33e3e" }}
    >
      <Text className="mr-5 text-white font-bold">{Tab1}</Text>
      <Text className="mr-5 text-white font-bold">{Tab2}</Text>
    </View>
  );
}
