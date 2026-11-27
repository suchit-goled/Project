import "./SectionHeader.css";

const SectionHeader = ({
  badge,
  title,
  subtitle,
}) => {
  return (
    <div className="section-header">

      {badge && <span className="section-header__badge">{badge}</span>}

      <h2 className="section-header__title">
        {title}
      </h2>

      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}

    </div>
  );
};

export default SectionHeader;