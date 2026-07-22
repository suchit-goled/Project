import FloatingCard from "./FloatingCard";

import laptop from "../../../assets/images/laptop.png";
import phone from "../../../assets/images/phone.png";
import watch from "../../../assets/images/watch.png";
import earbuds from "../../../assets/images/earbuds.png";

const HeroVisual = () => {
    return (
        <div className="hero__visual">

            <div className="hero__glow"></div>

            <FloatingCard
                image={laptop}
                alt="Laptop"
                className="card-laptop"
            />

            <FloatingCard
                image={phone}
                alt="Phone"
                className="card-phone"
            />

            <FloatingCard
                image={watch}
                alt="Watch"
                className="card-watch"
            />

            <FloatingCard
                image={earbuds}
                alt="Earbuds"
                className="card-earbuds"
            />

        </div>
    );
};

export default HeroVisual;