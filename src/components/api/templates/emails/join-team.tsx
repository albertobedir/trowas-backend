import React from "react";

interface JoinTeamEmailProps {
  name: string;
  teamName: string;
  teamId: string;
  memberId: string;
}

const JoinTeamEmail: React.FC<JoinTeamEmailProps> = ({
  name,
  teamName,
  teamId,
  memberId,
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
          Team Invitation: {teamName}
        </h2>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          Hi {name},
        </p>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          You&apos;ve been invited to join the <strong>{teamName}</strong> team.
        </p>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          To join, please click the button below to verify your email and
          finalize your membership:
        </p>
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <a
            //env den base url alamiyorum, suanlik statik halde, product edilirken bakilmasi gerek
            href={`http://localhost:3000/team/${teamId}/update-member/${memberId}?role=pending`}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "14px 30px",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            Verify Email and Join Team
          </a>
        </div>
        <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.5" }}>
          If you did not request this invitation, you can safely ignore this
          email.
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

export default JoinTeamEmail;
