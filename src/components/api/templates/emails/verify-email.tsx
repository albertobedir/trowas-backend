import React from "react";

interface EmailVerificationEmailProps {
  name: string;
  verificationCode: string;
}

const EmailVerificationEmail: React.FC<EmailVerificationEmailProps> = ({
  name,
  verificationCode,
}) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        backgroundColor: "#f4f7fc",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ color: "#333", textAlign: "center" }}>
          Verify Your Email Address
        </h2>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          Hello {name},
        </p>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          Thank you for signing up. Please use the code below to verify your
          email address:
        </p>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            backgroundColor: "#f0f0f0",
            padding: "15px",
            borderRadius: "4px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          {verificationCode}
        </div>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          This code will expire in 15 minutes. If you didn’t request this,
          please ignore this email.
        </p>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          Best regards,
          <br />
          Your Team
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationEmail;
