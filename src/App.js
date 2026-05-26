import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
 
const DEPARTMENTS = ["CSE","ECE","ME","CE","EE","IT","MBA","BBA","BCA","MCA","Other"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year","PG"];
 
const BASE_COUNT = 1248; // Static base — real submissions add on top
 
const INITIAL_SUPPORTERS = [
  { name: "Shivam Thakur", dept: "AIML", year: "2rd Year", msg: "Concentrating in 42°C heat is simply impossible.Student wellbeing must be a priority. Respectfully requesting action." },
  { name: "Aman Hassan", dept: "CSE", year: "4nd Year", msg: "We deserve a dignified learning environment. Please turn on the ACs." },
  { name: "Anushka Shankar", dept: "AIML", year: "2st Year", msg: "studying in this much heat will burn us. Respectfully requesting action" },
  { name: "Rahul Das", dept: "ME", year: "4th Year", msg: "The infrastructure exists — please use it." },
  { name: "Anika Gupta", dept: "IT", year: "2nd Year", msg: "Health and learning go hand in hand." },
  { name: "Surya Nandan", dept: "CE", year: "3rd Year", msg: "Every student deserves comfort while pursuing their future." },
];
 
const QUOTES = [
  { text: "The heat doesn't pause during exams. Neither should our request for basic comfort.", name: "Final Year Student, CSE" },
  { text: "We're not asking for luxury. We're asking for the ability to think clearly.", name: "2nd Year, ECE" },
  { text: "When students stand together respectfully, positive change becomes possible.", name: "Student Council Representative" },
  { text: "Our focus, our health, our future — all suffer in extreme heat.", name: "3rd Year, MBA" },
];
 
const WHY_CARDS = [
  { icon: "🌡️", title: "Extreme Heat Impairs Cognition", desc: "Studies show cognitive performance drops significantly above 27°C. Our classrooms regularly exceed 40°C during heatwaves." },
  { icon: "❤️", title: "Student Health Matters", desc: "Heat exhaustion, dehydration, and heat stress are real risks. Every student deserves a safe learning environment." },
  { icon: "📈", title: "Productivity & Outcomes", desc: "Better thermal comfort directly correlates with improved attendance, focus, and academic performance." },
  { icon: "🏛️", title: "Infrastructure Exists", desc: "AC units are already installed. This is a request to activate existing infrastructure — not a demand for new spending." },
];
 
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}
 
function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    const current = ref.current;
    if (current) obs.observe(current);
    return () => { if (current) obs.unobserve(current); };
  }, [ref]);
  return visible;
}
 
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}
 
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 6,
    duration: Math.random() * 8 + 10,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: "rgba(99,179,237,0.35)",
          animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}
 
function ScrollProgress() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setProg((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 9999 }}>
      <div style={{
        height: "100%", width: `${prog}%`,
        background: "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)",
        transition: "width 0.1s ease",
        boxShadow: "0 0 8px rgba(96,165,250,0.8)",
      }} />
    </div>
  );
}
 
function Navbar({ onNav }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
 
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
 
  const handleNav = (id) => { onNav(id); setMenuOpen(false); };
 
  return (
    <>
      <nav style={{
        position: "fixed", top: 3, left: 0, right: 0, zIndex: 1000,
        padding: "0 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        background: scrolled || menuOpen ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(18px)" : "none",
        borderBottom: scrolled || menuOpen ? "1px solid rgba(148,163,184,0.2)" : "none",
        transition: "all 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => handleNav("hero")}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "#fff",
          }}>V</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Voice of Narula</span>
        </div>
 
        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {[["Home","hero"],["Support","form"],["Student Voices","supporters"],["Why This Matters","why"]].map(([label, id]) => (
              <button key={id} onClick={() => handleNav(id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 500, color: "#475569", fontFamily: "inherit", transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "#2563eb"}
                onMouseLeave={e => e.target.style.color = "#475569"}
              >{label}</button>
            ))}
            <button onClick={() => handleNav("form")} style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
            }}>Add My Support</button>
          </div>
        )}
 
        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(m => !m)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 6, display: "flex", flexDirection: "column", gap: 5,
          }}>
            <span style={{ display: "block", width: 22, height: 2, background: "#334155", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#334155", borderRadius: 2, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#334155", borderRadius: 2, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        )}
      </nav>
 
      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 63, left: 0, right: 0, zIndex: 999,
          background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(148,163,184,0.2)",
          padding: "1rem 1.25rem 1.5rem",
          display: "flex", flexDirection: "column", gap: 4,
          animation: "successBounce 0.25s ease",
        }}>
          {[["Home","hero"],["Support","form"],["Student Voices","supporters"],["Why This Matters","why"]].map(([label, id]) => (
            <button key={id} onClick={() => handleNav(id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, fontWeight: 500, color: "#334155", fontFamily: "inherit",
              textAlign: "left", padding: "12px 8px",
              borderBottom: "1px solid rgba(148,163,184,0.15)",
            }}>{label}</button>
          ))}
          <button onClick={() => handleNav("form")} style={{
            marginTop: 8,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "14px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
          }}>Add My Support ✦</button>
        </div>
      )}
    </>
  );
}
 
function PinnedMessage() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section style={{
      padding: "76px 1rem 0",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)",
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px)",
          border: "1.5px solid rgba(59,130,246,0.28)",
          borderLeft: "5px solid #2563eb",
          borderRadius: 16, padding: "28px 20px",
          boxShadow: "0 8px 40px rgba(59,130,246,0.10)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -13, left: 16,
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            color: "#fff", fontSize: 10, fontWeight: 700,
            borderRadius: 100, padding: "4px 12px", letterSpacing: 1,
            textTransform: "uppercase", boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span>📌</span> Pinned · Official Statement
          </div>
 
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginTop: 8 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,#2563eb,#60a5fa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 17, color: "#fff",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
            }}>ST</div>
 
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Shivam Thakur</span>
                <span style={{
                  background: "rgba(37,99,235,0.1)", color: "#2563eb",
                  fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "3px 9px",
                }}>Movement Leader</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>On behalf of all students · Narula Institute of Technology</div>
 
              <div style={{
                fontSize: 14, color: "#334155", lineHeight: 1.82,
                fontFamily: "'Lora',serif",
                maxHeight: expanded ? "none" : 68,
                overflow: "hidden", position: "relative",
              }}>
                <p style={{ margin: "0 0 10px" }}>Respected Sir/Madam,</p>
                <p style={{ margin: "0 0 10px" }}>I hope you are doing well. I am writing on behalf of a large number of students to respectfully bring to your attention the difficulties being faced due to the extreme heat conditions currently prevailing in the city. While the college infrastructure has recently been upgraded with air conditioning units, the facilities are yet to be made operational.</p>
                <p style={{ margin: "0 0 10px" }}>The rising temperatures inside classrooms are making it increasingly difficult for students to attend lectures comfortably and maintain proper concentration during academic sessions. Many students are experiencing physical discomfort, fatigue, and a noticeable decline in productivity and attendance because of the current conditions.</p>
                <p style={{ margin: "0 0 10px" }}>We sincerely request the management to kindly consider activating the air conditioning facilities at the earliest for the welfare, health, and academic well-being of the students. We fully understand that there may be administrative, technical, or logistical considerations involved, and we would greatly appreciate any support or clarification regarding the same.</p>
                <p style={{ margin: "0 0 10px" }}>This request is being made respectfully and collectively in the interest of maintaining a healthy and effective learning environment for everyone on campus.</p>
                <p style={{ margin: "0 0 10px" }}>We remain grateful for the continuous efforts of the college administration toward student welfare and hope for a positive consideration of this appeal.</p>
                <p style={{ margin: "0 0 10px" }}>Thank you for your time and understanding.</p>
                <p style={{ margin: 0, fontStyle: "italic", color: "#475569" }}>Yours sincerely,<br /><strong>Shivam Thakur</strong><br />On behalf of the students</p>
                {!expanded && <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                  background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))",
                }} />}
              </div>
 
              <button onClick={() => setExpanded(e => !e)} style={{
                marginTop: 10, background: "none", border: "none",
                color: "#2563eb", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", padding: 0,
              }}>
                {expanded ? "Show less ↑" : "Read full statement ↓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 
function Hero({ onNav, supporters }) {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const firebaseCount = supporters.filter(s => s.id && !INITIAL_SUPPORTERS.find(x => x.name === s.name)).length;
  const count = useCountUp(BASE_COUNT + firebaseCount, 2200);
 
  return (
    <section id="hero" style={{
      minHeight: "100vh", position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(96,165,250,0.18) 0%, transparent 70%)",
        animation: "gradientShift 8s ease-in-out infinite alternate",
      }} />
      <Particles />
 
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        maxWidth: 820, padding: isMobile ? "80px 1.25rem 2rem" : "0 2rem",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 100, padding: "6px 14px", marginBottom: 22,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite", display: "inline-block" }} />
          <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, color: "#2563eb" }}>Student-Led Movement · Active Now</span>
        </div>
 
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: isMobile ? "2.6rem" : "clamp(3rem, 8vw, 5.5rem)",
          fontWeight: 900, lineHeight: 1.08,
          color: "#0f172a", margin: "0 0 16px", letterSpacing: -1.5,
        }}>
          Voice of{" "}
          <span style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Narula</span>
        </h1>
 
        <p style={{
          fontSize: isMobile ? 15 : 18, fontWeight: 500, color: "#475569", marginBottom: 10,
          fontFamily: "'Lora', serif", fontStyle: "italic",
        }}>A collective student initiative for a better learning environment.</p>
 
        <p style={{
          fontSize: isMobile ? 14 : 16, color: "#64748b",
          maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.75,
        }}>
          Students of Narula Institute are respectfully requesting the activation of classroom air conditioning facilities during extreme heatwave conditions — for a healthier, more productive academic environment.
        </p>
 
        {/* CTA Buttons */}
        <div style={{
          display: "flex", gap: 12, justifyContent: "center",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: 48,
          padding: isMobile ? "0 0.5rem" : 0,
        }}>
          <button onClick={() => onNav("form")} style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: isMobile ? "16px" : "14px 32px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(59,130,246,0.4)", fontFamily: "inherit",
          }}>Support the Movement</button>
          <button onClick={() => onNav("supporters")} style={{
            background: "rgba(255,255,255,0.85)", color: "#1e40af",
            border: "1.5px solid rgba(59,130,246,0.35)", borderRadius: 12,
            padding: isMobile ? "16px" : "14px 32px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            backdropFilter: "blur(8px)", fontFamily: "inherit",
          }}>View Student Voices</button>
        </div>
 
        {/* Counter */}
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: 20, padding: isMobile ? "20px 36px" : "24px 48px",
          boxShadow: "0 8px 40px rgba(59,130,246,0.12)",
        }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{
              position: "absolute", inset: -12, borderRadius: "50%",
              background: "rgba(59,130,246,0.1)", animation: "counterPulse 2.5s ease-in-out infinite",
            }} />
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 38 : 48, fontWeight: 900, color: "#2563eb",
              lineHeight: 1, letterSpacing: -2, position: "relative",
            }}>{count.toLocaleString()}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginTop: 8 }}>Students Supporting</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Growing every minute.</div>
        </div>
      </div>
    </section>
  );
}
 
function SupportForm({ onSubmit }) {
  const ref = useRef();
  const visible = useInView(ref);
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", dept: "", year: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState({});
 
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.dept) e.dept = "Department is required";
    if (!form.year) e.year = "Year is required";
    return e;
  };
 
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onSubmit({ ...form });
      setForm({ name: "", dept: "", year: "", msg: "" });
      setLoading(false);
      setSuccess(true);       // ← moved to very last, after setLoading(false)
    } catch (err) {
      console.error("Submit error:", err);
      setLoading(false);
      alert("Something went wrong. Please check your connection and try again.");
    }
  };
 
  const inputStyle = (field) => ({
    width: "100%", boxSizing: "border-box",
    padding: "14px 14px", fontSize: 15,
    background: focused[field] ? "rgba(239,246,255,0.9)" : "rgba(248,250,252,0.9)",
    border: errors[field] ? "1.5px solid #f87171" : focused[field] ? "1.5px solid #3b82f6" : "1.5px solid rgba(148,163,184,0.3)",
    borderRadius: 10, outline: "none", fontFamily: "inherit",
    color: "#0f172a", transition: "all 0.25s",
    boxShadow: focused[field] ? "0 0 0 4px rgba(59,130,246,0.08)" : "none",
    WebkitAppearance: "none",
  });
 
  return (
    <section id="form" style={{ padding: isMobile ? "64px 1rem" : "100px 2rem", background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)" }}>
      <div ref={ref} style={{
        maxWidth: 560, margin: "0 auto",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Join the Movement</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 30 : 38, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: -1 }}>Add Your Voice</h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>Your support strengthens this respectful collective request.</p>
        </div>
 
        {success ? (
          <div style={{
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20,
            padding: "48px 28px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            animation: "successBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>Voice Added!</div>
            <div style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7 }}>Your voice has been added to the movement. Thank you for standing with your fellow students.</div>
            <button onClick={() => setSuccess(false)} style={{
              marginTop: 24, background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%",
            }}>Add Another Support</button>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(148,163,184,0.2)", borderRadius: 20,
            padding: isMobile ? "28px 20px" : "40px 40px",
            boxShadow: "0 20px 60px rgba(59,130,246,0.08)",
          }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full Name *</label>
              <input value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}
                onFocus={() => setFocused(f => ({ ...f, name: true }))}
                onBlur={() => setFocused(f => ({ ...f, name: false }))}
                placeholder="Your full name" style={inputStyle("name")} />
              {errors.name && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.name}</div>}
            </div>
 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Department *</label>
                <select value={form.dept}
                  onChange={e => { setForm(f => ({ ...f, dept: e.target.value })); setErrors(er => ({ ...er, dept: "" })); }}
                  onFocus={() => setFocused(f => ({ ...f, dept: true }))}
                  onBlur={() => setFocused(f => ({ ...f, dept: false }))}
                  style={{ ...inputStyle("dept"), cursor: "pointer" }}>
                  <option value="">Dept.</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dept && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.dept}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Year *</label>
                <select value={form.year}
                  onChange={e => { setForm(f => ({ ...f, year: e.target.value })); setErrors(er => ({ ...er, year: "" })); }}
                  onFocus={() => setFocused(f => ({ ...f, year: true }))}
                  onBlur={() => setFocused(f => ({ ...f, year: false }))}
                  style={{ ...inputStyle("year"), cursor: "pointer" }}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.year}</div>}
              </div>
            </div>
 
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Message <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea value={form.msg}
                onChange={e => setForm(f => ({ ...f, msg: e.target.value }))}
                onFocus={() => setFocused(f => ({ ...f, msg: true }))}
                onBlur={() => setFocused(f => ({ ...f, msg: false }))}
                placeholder="Share why this matters to you..." rows={3}
                style={{ ...inputStyle("msg"), resize: "none", lineHeight: 1.6 }} />
            </div>
 
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", padding: "16px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              {loading
                ? <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Adding...</>
                : "Add My Support ✦"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
 
function SupporterCard({ s, delay = 0 }) {
  const ref = useRef();
  const visible = useInView(ref);
  const initials = s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#3b82f6","#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b"];
  const color = colors[s.name.charCodeAt(0) % colors.length];
  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16,
      padding: "20px", transition: "all 0.3s",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transitionDelay: `${delay}ms`, transitionDuration: "0.7s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(59,130,246,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: s.msg ? 12 : 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 14, color, flexShrink: 0, border: `1px solid ${color}28`,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{s.name}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{s.dept} · {s.year}</div>
        </div>
      </div>
      {s.msg && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0, fontStyle: "italic", borderLeft: `3px solid ${color}40`, paddingLeft: 10 }}>"{s.msg}"</p>}
    </div>
  );
}
 
function Supporters({ supporters }) {
  const ref = useRef();
  const visible = useInView(ref);
  const isMobile = useIsMobile();
  const pinnedNames = new Set(INITIAL_SUPPORTERS.map(s => s.name));
  const pinnedSupporters = supporters.filter(s => pinnedNames.has(s.name));
  const newSupporters = supporters.filter(s => !pinnedNames.has(s.name));
  return (
    <section id="supporters" style={{ padding: isMobile ? "64px 1rem" : "100px 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref} style={{
          textAlign: "center", marginBottom: 44,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Student Voices</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 38, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: -1 }}>Hear From Your Peers</h2>
          <p style={{ fontSize: 15, color: "#64748b" }}>Real students. Real concerns. One unified, respectful voice.</p>
        </div>
        {/* Pinned initial supporters */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginBottom: newSupporters.length > 0 ? 32 : 0 }}>
          {pinnedSupporters.map((s, i) => <SupporterCard key={i} s={s} delay={Math.min(i * 60, 300)} isPinned={true} />)}
        </div>
 
        {/* Divider + new voices */}
        {newSupporters.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.25)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                ✦ New Voices
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(148,163,184,0.25)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {newSupporters.map((s, i) => <SupporterCard key={s.id || i} s={s} delay={Math.min(i * 60, 300)} isPinned={false} />)}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
 
function WhyMatters() {
  const ref = useRef();
  const visible = useInView(ref);
  const isMobile = useIsMobile();
  return (
    <section id="why" style={{ padding: isMobile ? "64px 1rem" : "100px 2rem", background: "linear-gradient(180deg, #eff6ff 0%, #f0f9ff 100%)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref} style={{
          textAlign: "center", marginBottom: 44,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Why This Matters</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 38, fontWeight: 900, color: "#0f172a", margin: "0 0 12px", letterSpacing: -1 }}>The Case for Comfort</h2>
          <p style={{ fontSize: 15, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>This is not about luxury. It is about the basic conditions needed to learn, grow, and thrive.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {WHY_CARDS.map((c, i) => <WhyCard key={i} card={c} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}
 
function WhyCard({ card, delay }) {
  const ref = useRef();
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{
      background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(148,163,184,0.2)", borderRadius: 18,
      padding: "28px 24px", transition: "all 0.35s",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(35px)",
      transitionDelay: `${delay}ms`, transitionDuration: "0.7s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(59,130,246,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ fontSize: 32, marginBottom: 14 }}>{card.icon}</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>{card.title}</h3>
      <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: 0 }}>{card.desc}</p>
    </div>
  );
}
 
function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  const ref = useRef();
  const visible = useInView(ref);
  const isMobile = useIsMobile();
 
  useEffect(() => {
    const t = setInterval(() => {
      setAnim(false);
      setTimeout(() => { setIdx(i => (i + 1) % QUOTES.length); setAnim(true); }, 350);
    }, 4500);
    return () => clearInterval(t);
  }, []);
 
  return (
    <section style={{
      padding: isMobile ? "64px 1.25rem" : "100px 2rem",
      background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 20% 50%, rgba(96,165,250,0.15) 0%, transparent 60%)",
      }} />
      <div ref={ref} style={{
        maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <div style={{ fontSize: isMobile ? 48 : 64, color: "rgba(147,197,253,0.4)", lineHeight: 1, marginBottom: 4, fontFamily: "Georgia, serif" }}>"</div>
        <blockquote style={{
          fontSize: isMobile ? "1rem" : "clamp(1.1rem, 3vw, 1.5rem)",
          fontFamily: "'Lora', serif", fontStyle: "italic",
          color: "#e0f2fe", lineHeight: 1.75, margin: "0 0 24px",
          opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.35s ease",
        }}>{QUOTES[idx].text}</blockquote>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#7dd3fc", letterSpacing: 1, textTransform: "uppercase",
          opacity: anim ? 1 : 0, transition: "all 0.35s 0.1s ease",
        }}>— {QUOTES[idx].name}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
          {QUOTES.map((_, i) => (
            <button key={i} onClick={() => { setAnim(false); setTimeout(() => { setIdx(i); setAnim(true); }, 300); }} style={{
              width: i === idx ? 24 : 8, height: 8, borderRadius: 4,
              background: i === idx ? "#60a5fa" : "rgba(255,255,255,0.25)",
              border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
 
function Footer() {
  return (
    <footer style={{ padding: "40px 1.25rem", background: "#0f172a", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
        }}>V</div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>Voice of Narula</span>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.8 }}>
        Built collectively by students for a better learning environment.<br />
        <span style={{ fontSize: 11, color: "#475569" }}>Narula Institute of Technology · A Respectful Student Initiative</span>
      </p>
    </footer>
  );
}
 
export default function App() {
  const [supporters, setSupporters] = useState(INITIAL_SUPPORTERS);
 
  useEffect(() => {
    const q = query(collection(db, "supporters"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const firebaseSupporters = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSupporters([...INITIAL_SUPPORTERS, ...firebaseSupporters]);
    });
    return () => unsub();
  }, []);
 
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
 
  const handleSubmit = async (data) => {
    await addDoc(collection(db, "supporters"), {
      name: data.name, dept: data.dept, year: data.year,
      msg: data.msg || "", createdAt: serverTimestamp(),
    });
  };
 
  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
        input, select, textarea, button { -webkit-appearance: none; appearance: none; font-family: inherit; }
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0.35; }
          100% { transform: translateY(-40px) scale(1.5); opacity: 0.1; }
        }
        @keyframes gradientShift { 0% { opacity: 0.8; } 100% { opacity: 1; } }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes counterPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes successBounce {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
 
      <ScrollProgress />
      <Navbar onNav={scrollTo} />
      <PinnedMessage />
      <Hero onNav={scrollTo} supporters={supporters} />
      <SupportForm onSubmit={handleSubmit} />
      <Supporters supporters={supporters} />
      <WhyMatters />
      <QuoteCarousel />
      <Footer />
    </div>
  );
}
