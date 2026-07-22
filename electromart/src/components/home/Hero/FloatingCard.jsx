const FloatingCard = ({
    image,
    alt,
    className = "",
}) => {
    return (
        <div className={`floating-card ${className}`}>
            <img src={image} alt={alt} />
        </div>
    );
};

export default FloatingCard;