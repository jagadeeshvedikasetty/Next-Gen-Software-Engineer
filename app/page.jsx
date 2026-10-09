"use client";
import { useState, useEffect } from 'react';
import { FaGithub, FaExternalLinkAlt, FaCode, FaSun, FaMoon, FaLaptopCode, FaMobileAlt, FaChartLine, FaHtml5, FaCss3Alt, FaReact } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';


// Custom Typewriter component (Per-Word)
const TypewriterText = ({ texts, typingDelay = 150, erasingDelay = 100, newTextDelay = 2000 }) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!texts || texts.length === 0) return;
    let timeout;
    const currentFullText = texts[textIndex] || '';
    const words = currentFullText.split(' ');
    const currentWords = currentText.trim() === '' ? [] : currentText.trim().split(' ');
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward (add next word)
        if (currentWords.length < words.length) {
          const nextWord = words[currentWords.length];
          setCurrentText((prev) => prev === '' ? nextWord : prev + ' ' + nextWord);
          timeout = setTimeout(handleTyping, typingDelay);
        } else {
          // Pause at end before deleting
          timeout = setTimeout(() => setIsDeleting(true), newTextDelay);
        }
      } else {
        // Clear all at once
        setCurrentText('');
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
        
        // Brief pause before starting the next quote
        timeout = setTimeout(handleTyping, 500);
      }
    };
    
    timeout = setTimeout(handleTyping, 200);
    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, textIndex, texts, typingDelay, erasingDelay, newTextDelay]);

  return <span>{currentText}<span className="blink-cursor"></span></span>;
};



export default function Home() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLightMode, setIsLightMode] = useState(true);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);

  const techDescriptions = {
    HTML: "The structural backbone of the web. It is absolutely essential for creating accessible, semantically correct layouts that search engines and browsers can reliably parse.",
    CSS: "The styling engine. Critical for transforming raw structures into responsive, beautiful, and intuitive user interfaces that engage users.",
    'REACT JS': "A powerful declarative UI library. It allows us to build complex, highly interactive, and state-driven web applications efficiently through modular components."
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsLightMode(false);
      document.documentElement.classList.remove('light-theme');
    } else {
      setIsLightMode(true);
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
      setIsLightMode(false);
    } else {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
      setIsLightMode(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, projRes, techRes] = await Promise.all([
          supabase.from('profile').select('*').limit(1).single(),
          supabase.from('projects').select('*'),
          supabase.from('tech').select('*')
        ]);
        
        if (profRes.data) setProfile(profRes.data);
        setProjects(projRes.data || []);
        if (techRes.data && techRes.data.length > 0) {
          setTechStack(techRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert([contactForm]);
      if (error) throw error;
      
      // Send push notification to phone via ntfy.sh
      await fetch('https://ntfy.sh/JagadeeshPortfolioLeads', {
        method: 'POST',
        body: `Name: ${contactForm.name}\nEmail: ${contactForm.email}\nMessage: ${contactForm.message}`,
        headers: {
          'Title': 'New Lead from Portfolio!',
          'Priority': 'urgent',
          'Tags': 'briefcase,bell'
        }
      });
      
      alert("Message sent! I will get back to you shortly.");
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 className="text-gradient" style={{ letterSpacing: '8px' }}>
          INITIALIZING...<span className="blink-cursor"></span>
        </h1>
      </div>
    );
  }

  // Animation variants
  const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const scaleUp = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

  const services = [
    { title: 'Web Application Development', desc: 'Custom, high-performance web apps built with modern frameworks like React and Next.js.', icon: <FaLaptopCode /> },
    { title: 'Mobile App Development', desc: 'Cross-platform mobile applications that deliver native-like experiences.', icon: <FaMobileAlt /> },
    { title: 'Digital Growth & SEO', desc: 'Optimized architectures that rank higher, load faster, and convert visitors into customers.', icon: <FaChartLine /> }
  ];

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {isLightMode ? <FaMoon /> : <FaSun />}
      </button>

      {/* Hero Section */}
      <section className="hero">
        <motion.div className="container" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeIn} className="quote-container" style={{ textAlign: 'center', width: '100%', marginBottom: '3rem' }}>
            <h2 style={{ letterSpacing: '4px', opacity: 0.8 }} className="text-gradient">
              {profile?.bio && (
                <TypewriterText 
                  texts={profile.bio.split('|').map(q => q.trim())} 
                  typingDelay={150}
                  erasingDelay={100}
                  newTextDelay={2000}
                />
              )}
            </h2>
          </motion.div>
          {profile?.photo_url && (
            <motion.div variants={scaleUp} className="profile-img-wrapper">
              <img src={profile.photo_url} alt="Profile" className="profile-img" />
            </motion.div>
          )}
          
          <motion.h1 variants={fadeIn} className="text-gradient" style={{ display: 'flex', alignItems: 'center' }}>
            &gt; INITIALIZING AGENT: {profile?.name ? profile.name.toUpperCase() : "AGENT"}
            <span className="blink-cursor"></span>
          </motion.h1>

          <motion.div variants={fadeIn} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <motion.a href="#contact" className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Hire Me
            </motion.a>
            <motion.a href="#projects" className="btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              View Work
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            My <span className="text-gradient">Services</span>
          </motion.h2>
          
          <motion.div className="grid-projects" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {services.map((svc, idx) => (
              <motion.div key={idx} className="glass-card service-card" variants={scaleUp} whileHover={{ y: -10 }}>
                <div className="service-icon">{svc.icon}</div>
                <h3 className="service-title">{svc.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{svc.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            Featured <span className="text-gradient">Case Studies</span>
          </motion.h2>
          
          <motion.div className="grid-projects" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {projects.map(project => (
              <motion.div key={project.id} className="glass-card project-card" variants={fadeIn} whileHover={{ y: -15, transition: { duration: 0.3 } }}>
                <div className="project-img-wrapper">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="project-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                      No Image
                    </div>
                  )}
                </div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>
                  
                  <div className="project-tech">
                    {project.technologies?.map((t, idx) => (
                      <span key={idx} className="tech-tag">{t}</span>
                    ))}
                  </div>

                  <div className="project-links">
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noreferrer" className="project-link">
                        <FaGithub size={18} /> Code
                      </a>
                    )}
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noreferrer" className="project-link">
                        <FaExternalLinkAlt size={18} /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {projects.length === 0 && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No projects added yet.</p>}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="section">
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            Technologies I <span className="text-gradient">Use</span>
          </motion.h2>
          
          <motion.div className="grid-tech" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {techStack.map(tech => (
              <motion.div 
                key={tech.id} 
                className="glass-card tech-card" 
                variants={scaleUp} 
                whileHover={{ y: -10 }}
                onClick={() => setSelectedTech(tech)}
                style={{ cursor: 'pointer' }}
              >
                {tech.iconUrl ? (
                  <img src={tech.iconUrl} alt={tech.name} className="tech-icon" />
                ) : tech.name.toUpperCase().includes('HTML') ? (
                  <FaHtml5 className="tech-icon" style={{ color: '#E34F26' }} />
                ) : tech.name.toUpperCase().includes('CSS') ? (
                  <FaCss3Alt className="tech-icon" style={{ color: '#1572B6' }} />
                ) : tech.name.toUpperCase().includes('REACT') ? (
                  <FaReact className="tech-icon" style={{ color: '#61DAFB' }} />
                ) : (
                  <FaCode className="tech-icon" style={{ color: 'var(--accent-color)' }} />
                )}
                <span className="tech-name">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            Let's <span className="text-gradient">Work Together</span>
          </motion.h2>
          
          <motion.form className="contact-form" onSubmit={handleContactSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <input 
              type="text" 
              placeholder="Your Name" 
              className="form-input" 
              required 
              value={contactForm.name} 
              onChange={e => setContactForm({...contactForm, name: e.target.value})}
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              className="form-input" 
              required 
              value={contactForm.email} 
              onChange={e => setContactForm({...contactForm, email: e.target.value})}
            />
            <textarea 
              placeholder="Tell me about your project..." 
              className="form-input" 
              required 
              value={contactForm.message} 
              onChange={e => setContactForm({...contactForm, message: e.target.value})}
            ></textarea>
            <motion.button type="submit" className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Tech Modal */}
      {selectedTech && (
        <div className="modal-overlay" onClick={() => setSelectedTech(null)}>
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setSelectedTech(null)}>X</button>
            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              &gt; {selectedTech.name.toUpperCase()} INFO
            </h3>
            <p style={{ lineHeight: '1.6' }}>
              {selectedTech.category || "A core technology utilized to ensure robust and scalable digital product delivery."}
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}
