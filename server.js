const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: isDevelopment ? '*' : ['https://yourdomain.com'], // Replace with your actual domain
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname), {
  maxAge: isDevelopment ? 0 : '1d',
  etag: true
}));

// Database initialization
const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to the portfolio database.');
});

// Create projects table with enhanced schema
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT,
    technologies TEXT, -- JSON string of technologies array
    liveUrl TEXT,
    githubUrl TEXT,
    featured BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Table creation error:', err.message);
  } else {
    console.log('✅ Projects table ready.');
    initializeProjects();
  }
});

// Initialize with professional project data
function initializeProjects() {
  db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
    if (err) {
      console.error('Error checking projects:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const projects = [
        {
          title: "E-Commerce Platform",
          description: "A full-stack e-commerce solution built with React, Node.js, and MongoDB. Features include user authentication, payment processing with Stripe, inventory management, and an admin dashboard with real-time analytics.",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["React", "Node.js", "MongoDB", "Stripe", "JWT", "Material-UI"]),
          liveUrl: "https://ecommerce-demo.example.com",
          githubUrl: "https://github.com/johndoe/ecommerce-platform",
          featured: 1
        },
        {
          title: "Task Management App",
          description: "A collaborative task management application with real-time updates, drag-and-drop functionality, team collaboration features, and advanced project tracking capabilities.",
          imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["Vue.js", "Express.js", "Socket.io", "PostgreSQL", "Redis", "Docker"]),
          liveUrl: "https://taskmanager-demo.example.com",
          githubUrl: "https://github.com/johndoe/task-manager",
          featured: 1
        },
        {
          title: "Weather Dashboard",
          description: "A responsive weather dashboard that displays current conditions and forecasts using external APIs with beautiful data visualizations, location-based services, and weather alerts.",
          imageUrl: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["JavaScript", "Chart.js", "OpenWeather API", "CSS3", "PWA"]),
          liveUrl: "https://weather-dashboard.example.com",
          githubUrl: "https://github.com/johndoe/weather-dashboard",
          featured: 1
        },
        {
          title: "Social Media Analytics",
          description: "A comprehensive social media analytics platform that tracks engagement metrics, sentiment analysis, and provides detailed reporting for multiple social platforms.",
          imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["Python", "Django", "D3.js", "PostgreSQL", "Celery", "Redis"]),
          liveUrl: "https://analytics-demo.example.com",
          githubUrl: "https://github.com/johndoe/social-analytics",
          featured: 0
        },
        {
          title: "Real Estate Platform",
          description: "A modern real estate platform with property listings, virtual tours, mortgage calculator, and advanced search filters with map integration.",
          imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Mapbox", "Cloudinary"]),
          liveUrl: "https://realestate-demo.example.com",
          githubUrl: "https://github.com/johndoe/real-estate-platform",
          featured: 0
        },
        {
          title: "Learning Management System",
          description: "An interactive learning management system with course creation, progress tracking, quizzes, and video streaming capabilities for online education.",
          imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=200&fit=crop",
          technologies: JSON.stringify(["React", "Node.js", "MongoDB", "AWS S3", "WebRTC", "Socket.io"]),
          liveUrl: "https://lms-demo.example.com",
          githubUrl: "https://github.com/johndoe/learning-management-system",
          featured: 0
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO projects (title, description, imageUrl, technologies, liveUrl, githubUrl, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      projects.forEach(project => {
        stmt.run([
          project.title,
          project.description,
          project.imageUrl,
          project.technologies,
          project.liveUrl,
          project.githubUrl,
          project.featured
        ]);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting projects:', err.message);
        } else {
          console.log('✅ Initial project data inserted successfully.');
        }
      });
    }
  });
}

// API Routes

// Get all projects with optional filtering
app.get('/api/projects', (req, res) => {
  const { featured, limit } = req.query;
  let query = 'SELECT * FROM projects';
  const params = [];

  if (featured === 'true') {
    query += ' WHERE featured = 1';
  }

  query += ' ORDER BY featured DESC, createdAt DESC';

  if (limit && !isNaN(parseInt(limit))) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Parse technologies JSON string back to array
      const projects = rows.map(project => ({
        ...project,
        technologies: project.technologies ? JSON.parse(project.technologies) : []
      }));
      res.json(projects);
    }
  });
});

// Legacy endpoint for backward compatibility
app.get('/projects', (req, res) => {
  res.redirect('/api/projects');
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      const project = {
        ...row,
        technologies: row.technologies ? JSON.parse(row.technologies) : []
      };
      res.json(project);
    }
  });
});

// Create new project (protected endpoint - add authentication in production)
app.post('/api/projects', (req, res) => {
  const { title, description, imageUrl, technologies, liveUrl, githubUrl, featured } = req.body;
  
  // Validation
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const technologiesJson = Array.isArray(technologies) ? JSON.stringify(technologies) : '[]';
  
  db.run(
    `INSERT INTO projects (title, description, imageUrl, technologies, liveUrl, githubUrl, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, imageUrl, technologiesJson, liveUrl, githubUrl, featured || 0],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to create project' });
      } else {
        res.status(201).json({ 
          id: this.lastID,
          message: 'Project created successfully'
        });
      }
    }
  );
});

// Update project (protected endpoint - add authentication in production)
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, technologies, liveUrl, githubUrl, featured } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const technologiesJson = Array.isArray(technologies) ? JSON.stringify(technologies) : '[]';
  
  db.run(
    `UPDATE projects 
     SET title = ?, description = ?, imageUrl = ?, technologies = ?, 
         liveUrl = ?, githubUrl = ?, featured = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, imageUrl, technologiesJson, liveUrl, githubUrl, featured || 0, id],
    function(err) {
      if (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Failed to update project' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Project not found' });
      } else {
        res.json({ message: 'Project updated successfully' });
      }
    }
  );
});

// Delete project (protected endpoint - add authentication in production)
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ error: 'Failed to delete project' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json({ message: 'Project deleted successfully' });
    }
  });
});

// Contact form endpoint (add email service in production)
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // In production, integrate with email service (SendGrid, Mailgun, etc.)
  console.log('📧 Contact form submission:', { name, email, subject, message });
  
  // Simulate processing delay
  setTimeout(() => {
    res.json({ 
      message: 'Message sent successfully! I\'ll get back to you soon.',
      success: true 
    });
  }, 1000);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed.');
    }
    process.exit(0);
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Portfolio server running at http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API endpoints available at /api/*`);
});

module.exports = app;
