import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginSignup() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signup");
  const [selectedRole, setSelectedRole] = useState("developer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (selectedRole === "developer") {
      navigate("/developer/dashboard");
    } else {
      navigate("/client/dashboard");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#051614",
        minHeight: "100vh",
        display: "flex",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          width: "50%",
          background: "#0d1f1d",
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "#006b76",
            opacity: 0.2,
            filter: "blur(80px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div
          onClick={() => navigate("/")}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#d2e7e3",
            cursor: "pointer",
            letterSpacing: "-0.04em",
            zIndex: 1,
          }}
        >
          Kinetic Editorial
        </div>

        <div style={{ zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "clamp(3rem, 5vw, 5rem)",
              fontWeight: 700,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              color: "#d2e7e3",
              marginBottom: "2rem",
            }}
          >
            CRAFT YOUR
            <br />
            <span style={{ color: "#ffb691" }}>LEGACY</span>
            <br />
            IN CODE.
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#83d3df",
              maxWidth: "28rem",
              lineHeight: 1.7,
            }}
          >
            A curated ecosystem where engineering precision meets editorial
            flair.
          </p>

          <div
            style={{
              marginTop: "3rem",
              padding: "2rem",
              borderLeft: "4px solid #ffb691",
              background: "#112321",
            }}
          >
            <p
              style={{
                fontStyle: "italic",
                color: "#ddc1b4",
                fontSize: "1rem",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              "The Kinetic Editorial isn't just a platform; it's a statement of
              intent for the modern engineer."
            </p>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#263836",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  color: "#83d3df",
                  fontSize: "0.75rem",
                }}
              >
                JV
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#d2e7e3",
                  }}
                >
                  Julian Voss
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#83d3df",
                    textTransform: "uppercase",
                  }}
                >
                  Principal Architect
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: "0.7rem",
            color: "rgba(131,211,223,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            zIndex: 1,
          }}
        >
          © 2024 Kinetic Editorial
        </p>
      </div>

      {/* RIGHT SIDE — Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#051614",
        }}
      >
        <div
          style={{ width: "100%", maxWidth: "480px", background: "#0d1f1d" }}
        >
          {/* Tab Toggle */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(86,66,57,0.2)",
            }}
          >
            {["signup", "login"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "1.25rem",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "Space Grotesk, sans-serif",
                  transition: "all 0.2s",
                  background: activeTab === tab ? "#263836" : "transparent",
                  color: activeTab === tab ? "#ffb691" : "#83d3df",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #ffb691"
                      : "2px solid transparent",
                }}
              >
                {tab === "signup" ? "Sign Up" : "Login"}
              </button>
            ))}
          </div>

          <div style={{ padding: "2.5rem" }}>
            {/* Role Selector */}
            {activeTab === "signup" && (
              <div style={{ marginBottom: "2rem" }}>
                <p
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#83d3df",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Select Your Path
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {[
                    {
                      role: "developer",
                      icon: "code",
                      title: "I'm a Developer",
                      sub: "Showcase expertise",
                    },
                    {
                      role: "client",
                      icon: "rocket_launch",
                      title: "I'm a Client",
                      sub: "Hire top talent",
                    },
                  ].map((item) => (
                    <div
                      key={item.role}
                      onClick={() => setSelectedRole(item.role)}
                      style={{
                        padding: "1.5rem",
                        cursor: "pointer",
                        border:
                          selectedRole === item.role
                            ? "2px solid #e37434"
                            : "2px solid transparent",
                        background:
                          selectedRole === item.role ? "#263836" : "#112321",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          color:
                            selectedRole === item.role ? "#ffb691" : "#83d3df",
                          display: "block",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {item.icon}
                      </span>
                      <p
                        style={{
                          fontFamily: "Space Grotesk, sans-serif",
                          fontWeight: 700,
                          color: "#d2e7e3",
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.65rem",
                          color: "#83d3df",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginTop: "0.25rem",
                        }}
                      >
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {activeTab === "signup" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "#83d3df",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={handleInput}
                    style={{
                      width: "100%",
                      background: "#051614",
                      border: "none",
                      borderBottom: "2px solid rgba(86,66,57,0.4)",
                      padding: "0.75rem 0",
                      color: "#d2e7e3",
                      fontSize: "1rem",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor = "#83d3df")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "rgba(86,66,57,0.4)")
                    }
                  />
                </div>
              )}
              {[
                {
                  name: "email",
                  type: "email",
                  label: "Email Address",
                  placeholder: "alex@kinetic.io",
                },
                {
                  name: "password",
                  type: "password",
                  label: "Password",
                  placeholder: "••••••••",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      color: "#83d3df",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleInput}
                    style={{
                      width: "100%",
                      background: "#051614",
                      border: "none",
                      borderBottom: "2px solid rgba(86,66,57,0.4)",
                      padding: "0.75rem 0",
                      color: "#d2e7e3",
                      fontSize: "1rem",
                      outline: "none",
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderBottomColor = "#83d3df")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderBottomColor = "rgba(86,66,57,0.4)")
                    }
                  />
                </div>
              ))}

              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  background: "#e37434",
                  color: "#4e1d00",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "0.5rem",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.filter = "brightness(1.1)")
                }
                onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
              >
                {activeTab === "signup" ? "Create Account" : "Sign In"}
              </button>

              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(86,66,57,0.2)",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "rgba(131,211,223,0.4)",
                  }}
                >
                  Or continue with
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(86,66,57,0.2)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {["GitHub", "LinkedIn"].map((social) => (
                  <button
                    key={social}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid rgba(86,66,57,0.3)",
                      background: "transparent",
                      color: "#d2e7e3",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#263836")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "transparent")
                    }
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
