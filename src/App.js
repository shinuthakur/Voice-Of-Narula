import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

import { useState, useEffect, useRef } from "react";
 
const DEPARTMENTS = ["CSE","ECE","ME","CE","EE","IT","MBA","BBA","BCA","MCA","Other"];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year","PG"];
 // eslint-disable-next-line no-unused-vars
const INITIAL_SUPPORTERS = [
  { name: "Priya Sharma", dept: "CSE", year: "3rd Year", msg: "We deserve a dignified learning environment. Please turn on the ACs." },
  { name: "Arjun Mehta", dept: "ECE", year: "2nd Year", msg: "Concentrating in 42°C heat is simply impossible." },
  { name: "Sneha Roy", dept: "MBA", year: "1st Year", msg: "Student wellbeing must be a priority. Respectfully requesting action." },
  { name: "Rahul Das", dept: "ME", year: "4th Year", msg: "The infrastructure exists — please use it." },
  { name: "Anika Gupta", dept: "IT", year: "2nd Year", msg: "Health and learning go hand in hand." },
  { name: "Tanmay Sen", dept: "CE", year: "3rd Year", msg: "Every student deserves comfort while pursuing their future." },
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
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return visible;
}
 
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
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
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
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
        height: "100%",
        width: `${prog}%`,
        background: "linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)",
        transition: "width 0.1s ease",
        boxShadow: "0 0 8px rgba(96,165,250,0.8)",
      }} />
    </div>
  );
}
 
function Navbar({ onNav }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 3, left: 0, right: 0, zIndex: 1000,
      padding: "0 2rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64,
      background: scrolled ? "rgba(255,255,255,0.82)" : "transparent",
      backdropFilter: scrolled ? "blur(18px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(148,163,184,0.2)" : "none",
      transition: "all 0.4s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNav("hero")}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: -0.5,
        }}>V</div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "#0f172a", letterSpacing: -0.3 }}>Voice of Narula</span>
      </div>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {[["Home","hero"],["Support","form"],["Student Voices","supporters"],["Why This Matters","why"]].map(([label, id]) => (
          <button key={id} onClick={() => onNav(id)} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 500, color: "#475569",
            fontFamily: "inherit",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#2563eb"}
            onMouseLeave={e => e.target.style.color = "#475569"}
          >{label}</button>
        ))}
        <button onClick={() => onNav("form")} style={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff", border: "none", borderRadius: 8,
          padding: "8px 18px", fontSize: 13, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
          boxShadow: "0 2px 12px rgba(59,130,246,0.35)",
        }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; e.target.style.boxShadow = "0 4px 18px rgba(59,130,246,0.5)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 2px 12px rgba(59,130,246,0.35)"; }}
        >Add My Support</button>
      </div>
    </nav>
  );
}
 
function PinnedMessage() {
  const [expanded, setExpanded] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const SHORT = `We respectfully bring to your attention the difficulties being faced due to extreme heat conditions. While the college infrastructure has recently been upgraded with air conditioning units, the facilities are yet to be made operational...`;
  return (
    <section style={{
      padding: "28px 2rem 0",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)",
      paddingTop: 88,
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          border: "1.5px solid rgba(59,130,246,0.28)",
          borderLeft: "5px solid #2563eb",
          borderRadius: 18,
          padding: "28px 32px",
          boxShadow: "0 8px 40px rgba(59,130,246,0.10)",
          position: "relative",
          animation: "successBounce 0.7s cubic-bezier(0.22,1,0.36,1)",
        }}>
          {/* PIN badge */}
          <div style={{
            position: "absolute", top: -13, left: 24,
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            color: "#fff", fontSize: 11, fontWeight: 700,
            borderRadius: 100, padding: "4px 14px", letterSpacing: 1.2,
            textTransform: "uppercase", boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 13 }}>📌</span> Pinned · Official Statement
          </div>
 
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginTop: 8 }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: "linear-gradient(135deg,#2563eb,#60a5fa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 20, color: "#fff",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              fontFamily: "'Playfair Display',serif",
            }}>ST</div>
 
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: 17, color: "#0f172a" }}>Shivam Thakur</span>
                <span style={{
                  background: "rgba(37,99,235,0.1)", color: "#2563eb",
                  fontSize: 11, fontWeight: 700, borderRadius: 100,
                  padding: "3px 10px", letterSpacing: 0.5,
                }}>Movement Leader</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>On behalf of all students · Narula Institute of Technology</div>
 
              <div style={{
                fontSize: 14.5, color: "#334155", lineHeight: 1.82,
                fontFamily: "'Lora',serif",
                maxHeight: expanded ? "none" : 72,
                overflow: "hidden",
                position: "relative",
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
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 40,
                  background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.92))",
                }} />}
              </div>
 
              <button onClick={() => setExpanded(e => !e)} style={{
                marginTop: 12, background: "none", border: "none",
                color: "#2563eb", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", padding: 0,
                display: "flex", alignItems: "center", gap: 4,
                transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                {expanded ? "Show less ↑" : "Read full statement ↓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 
function Hero({ onNav }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  const count = useCountUp(1284, 2200);
  return (
    <section id="hero" style={{
      minHeight: "100vh", position: "relative", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 30%, #e0f2fe 60%, #f0f9ff 100%)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(96,165,250,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(147,197,253,0.14) 0%, transparent 60%)",
        animation: "gradientShift 8s ease-in-out infinite alternate",
      }} />
      <Particles />
      <div style={{
        position: "relative", zIndex: 2, textAlign: "center",
        maxWidth: 820, padding: "0 2rem",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 28,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", letterSpacing: 0.3 }}>Student-Led Movement · Active Now</span>
        </div>
 
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(3rem, 8vw, 5.5rem)",
          fontWeight: 900, lineHeight: 1.08,
          color: "#0f172a", margin: "0 0 20px",
          letterSpacing: -2,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(25px)",
          transition: "all 0.8s 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          Voice of <span style={{ background: "linear-gradient(135deg, #3b82f6, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Narula</span>
        </h1>
 
        <p style={{
          fontSize: 18, fontWeight: 500, color: "#475569", marginBottom: 12,
          fontFamily: "'Lora', serif", fontStyle: "italic",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>A collective student initiative for a better learning environment.</p>
 
        <p style={{
          fontSize: 16, color: "#64748b", maxWidth: 560, margin: "0 auto 40px",
          lineHeight: 1.75,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          Students of Narula Institute of Technology are respectfully requesting the activation of classroom air conditioning facilities during extreme heatwave conditions — for a healthier, more productive academic environment.
        </p>
 
        <div style={{
          display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 60,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <button onClick={() => onNav("form")} style={{
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "15px 32px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", transition: "all 0.25s",
            boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
            fontFamily: "inherit", letterSpacing: 0.2,
          }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px) scale(1.03)"; e.target.style.boxShadow = "0 8px 28px rgba(59,130,246,0.55)"; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 4px 20px rgba(59,130,246,0.4)"; }}
          >Support the Movement</button>
          <button onClick={() => onNav("supporters")} style={{
            background: "rgba(255,255,255,0.8)", color: "#1e40af",
            border: "1.5px solid rgba(59,130,246,0.35)", borderRadius: 12,
            padding: "15px 32px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", transition: "all 0.25s", backdropFilter: "blur(8px)",
            fontFamily: "inherit", letterSpacing: 0.2,
          }}
            onMouseEnter={e => { e.target.style.background = "rgba(239,246,255,0.95)"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.8)"; e.target.style.transform = "none"; }}
          >View Student Voices</button>
        </div>
 
        {/* Counter */}
        <div style={{
          opacity: visible ? 1 : 0,
          transition: "all 0.8s 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 20, padding: "24px 48px",
            boxShadow: "0 8px 40px rgba(59,130,246,0.12)",
          }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{
                position: "absolute", inset: -12, borderRadius: "50%",
                background: "rgba(59,130,246,0.12)", animation: "counterPulse 2.5s ease-in-out infinite",
              }} />
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 48, fontWeight: 900, color: "#2563eb", lineHeight: 1,
                letterSpacing: -2, position: "relative",
              }}>{count.toLocaleString()}</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginTop: 8 }}>Students Supporting</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Growing every minute.</div>
          </div>
        </div>
      </div>
 
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        animation: "bounce 2s ease-in-out infinite",
        opacity: 0.5,
      }}>
        <div style={{ width: 24, height: 36, border: "2px solid #94a3b8", borderRadius: 12, display: "flex", justifyContent: "center", paddingTop: 6 }}>
          <div style={{ width: 4, height: 8, background: "#94a3b8", borderRadius: 2, animation: "scrollDot 2s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}
 
function SupportForm({ onSubmit }) {
  const ref = useRef();
  const visible = useInView(ref);
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
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSuccess(true);
    onSubmit({ ...form, id: Date.now() });
    setForm({ name: "", dept: "", year: "", msg: "" });
  };
 
  const inputStyle = (field) => ({
    width: "100%", boxSizing: "border-box",
    padding: "14px 16px", fontSize: 15,
    background: focused[field] ? "rgba(239,246,255,0.8)" : "rgba(248,250,252,0.8)",
    border: errors[field] ? "1.5px solid #f87171" : focused[field] ? "1.5px solid #3b82f6" : "1.5px solid rgba(148,163,184,0.3)",
    borderRadius: 10, outline: "none", fontFamily: "inherit",
    color: "#0f172a", transition: "all 0.25s",
    boxShadow: focused[field] ? "0 0 0 4px rgba(59,130,246,0.1)" : "none",
  });
 
  return (
    <section id="form" style={{ padding: "100px 2rem", background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)" }}>
      <div ref={ref} style={{
        maxWidth: 580, margin: "0 auto",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Join the Movement</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: "0 0 14px", letterSpacing: -1 }}>Add Your Voice</h2>
          <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>Your support strengthens this respectful collective request. Together, we are louder.</p>
        </div>
 
        {success ? (
          <div style={{
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(34,197,94,0.3)", borderRadius: 20,
            padding: "64px 48px", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            animation: "successBounce 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>✨</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>Voice Added!</div>
            <div style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7 }}>Your voice has been added to the movement. Thank you for standing with your fellow students.</div>
            <button onClick={() => setSuccess(false)} style={{
              marginTop: 28, background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Add Another Support</button>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(148,163,184,0.2)", borderRadius: 20,
            padding: "44px 44px", boxShadow: "0 20px 60px rgba(59,130,246,0.08)",
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full Name *</label>
              <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}
                onFocus={() => setFocused(f => ({ ...f, name: true }))} onBlur={() => setFocused(f => ({ ...f, name: false }))}
                placeholder="Your full name" style={inputStyle("name")} />
              {errors.name && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.name}</div>}
            </div>
 
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Department *</label>
                <select value={form.dept} onChange={e => { setForm(f => ({ ...f, dept: e.target.value })); setErrors(er => ({ ...er, dept: "" })); }}
                  onFocus={() => setFocused(f => ({ ...f, dept: true }))} onBlur={() => setFocused(f => ({ ...f, dept: false }))}
                  style={{ ...inputStyle("dept"), appearance: "none", cursor: "pointer" }}>
                  <option value="">Select dept.</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.dept && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.dept}</div>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Year *</label>
                <select value={form.year} onChange={e => { setForm(f => ({ ...f, year: e.target.value })); setErrors(er => ({ ...er, year: "" })); }}
                  onFocus={() => setFocused(f => ({ ...f, year: true }))} onBlur={() => setFocused(f => ({ ...f, year: false }))}
                  style={{ ...inputStyle("year"), appearance: "none", cursor: "pointer" }}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{errors.year}</div>}
              </div>
            </div>
 
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Your Message <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
              <textarea value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))}
                onFocus={() => setFocused(f => ({ ...f, msg: true }))} onBlur={() => setFocused(f => ({ ...f, msg: false }))}
                placeholder="Share why this matters to you..." rows={3}
                style={{ ...inputStyle("msg"), resize: "vertical", lineHeight: 1.6 }} />
            </div>
 
            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", padding: "16px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.25s", fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 28px rgba(59,130,246,0.5)"; } }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 4px 20px rgba(59,130,246,0.35)"; }}
            >
              {loading ? (
                <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Adding your voice...</>
              ) : "Add My Support ✦"}
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
      background: "rgba(255,255,255,0.82)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(148,163,184,0.2)", borderRadius: 16,
      padding: "22px 24px", transition: "all 0.3s",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transitionDelay: `${delay}ms`, transitionDuration: "0.7s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(59,130,246,0.12)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: s.msg ? 14 : 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 15, color, flexShrink: 0, border: `1px solid ${color}28`,
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{s.name}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.dept} · {s.year}</div>
        </div>
      </div>
      {s.msg && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.65, margin: 0, fontStyle: "italic", borderLeft: `3px solid ${color}40`, paddingLeft: 12 }}>"{s.msg}"</p>}
    </div>
  );
}
 
function Supporters({ supporters }) {
  const ref = useRef();
  const visible = useInView(ref);
  return (
    <section id="supporters" style={{ padding: "100px 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref} style={{
          textAlign: "center", marginBottom: 56,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Student Voices</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: "0 0 14px", letterSpacing: -1 }}>Hear From Your Peers</h2>
          <p style={{ fontSize: 16, color: "#64748b" }}>Real students. Real concerns. One unified, respectful voice.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {supporters.map((s, i) => <SupporterCard key={s.id || i} s={s} delay={i * 80} />)}
        </div>
      </div>
    </section>
  );
}
 
function WhyMatters() {
  const ref = useRef();
  const visible = useInView(ref);
  return (
    <section id="why" style={{ padding: "100px 2rem", background: "linear-gradient(180deg, #eff6ff 0%, #f0f9ff 100%)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div ref={ref} style={{
          textAlign: "center", marginBottom: 60,
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Why This Matters</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 900, color: "#0f172a", margin: "0 0 14px", letterSpacing: -1 }}>The Case for Comfort</h2>
          <p style={{ fontSize: 16, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>This is not about luxury. It is about the basic conditions needed to learn, grow, and thrive.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
          {WHY_CARDS.map((c, i) => (
            <WhyCard key={i} card={c} delay={i * 100} />
          ))}
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
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(148,163,184,0.2)", borderRadius: 18,
      padding: "32px 28px", transition: "all 0.35s",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(35px)",
      transitionDelay: `${delay}ms`, transitionDuration: "0.7s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(59,130,246,0.12)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)"; }}
    >
      <div style={{ fontSize: 36, marginBottom: 18 }}>{card.icon}</div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10, lineHeight: 1.3 }}>{card.title}</h3>
      <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: 0 }}>{card.desc}</p>
    </div>
  );
}
 
function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  const ref = useRef();
  const visible = useInView(ref);
 
  useEffect(() => {
    const t = setInterval(() => {
      setAnim(false);
      setTimeout(() => { setIdx(i => (i + 1) % QUOTES.length); setAnim(true); }, 350);
    }, 4500);
    return () => clearInterval(t);
  }, []);
 
  return (
    <section style={{
      padding: "100px 2rem",
      background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 70% 70% at 20% 50%, rgba(96,165,250,0.15) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 30%, rgba(147,197,253,0.1) 0%, transparent 50%)",
      }} />
      <div ref={ref} style={{
        maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}>
        <div style={{ fontSize: 64, color: "rgba(147,197,253,0.4)", lineHeight: 1, marginBottom: 8, fontFamily: "Georgia, serif" }}>"</div>
        <blockquote style={{
          fontSize: "clamp(1.15rem, 3vw, 1.5rem)",
          fontFamily: "'Lora', serif", fontStyle: "italic",
          color: "#e0f2fe", lineHeight: 1.7, margin: "0 0 32px",
          opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.35s ease",
        }}>{QUOTES[idx].text}</blockquote>
        <div style={{
          fontSize: 13, fontWeight: 600, color: "#7dd3fc", letterSpacing: 1, textTransform: "uppercase",
          opacity: anim ? 1 : 0, transition: "all 0.35s 0.1s ease",
        }}>— {QUOTES[idx].name}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 40 }}>
          {QUOTES.map((_, i) => (
            <button key={i} onClick={() => { setAnim(false); setTimeout(() => { setIdx(i); setAnim(true); }, 300); }} style={{
              width: i === idx ? 28 : 8, height: 8, borderRadius: 4,
              background: i === idx ? "#60a5fa" : "rgba(255,255,255,0.25)",
              border: "none", cursor: "pointer", transition: "all 0.35s",
              padding: 0,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}
 
function Footer() {
  return (
    <footer style={{
      padding: "48px 2rem",
      background: "#0f172a",
      textAlign: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color: "#fff",
        }}>V</div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>Voice of Narula</span>
      </div>
      <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.7 }}>Built collectively by students for a better learning environment.<br />
        <span style={{ fontSize: 12, color: "#475569" }}>Narula Institute of Technology · A Respectful Student Initiative</span>
      </p>
    </footer>
  );
}
 
export default function App() {
  const [supporters, setSupporters] = useState([]);

  // Real-time listener — auto-updates when anyone submits
  useEffect(() => {
    const q = query(
      collection(db, "supporters"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSupporters(data);
    });
    return () => unsub(); // cleanup on unmount
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // This saves to Firestore
  const handleSubmit = async (data) => {
    try {
      await addDoc(collection(db, "supporters"), {
        name: data.name,
        dept: data.dept,
        year: data.year,
        msg: data.msg || "",
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error saving support:", err);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0.35; }
          100% { transform: translateY(-40px) scale(1.5); opacity: 0.1; }
        }
        @keyframes gradientShift {
          0% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        @keyframes counterPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.3; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(10px); }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes successBounce {
          0% { transform: scale(0.9); opacity: 0; }
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
