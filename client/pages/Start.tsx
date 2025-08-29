import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const nav = useNavigate();
  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (!seen) nav("/splash", { replace: true });
    else nav("/en-US", { replace: true });
  }, [nav]);
  return null;
}
