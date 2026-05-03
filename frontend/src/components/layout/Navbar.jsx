import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { navbarLinks } from "../../data/mockData";
import logoDark from "../../assets/logo_dark.png";
import logoLight from "../../assets/logo_light.png";
import ThemePullCord from "../ui/ThemePullCord";
import { notificationService } from "../../api/services/notificationService";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshingNotifications, setIsRefreshingNotifications] = useState(false);
  const notificationRef = useRef(null);

  const loadNotifications = async ({ markRead = false } = {}) => {
    try {
      const res = await notificationService.getMyNotifications();
      const payload = res.data?.data || {};
      const list = payload.notifications || [];
      const nextUnread = payload.unreadCount || 0;
      setNotifications(list);
      setUnreadCount(nextUnread);

      if (markRead && nextUnread > 0) {
        await notificationService.markAllRead();
        setUnreadCount(0);
        setNotifications(list.map((item) => ({ ...item, isRead: true })));
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();
  }, [user?.userID]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [notificationsOpen]);

  // ✅ Early return AFTER all hooks
  if (pathname === "/auth") return null;

  const handleToggleNotifications = async (event) => {
    event.stopPropagation();

    if (!user) return;

    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      try {
        await loadNotifications({ markRead: true });
      } catch (err) {
        console.error("Failed to open notifications", err);
      }
    }
  };

  const handleRefreshNotifications = async () => {
    if (!user) return;
    setIsRefreshingNotifications(true);
    try {
      await loadNotifications({ markRead: true });
    } finally {
      setIsRefreshingNotifications(false);
    }
  };

  // Determine dynamic links based on role
  let links = [...navbarLinks];
  if (user?.role === "DEVELOPER") {
    links = [
      { label: "Dashboard", path: "/developer/dashboard" },
      { label: "Open Contracts", path: "/jobs" },
      { label: "My Proposals", path: "/developer/applications" },
    ];
  } else if (user?.role === "CLIENT") {
    links = [
      { label: "Dashboard", path: "/client/dashboard" },
      { label: "Developer Directory", path: "/client/directory" },
    ];
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        background: "var(--color-navbar-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 2rem",
        borderBottom: "1px solid var(--color-outline-variant)",
        transition: "background 0.4s ease, border-color 0.3s ease",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <img
          src={isDark ? logoDark : logoLight}
          alt="Codex"
          style={{
            height: "80px",
            width: "auto",
            transition: "opacity 0.3s ease",
          }}
        />
      </div>

      {/* Nav Links — Desktop */}
      <div
        className="hide-mobile"
        style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}
      >
        {links.map((item) => (
          <span
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              color: "var(--color-on-surface)",
              cursor: "pointer",
              fontFamily: "var(--font-headline)",
              fontSize: "0.95rem",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.color = "var(--color-secondary)")
            }
            onMouseLeave={(e) =>
              (e.target.style.color = "var(--color-on-surface)")
            }
          >
            {item.label}
          </span>
        ))}
      </div>

      {/* Action Buttons — Desktop */}
      <div
        className="hide-mobile"
        style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
      >
        <ThemePullCord />

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div ref={notificationRef} style={{ position: "relative" }}>
              <button
                onClick={handleToggleNotifications}
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-4px",
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      borderRadius: "999px",
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      fontFamily: "var(--font-headline)",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  onClick={(event) => event.stopPropagation()}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 12px)",
                    width: "320px",
                    background: "var(--color-surface-container-low)",
                    border: "1px solid var(--color-outline-variant)",
                    borderRadius: "10px",
                    padding: "1rem",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      gap: "0.75rem",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-headline)",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Notifications
                    </p>
                    <button
                      type="button"
                      onClick={handleRefreshNotifications}
                      disabled={isRefreshingNotifications}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--color-outline-variant)",
                        color: "var(--color-on-surface)",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "999px",
                        cursor: isRefreshingNotifications ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-headline)",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        opacity: isRefreshingNotifications ? 0.6 : 1,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "0.95rem" }}>
                        refresh
                      </span>
                      {isRefreshingNotifications ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ color: "var(--color-on-surface-variant)" }}>
                      You are all caught up.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "320px", overflowY: "auto" }}>
                      {notifications.map((notification) => (
                        <button
                          key={notification.notificationID}
                          onClick={() => {
                            if (notification.link) {
                              navigate(notification.link);
                              setNotificationsOpen(false);
                            }
                          }}
                          style={{
                            textAlign: "left",
                            background: notification.isRead ? "transparent" : "var(--color-surface-container-high)",
                            border: "1px solid var(--color-outline-variant)",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            color: "var(--color-on-surface)",
                            cursor: notification.link ? "pointer" : "default",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700 }}>
                            {notification.title}
                          </p>
                          <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>
                            {notification.body}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--color-outline-variant)",
                color: "var(--color-on-surface)",
                padding: "0.4rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
            {user.role === "CLIENT" && (
              <button
                onClick={() => navigate("/post-contract")}
                style={{
                  background: "var(--color-primary-container)",
                  color: "var(--color-on-primary-container)",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  transition: "filter 0.3s ease, transform 0.3s ease",
                }}
              >
                Create Contract
              </button>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/auth")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-on-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/post-contract")}
              style={{
                background: "var(--color-primary-container)",
                color: "var(--color-on-primary-container)",
                border: "none",
                padding: "0.6rem 1.5rem",
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
                borderRadius: "4px",
              }}
            >
              Create Contract
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="show-mobile" style={{ display: "none", gap: "0.75rem", alignItems: "center" }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            background: "var(--color-surface-container-highest)",
            border: "none",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}
          >
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.75rem", color: "var(--color-on-surface)" }}
          >
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          className="show-mobile"
          style={{
            display: "flex",
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--color-surface-container-low)",
            flexDirection: "column",
            padding: "1.5rem 2rem",
            gap: "1.25rem",
            borderBottom: "1px solid var(--color-outline-variant)",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {links.map((item) => (
            <span
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              style={{
                color: "var(--color-on-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-headline)",
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {item.label}
            </span>
          ))}

          {user ? (
            <>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textAlign: "left",
                  padding: 0,
                }}
              >
                Logout
              </button>
              {user.role === "CLIENT" && (
                <button
                  onClick={() => {
                    navigate("/post-contract");
                    setMobileOpen(false);
                  }}
                  style={{
                    background: "var(--color-primary-container)",
                    color: "var(--color-on-primary-container)",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    fontFamily: "var(--font-headline)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  Post a Job
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/auth");
                  setMobileOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-headline)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  textAlign: "left",
                  padding: 0,
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate("/post-contract");
                  setMobileOpen(false);
                }}
                style={{
                  background: "var(--color-primary-container)",
                  color: "var(--color-on-primary-container)",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  fontFamily: "var(--font-headline)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Post a Job
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;