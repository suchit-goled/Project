import { HERO } from "../../../constants/hero";

import Button from "../../ui/Button/Button";

import TrustBadges from "./TrustBadges";

const HeroContent = () => {

    return (

        <div className="hero__content">

            <span className="hero__tag">

                PREMIUM ELECTRONICS

            </span>

            <h1>

                {HERO.title}

                <span>{HERO.highlight}</span>

            </h1>

            <p>

                {HERO.description}

            </p>

            <div className="hero__buttons">

                <Button>

                    {HERO.primaryButton}

                </Button>

                <Button variant="secondary">

                    {HERO.secondaryButton}

                </Button>

            </div>

            <TrustBadges />

        </div>

    );

};

export default HeroContent;