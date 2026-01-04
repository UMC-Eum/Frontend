import { useState } from "react";
import AlertModal from "../components/AlertModal";

// alertmodal 확인용 페이지입니다
export default function EmptyPage() {
  const [open, setOpen] = useState(true);

  return <>{open && <AlertModal onClose={() => setOpen(false)} />}</>;
}
