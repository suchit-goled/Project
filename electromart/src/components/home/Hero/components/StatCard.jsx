const StatCard = ({ number, label }) => {

    return (

        <div className="stat-card">

            <h3>{number}</h3>

            <span>{label}</span>

        </div>

    );

};

export default StatCard;