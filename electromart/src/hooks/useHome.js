import { useEffect, useState } from "react";
import HomeService from "../services/home.service";

const useHome = () => {
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHome = async () => {
            try {
                const data = await HomeService.getHomePage();
                setHome(data);
            } finally {
                setLoading(false);
            }
        };

        fetchHome();
    }, []);

    return { home, loading };
};

export default useHome;