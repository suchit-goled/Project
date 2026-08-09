import React, { useState } from "react";
import axios from "axios";
import "../pages/Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://project-vlbr.onrender.com/contact",
        formData
      );

      setStatus("Message sent successfully! We'll get back to you soon.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });

    } catch (error) {
      console.log(error);
      setStatus("Unable to send message. Please try again.");
    }
  };

  return (
    <div className="contact-page">

      {/* HERO */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <span className="contact-tag">
            GET IN TOUCH
          </span>

          <h1>
            Let's Talk About
            <span> Your Tech.</span>
          </h1>

          <p>
            Have a question about a product, your order, or anything
            else? Our team is here to help.
          </p>

        </div>

      </section>


      {/* CONTACT CONTENT */}

      <section className="contact-section">

        {/* LEFT */}

        <div className="contact-info">

          <h2>
            Contact Information
          </h2>

          <p className="contact-description">
            Whether you need help choosing the right product or
            have a question about an existing order, feel free
            to reach out to us.
          </p>


          <div className="contact-info-card">

            <div className="contact-icon">
              📧
            </div>

            <div>
              <h3>Email</h3>
              <p>support@electronova.com</p>
            </div>

          </div>


          <div className="contact-info-card">

            <div className="contact-icon">
              📞
            </div>

            <div>
              <h3>Phone</h3>
              <p>+91 7676716597</p>
            </div>

          </div>


          <div className="contact-info-card">

            <div className="contact-icon">
              📍
            </div>

            <div>
              <h3>Location</h3>
              <p>India</p>
            </div>

          </div>


          <div className="contact-info-card">

            <div className="contact-icon">
              🕐
            </div>

            <div>
              <h3>Working Hours</h3>
              <p>Monday – Saturday</p>
              <p>9:00 AM – 6:00 PM</p>
            </div>

          </div>

        </div>


        {/* RIGHT - FORM */}

        <div className="contact-form-card">

          <h2>
            Send Us a Message
          </h2>

          <p>
            Fill out the form below and we'll get back to you.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="contact-form-row">

              <div className="contact-input-group">

                <label>
                  Your Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="contact-input-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            <div className="contact-form-row">

              <div className="contact-input-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>


              <div className="contact-input-group">

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  placeholder="What is this about?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            <div className="contact-input-group">

              <label>
                Message
              </label>

              <textarea
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />

            </div>


            <button
              type="submit"
              className="contact-submit-btn"
            >
              Send Message →
            </button>

          </form>


          {status && (
            <p className="contact-status">
              {status}
            </p>
          )}

        </div>

      </section>


      {/* FAQ / SUPPORT */}

      <section className="contact-support">

        <div>

          <span className="contact-tag">
            NEED HELP?
          </span>

          <h2>
            We're here to help.
          </h2>

          <p>
            From product questions to order assistance,
            ElectroNova is ready to help you get the most
            out of your technology.
          </p>

        </div>

      </section>

    </div>
  );
}

export default Contact;