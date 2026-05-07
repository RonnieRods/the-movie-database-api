import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // "Instant" behavior avoids weird animation glitches during navigation
        window.scrollTo({ top: 0, left: 0, behavior: "instant"});
    }, [pathname]);

    return null;
}