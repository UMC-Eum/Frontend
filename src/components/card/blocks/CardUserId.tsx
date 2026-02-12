import cerficationmark from "../../../assets/card_cerfication.svg";

interface UserIdProps {
  name: string;
  age: number;
  isVerified?: boolean;
  textsize?: string;
  mbsize?: string;
  bold?: string;
}

export function CardUserId({
  name,
  age,
  isVerified,
  textsize = "text-2xl",
  mbsize = "mb-3",
  bold = "font-bold",
}: UserIdProps) {
  return (
    <div className={`flex items-center gap-2 ${mbsize}`}>
      <h2 className={`${textsize} + ${bold} + text-white`}>
        {name} {age}
      </h2>

      {isVerified && <img src={cerficationmark} />}
    </div>
  );
}
