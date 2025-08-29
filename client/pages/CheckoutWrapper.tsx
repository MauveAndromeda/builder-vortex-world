import Checkout from "@/pages/Checkout";
import { useParams } from "react-router-dom";

export default function CheckoutWrapper({ mode }: { mode: string }) {
  const params = useParams();
  return <Checkout />;
}
