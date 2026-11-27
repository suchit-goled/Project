import { FiShoppingCart, FiMapPin, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import "./CheckoutSteps.css";

const steps = [["Cart", FiShoppingCart], ["Address", FiMapPin], ["Payment", FiCreditCard], ["Success", FiCheckCircle]];

export default function CheckoutSteps({ addressComplete = false }) {
  const current = addressComplete ? 2 : 1;
  return (
    <ol className="checkout-steps" aria-label="Checkout progress">
      {steps.map(([label, Icon], index) => (
        <li key={label} className={"step" + (index <= current ? " active" : "")}
          aria-current={index === current ? "step" : undefined}>
          <span className="step-circle"><Icon aria-hidden="true" /></span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}
