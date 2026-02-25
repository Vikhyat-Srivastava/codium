/**
 * data.js — SmartSociety Central Data Store
 * Single source of truth for societies & announcements.
 * All pages read/write through this module via localStorage.
 */

const DB_KEY_SOCIETIES     = 'ss_societies';
const DB_KEY_ANNOUNCEMENTS = 'ss_announcements';
const DB_KEY_SESSION       = 'ss_session';
const DB_KEY_PROFILE       = 'ss_profile';
const DB_KEY_PROFILE       = 'ss_profile';

// ─── DEFAULT SEED DATA ────────────────────────────────────────────────────────

const DEFAULT_SOCIETIES = [
  {
    id: 1, name: 'Nebula', category: 'Technical', icon: '🚀',
    description: 'Innovation & emerging technologies. Building the future one project at a time.',
    roles: ['Project Lead', 'AI Researcher', 'Developer', 'Designer'],
    skills: ['Python', 'Machine Learning', 'React', 'Cloud'],
    about: 'We build real-world tech products — from AI tools to SaaS apps. Members work in cross-functional teams on semester-long projects.',
    keywords: ['ai', 'ml', 'innovation', 'tech', 'project', 'startup'],
  },
  {
    id: 2, name: 'Binary Club', category: 'Technical', icon: '💻',
    description: 'Competitive coding community. DSA, hackathons, and inter-college contests.',
    roles: ['Competitive Coder', 'Mentor', 'Contest Organizer'],
    skills: ['C++', 'Data Structures', 'Algorithms', 'Problem Solving'],
    about: 'We compete at Codeforces, LeetCode, and inter-college hackathons. Weekly practice sessions and mock contests for all levels.',
    keywords: ['coding', 'dsa', 'competitive', 'hackathon', 'algorithms', 'leetcode'],
  },
  {
    id: 3, name: 'CSSS', category: 'Technical', icon: '🎓',
    description: 'Computer Science Student Society — workshops, seminars, and career events.',
    roles: ['Event Coordinator', 'Speaker Liaison', 'Content Writer'],
    skills: ['Communication', 'Event Management', 'Research', 'Networking'],
    about: 'CSSS bridges the gap between academia and industry. We host career talks, company visits, and skill workshops for CS students.',
    keywords: ['career', 'workshop', 'seminar', 'networking', 'placement', 'cs'],
  },
  {
    id: 4, name: 'GFG Student Chapter', category: 'Technical', icon: '📗',
    description: 'GeeksforGeeks campus chapter. Practice problems, mock interviews, and webinars.',
    roles: ['Chapter Lead', 'Content Creator', 'Interview Coach'],
    skills: ['DSA', 'System Design', 'Interview Prep', 'Teaching'],
    about: 'Official GFG campus chapter helping students crack placements at top tech companies through structured DSA prep and mock interviews.',
    keywords: ['gfg', 'interview', 'placement', 'dsa', 'coding', 'practice'],
  },
  {
    id: 5, name: 'IOTUINO', category: 'Technical', icon: '🔌',
    description: 'IoT & hardware innovation. Arduino projects, embedded systems, and robotics.',
    roles: ['Hardware Engineer', 'Embedded Developer', 'Robotics Lead'],
    skills: ['Arduino', 'IoT', 'Embedded C', 'Circuitry', '3D Printing'],
    about: 'We build real hardware — smart sensors, Arduino bots, and IoT systems. Members get hands-on access to our electronics lab.',
    keywords: ['iot', 'arduino', 'hardware', 'robotics', 'electronics', 'embedded'],
  },
  {
    id: 6, name: 'Art Society', category: 'Art & Culture', icon: '🖼️',
    description: 'Creative art exhibitions, live painting events, and collaborative murals.',
    roles: ['Curator', 'Visual Artist', 'Mural Lead', 'Social Media Designer'],
    skills: ['Illustration', 'Painting', 'Digital Art', 'Photoshop', 'Figma'],
    about: 'We celebrate campus creativity through exhibitions, live art jams, and semester murals. Open to all mediums — traditional and digital.',
    keywords: ['art', 'painting', 'design', 'creative', 'illustration', 'visual'],
  },
  {
    id: 7, name: 'Dance X', category: 'Art & Culture', icon: '💃',
    description: 'Contemporary and freestyle dance. Workshops, battles, and annual showcases.',
    roles: ['Choreographer', 'Performer', 'Workshop Instructor', 'Stage Manager'],
    skills: ['Contemporary', 'Hip-hop', 'Freestyle', 'Choreography', 'Stage Presence'],
    about: 'Dance X is the campus hub for modern dance styles. We perform at fests, host battles, and train new dancers through weekly workshops.',
    keywords: ['dance', 'contemporary', 'freestyle', 'performance', 'choreography'],
  },
  {
    id: 8, name: 'Dance Y', category: 'Art & Culture', icon: '🪷',
    description: 'Classical and cultural dance forms. Preserving heritage through movement.',
    roles: ['Classical Dancer', 'Cultural Ambassador', 'Costume Designer'],
    skills: ['Bharatanatyam', 'Kathak', 'Folk Dance', 'Cultural Research'],
    about: 'We preserve and promote classical Indian dance forms. Regular recitals, guru-shishya workshops, and inter-college cultural competitions.',
    keywords: ['dance', 'classical', 'cultural', 'heritage', 'bharatanatyam', 'folk'],
  },
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1, societyId: 1, society: 'Nebula', category: 'Technical',
    title: 'AI & ML Workshop — This Saturday',
    message: 'Join us for a hands-on AI & Machine Learning workshop this Saturday at 4 PM in Lab 302. Covering neural networks, model training, and real-world applications. Bring your laptop.',
    date: '2026-02-28', time: '4:00 PM', location: 'Lab 302',
    dotColor: 'accent',
  },
  {
    id: 2, societyId: 2, society: 'Binary Club', category: 'Technical',
    title: 'Competitive Coding Contest — Next Week',
    message: 'Our monthly competitive coding contest is happening next Friday. Register by Wednesday to secure your spot. Problems range from beginner to advanced. Top 3 win certificates.',
    date: '2026-03-06', time: '2:00 PM', location: 'Online (CodeChef)',
    dotColor: 'purple',
  },
  {
    id: 3, societyId: 7, society: 'Dance X', category: 'Art & Culture',
    title: 'Annual Dance Showcase — Registrations Open',
    message: 'Registrations are now open for the Annual Dance Showcase 2026. Solo and group entries welcome in contemporary, hip-hop, and fusion categories. Last date: March 10.',
    date: '2026-03-20', time: '6:00 PM', location: 'Main Auditorium',
    dotColor: 'pink',
  },
  {
    id: 4, societyId: 3, society: 'CSSS', category: 'Technical',
    title: 'Career Talk: SDE Roles at Top Product Companies',
    message: 'Industry veterans from top product-based companies will share insights on cracking placements, SDE interview processes, and building your profile. Open to all students.',
    date: '2026-03-03', time: '11:00 AM', location: 'Seminar Hall B',
    dotColor: 'accent',
  },
  {
    id: 5, societyId: 5, society: 'IOTUINO', category: 'Technical',
    title: 'IoT Hardware Hackathon — Team Registrations',
    message: 'Form a team of 2–4 and register for the IoT Hardware Hackathon. Build a working prototype in 24 hours. Hardware kits provided. Mentors available throughout.',
    date: '2026-03-15', time: '9:00 AM', location: 'Innovation Lab',
    dotColor: 'purple',
  },
];

// ─── MOCK CREDENTIALS ─────────────────────────────────────────────────────────

const CREDENTIALS = {
  student: { username: 'student@university.edu', password: 'student123', role: 'student', name: 'Alex Student' },
  admin:   { username: 'admin@university.edu',   password: 'admin123',   role: 'admin',   name: 'Admin User' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

const DB = {

  /* ── Societies ── */
  getSocieties() {
    return load(DB_KEY_SOCIETIES, DEFAULT_SOCIETIES);
  },

  /* ── Announcements ── */
  getAnnouncements() {
    return load(DB_KEY_ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
  },

  addAnnouncement(data) {
    const list = this.getAnnouncements();
    const societies = this.getSocieties();
    const society = societies.find(s => s.name === data.society);
    const entry = {
      id: nextId(list),
      societyId: society ? society.id : null,
      society: data.society,
      category: society ? society.category : 'Technical',
      title: data.title,
      message: data.message,
      date: data.date,
      time: data.time || '',
      location: data.location || '',
      dotColor: society?.category === 'Art & Culture' ? 'pink' : 'accent',
    };
    list.unshift(entry);
    save(DB_KEY_ANNOUNCEMENTS, list);
    return entry;
  },

  updateAnnouncement(id, data) {
    const list = this.getAnnouncements();
    const idx = list.findIndex(a => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data };
    save(DB_KEY_ANNOUNCEMENTS, list);
    return list[idx];
  },

  deleteAnnouncement(id) {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    save(DB_KEY_ANNOUNCEMENTS, list);
  },

  /* ── Auth ── */
  login(username, password, role) {
    const cred = CREDENTIALS[role];
    if (cred && cred.username === username && cred.password === password) {
      const session = { role: cred.role, name: cred.name, loggedIn: true };
      save(DB_KEY_SESSION, session);
      return session;
    }
    return null;
  },

  logout() {
    localStorage.removeItem(DB_KEY_SESSION);
  },

  getSession() {
    return load(DB_KEY_SESSION, null);
  },

  isAdmin() {
    const s = this.getSession();
    return s && s.loggedIn && s.role === 'admin';
  },

  isLoggedIn() {
    const s = this.getSession();
    return s && s.loggedIn;
  },
};

// Expose globally
window.DB = DB;

// ─── PROFILE & RECOMMENDATION EXTENSION ──────────────────────────────────────

Object.assign(DB, {

  /* ── User Profile (interests, skills, role preference) ── */
  saveProfile(profileData) {
    save(DB_KEY_PROFILE, profileData);
  },

  getProfile() {
    return load(DB_KEY_PROFILE, null);
  },

  hasProfile() {
    return !!load(DB_KEY_PROFILE, null);
  },

  clearProfile() {
    localStorage.removeItem(DB_KEY_PROFILE);
  },

  /* ── Recommendation Engine ── */
  getRecommendations(profile) {
    const societies = this.getSocieties();
    if (!profile) return societies.map(s => ({ ...s, score: 0, matchReasons: [] }));

    const interests = (profile.interests || []).map(i => i.toLowerCase());
    const skills    = (profile.skills    || []).map(s => s.toLowerCase());
    const roleGoals = (profile.roleGoals || []).map(r => r.toLowerCase());

    return societies.map(society => {
      let score = 0;
      const matchReasons = [];

      // Category match (+5)
      if (interests.some(i => society.category.toLowerCase().includes(i))) {
        score += 5;
        matchReasons.push({ type: 'category', label: society.category });
      }

      // Keyword match (+3 each, max 3 per society)
      const haystack = [
        society.name, society.description,
        ...(society.keywords || []),
      ].join(' ').toLowerCase();

      let kwMatches = 0;
      interests.forEach(interest => {
        if (kwMatches < 3 && haystack.includes(interest)) {
          score += 3; kwMatches++;
          matchReasons.push({ type: 'interest', label: interest });
        }
      });

      // Skill match (+4 each)
      (society.skills || []).forEach(sk => {
        if (skills.some(userSk => sk.toLowerCase().includes(userSk) || userSk.includes(sk.toLowerCase()))) {
          score += 4;
          matchReasons.push({ type: 'skill', label: sk });
        }
      });

      // Role match (+4 each)
      (society.roles || []).forEach(role => {
        if (roleGoals.some(rg => role.toLowerCase().includes(rg) || rg.includes(role.toLowerCase().split(' ')[0]))) {
          score += 4;
          matchReasons.push({ type: 'role', label: role });
        }
      });

      return { ...society, score, matchReasons };
    }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  },
});
