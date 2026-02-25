/**
 * Database Seeder
 * Run: node utils/seeder.js         (from backend/ directory)
 * Run: node utils/seeder.js --clear (to wipe data)
 */

require('dotenv').config({ path: '../.env' });
const mongoose     = require('mongoose');
const connectDB    = require('../config/db');
const User         = require('../models/User');
const Society      = require('../models/Society');
const Announcement = require('../models/Announcement');

const seed = async () => {
  await connectDB();

  const clear = process.argv.includes('--clear');

  if (clear) {
    await User.deleteMany({});
    await Society.deleteMany({});
    await Announcement.deleteMany({});
    console.log('🗑️   Database cleared.');
    process.exit(0);
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    name:      'Admin User',
    email:     'admin@smartsociety.com',
    password:  'Admin@1234',
    role:      'admin',
    interests: ['technical', 'coding'],
  });

  await User.create({
    name:      'Jane Student',
    email:     'student@smartsociety.com',
    password:  'Student@1234',
    role:      'student',
    interests: ['art', 'dance', 'coding'],
  });

  console.log('👤  Users seeded.');

  // ── Societies ──────────────────────────────────────────────────────────────
  const societies = await Society.insertMany([
    {
      name:        'Nebula',
      category:    'technical',
      description: 'Innovation & emerging technologies. Building the future one project at a time.',
      tags:        ['ai', 'ml', 'innovation', 'tech'],
      createdBy:   admin._id,
    },
    {
      name:        'Binary Club',
      category:    'technical',
      description: 'Competitive coding community. DSA, hackathons, and inter-college contests.',
      tags:        ['coding', 'dsa', 'competitive', 'hackathon'],
      createdBy:   admin._id,
    },
    {
      name:        'CSSS',
      category:    'technical',
      description: 'Computer Science Student Society — workshops, seminars, and career events.',
      tags:        ['cs', 'workshop', 'career', 'seminar'],
      createdBy:   admin._id,
    },
    {
      name:        'Dance X',
      category:    'cultural',
      description: 'Contemporary and freestyle dance. Workshops, battles, and annual showcases.',
      tags:        ['dance', 'contemporary', 'freestyle', 'performance'],
      createdBy:   admin._id,
    },
    {
      name:        'Art Society',
      category:    'art',
      description: 'Creative art exhibitions, live painting events, and collaborative murals.',
      tags:        ['art', 'painting', 'exhibition', 'creative'],
      createdBy:   admin._id,
    },
    {
      name:        'GFG Student Chapter',
      category:    'technical',
      description: 'GeeksforGeeks campus chapter. Practice problems, mock interviews, and webinars.',
      tags:        ['gfg', 'coding', 'interview', 'practice'],
      createdBy:   admin._id,
    },
    {
      name:        'IOTUINO',
      category:    'technical',
      description: 'IoT & hardware innovation. Arduino projects, embedded systems, and robotics.',
      tags:        ['iot', 'arduino', 'hardware', 'robotics'],
      createdBy:   admin._id,
    },
    {
      name:        'Dance Y',
      category:    'cultural',
      description: 'Classical and cultural dance forms. Preserving heritage through movement.',
      tags:        ['dance', 'classical', 'cultural', 'heritage'],
      createdBy:   admin._id,
    },
  ]);

  console.log('🏛️   Societies seeded.');

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    {
      society:   societies[0]._id,
      title:     'AI & ML Workshop — This Saturday',
      content:   'Hands-on workshop covering neural networks, model training, and real-world applications. Bring your laptop.',
      location:  'Lab 302',
      eventDate: new Date('2026-02-28'),
      createdBy: admin._id,
    },
    {
      society:   societies[1]._id,
      title:     'Competitive Coding Contest — Next Week',
      content:   'Monthly coding contest. Problems range from beginner to advanced. Top 3 win certificates.',
      location:  'Online (CodeChef)',
      eventDate: new Date('2026-03-06'),
      createdBy: admin._id,
    },
    {
      society:   societies[3]._id,
      title:     'Annual Dance Showcase — Registrations Open',
      content:   'Solo and group entries in contemporary, hip-hop, and fusion categories. Last date: March 10.',
      location:  'Main Auditorium',
      eventDate: new Date('2026-03-20'),
      createdBy: admin._id,
    },
    {
      society:   societies[2]._id,
      title:     'Career Talk: SDE Roles at Top Product Companies',
      content:   'Industry veterans will share insights on cracking placements and SDE interview processes.',
      location:  'Seminar Hall B',
      eventDate: new Date('2026-03-03'),
      createdBy: admin._id,
    },
    {
      society:   societies[6]._id,
      title:     'IoT Hardware Hackathon — Team Registrations',
      content:   'Form a team of 2-4. Build a working prototype in 24 hours. Hardware kits provided.',
      location:  'Innovation Lab',
      eventDate: new Date('2026-03-15'),
      createdBy: admin._id,
    },
  ]);

  console.log('📢  Announcements seeded.');
  console.log('\n✅  Seeding complete!');
  console.log('\n🔑  Demo credentials:');
  console.log('    Admin:   admin@smartsociety.com   / Admin@1234');
  console.log('    Student: student@smartsociety.com / Student@1234');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
});
