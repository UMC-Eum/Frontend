import IdleCard from "../components/card/presets/IdleCard.tsx";


// 더미 키워드 (네 Keyword 타입에 맞게 수정 가능)


export default function CardTestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IdleCard />
    </div>
  );
}
