import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const animate = (target, setter, duration = 1800) => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setter(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 600);
    };
    animate(500, setCount1);
    animate(98, setCount2);
    animate(24, setCount3);
  }, []);

  const features = [
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>, title: 'Smart Booking', desc: 'Reserve lecture halls, labs, and meeting rooms instantly. Real-time availability with conflict detection.', color: '#0ab5d6', bg: '#e0faff' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>, title: 'Issue Tracking', desc: 'Report maintenance issues, track resolution progress, and get notified when your ticket is resolved.', color: '#7C3AED', bg: '#F5F3FF' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>, title: 'Live Notifications', desc: 'Stay updated with instant alerts for booking approvals, ticket updates, and campus announcements.', color: '#059669', bg: '#ECFDF5' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>, title: 'Analytics', desc: 'Admins get deep insights on resource utilisation, booking trends, and operational efficiency.', color: '#DC2626', bg: '#FEF2F2' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, title: 'Secure Login', desc: 'Sign in with your SLIIT Microsoft account, Google, or email. Role-based access for students and staff.', color: '#D97706', bg: '#FFFBEB' },
    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{width:'28px',height:'28px'}}><path d="M12 3v1m6.364 1.636l-.707.707M20 12h-1M17.657 17.657l-.707-.707M12 19v1M6.343 17.657l-.707.707M4 12H3M6.343 6.343l-.707-.707"/><circle cx="12" cy="12" r="4"/></svg>, title: 'Dark Mode', desc: 'Comfortable for night owls. Automatically follows your system preference or toggle manually.', color: '#0891B2', bg: '#ECFEFF' },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Sign up with your SLIIT Microsoft account or email in seconds.' },
    { num: '02', title: 'Browse Resources', desc: 'Search available labs, lecture halls, and meeting rooms.' },
    { num: '03', title: 'Book Instantly', desc: 'Reserve your slot and get a QR code confirmation.' },
    { num: '04', title: 'Manage Everything', desc: 'Track bookings, tickets, and notifications from one dashboard.' },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#F8FAFC', color: '#0F172A', overflowX: 'hidden' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.3s ease', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '26px', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#0ab5d6' }}>SmartCampus</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['Features', 'How It Works'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: '14px', fontWeight: 500, color: '#475569', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color='#0ab5d6'} onMouseLeave={e => e.target.style.color='#475569'}>{item}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#0ab5d6', textDecoration: 'none', border: '1.5px solid #63e5ff', background: 'white' }}
            onMouseEnter={e => e.currentTarget.style.background='#e0faff'} onMouseLeave={e => e.currentTarget.style.background='white'}>Sign In</Link>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #0ab5d6, #0a4a57)', boxShadow: '0 4px 12px rgba(10,181,214,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 16px rgba(10,181,214,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(10,181,214,0.3)'; }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 5% 60px', background: 'linear-gradient(160deg, #e0faff 0%, #F8FAFC 50%, #F0FDF4 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,181,214,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>

          {/* Left */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#b1f2ff', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ab5d6' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a4a57' }}>SLIIT Smart Campus Operations</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
              Manage Your<br /><span style={{ color: '#0ab5d6' }}>Campus Life</span><br />Smarter
            </h1>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: 1.7, margin: '0 0 36px', maxWidth: '480px' }}>
              Book resources, report issues, track tickets, and stay connected — all in one powerful platform built for SLIIT students and staff.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ padding: '14px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, color: 'white', textDecoration: 'none', background: 'linear-gradient(135deg, #0ab5d6, #0a4a57)', boxShadow: '0 6px 20px rgba(10,181,214,0.35)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Get Started Free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#how-it-works" style={{ padding: '14px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, color: '#475569', textDecoration: 'none', background: 'white', border: '1.5px solid #E2E8F0' }}>See How It Works</a>
            </div>
            <div style={{ display: 'flex', gap: '36px', marginTop: '48px', flexWrap: 'wrap' }}>
              {[{ value: `${count1}+`, label: 'Students' }, { value: `${count2}%`, label: 'Uptime' }, { value: `${count3}/7`, label: 'Support' }].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0ab5d6' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview Card */}
          <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <div style={{ background: '#1E293B', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {['#EF4444','#F59E0B','#22C55E'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />)}
                <div style={{ flex: 1, background: '#334155', borderRadius: '4px', height: '20px', marginLeft: '8px' }} />
              </div>
              <div style={{ padding: '20px', background: '#F8FAFC' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Dashboard</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[{ label: 'Resources', val: '9', color: '#0ab5d6' }, { label: 'Bookings', val: '3', color: '#059669' }, { label: 'Tickets', val: '1', color: '#D97706' }].map(s => (
                    <div key={s.label} style={{ background: 'white', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'linear-gradient(135deg, #0ab5d6, #2ecff0)', borderRadius: '12px', padding: '16px', color: 'white', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>Good morning,</div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>Welcome back!</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>Administrator</div>
                </div>
                <div style={{ background: 'white', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Recent Bookings</div>
                  {[{ name: 'Computer Lab 01', status: 'APPROVED', color: '#059669', bg: '#DCFCE7' }, { name: 'Main Lecture Hall A', status: 'PENDING', color: '#D97706', bg: '#FEF9C3' }].map(b => (
                    <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '11px', color: '#334155', fontWeight: 500 }}>{b.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: b.color, background: b.bg, padding: '2px 8px', borderRadius: '100px' }}>{b.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating notification cards */}
            <div style={{ position: 'absolute', top: '-16px', right: '-16px', background: 'white', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{width:'18px',height:'18px'}}><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Booking Approved</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Computer Lab 01</div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '-16px', left: '-16px', background: 'white', borderRadius: '14px', padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0faff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0ab5d6" strokeWidth="2" style={{width:'18px',height:'18px'}}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0ab5d6' }}>Ticket #12 Resolved</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Electrical — Lab B</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <div style={{ background: '#1E293B', padding: '32px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {[
            { label: 'Campus Resources', val: '50+' },
            { label: 'Bookings per Month', val: '1,200+' },
            { label: 'Tickets Resolved', val: '99%' },
            { label: 'Avg. Response Time', val: '< 2hrs' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#63e5ff' }}>{stat.val}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 5%', background: '#F8FAFC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0ab5d6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: '0 0 16px' }}>Everything You Need,<br />Nothing You Don't</h2>
            <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>A complete campus management platform designed specifically for SLIIT's operational needs.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {features.map(f => (
              <div key={f.title} style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', transition: 'all 0.25s ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor=f.color; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#E2E8F0'; }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '80px 5%', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0ab5d6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Process</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
            {steps.map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px', background: 'linear-gradient(135deg, #e0faff, #b1f2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #63e5ff' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0ab5d6' }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg, #0c5a6a, #0ab5d6, #2ecff0)', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px' }}>Ready to Manage Your Campus Smarter?</h2>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 36px', lineHeight: 1.6 }}>Join hundreds of SLIIT students and staff already using Smart Campus Hub.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, color: '#0a4a57', textDecoration: 'none', background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/login" style={{ padding: '14px 36px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, color: 'white', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)', background: 'transparent' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '40px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>            
            <span style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Smart Campus</span>
          </div>
          <div style={{ fontSize: '13px' }}>2026 Smart Campus</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ color: '#64748B', textDecoration: 'none', fontSize: '13px' }}
                onMouseEnter={e => e.target.style.color='#94A3B8'} onMouseLeave={e => e.target.style.color='#64748B'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}