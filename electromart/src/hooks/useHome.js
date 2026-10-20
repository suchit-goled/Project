import { useEffect, useState } from "react";
import HomeService from "../services/home.service";

const useHome = () => {
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchHome = async () => {
            try {
                const data = await HomeService.getHomePage();
                if (isMounted) {
                    setHome(data);
                }
            } catch (err) {
                console.error("Home fetch error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchHome();

        return () => {
            isMounted = false;
        };
    }, []);

    return { home, loading };
};

export default useHome;
