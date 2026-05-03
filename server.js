const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stratify';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 }
    },
    { timestamps: true }
);

const projectSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true },
        name: { type: String, required: true, trim: true },
        companyName: String,
        industry: String,
        revenueModel: String,
        valueProposition: String,
        keyPartners: String,
        location: String,
        address: String,
        projectDescription: String,
        targetAudience: String,
        competitiveAdvantage: String,
        initialInvestment: Number,
        annualRevenue: Number,
        annualCosts: Number,
        projectDuration: Number,
        discountRate: Number,
        roi: Number,
        breakeven: Number,
        npv: Number,
        irr: Number,
        score: Number,
        cashflows: [Number],
        aiAnalysisAnswers: [{ question: String, answer: String }],
        date: String
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);

function toPublicUser(userDoc) {
    return {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        createdAt: userDoc.createdAt
    };
}

function toClientProject(projectDoc) {
    return {
        id: projectDoc._id.toString(),
        userId: projectDoc.userId,
        name: projectDoc.name,
        companyName: projectDoc.companyName,
        industry: projectDoc.industry,
        revenueModel: projectDoc.revenueModel,
        valueProposition: projectDoc.valueProposition,
        keyPartners: projectDoc.keyPartners,
        location: projectDoc.location,
        address: projectDoc.address,
        projectDescription: projectDoc.projectDescription,
        targetAudience: projectDoc.targetAudience,
        competitiveAdvantage: projectDoc.competitiveAdvantage,
        initialInvestment: projectDoc.initialInvestment,
        annualRevenue: projectDoc.annualRevenue,
        annualCosts: projectDoc.annualCosts,
        projectDuration: projectDoc.projectDuration,
        discountRate: projectDoc.discountRate,
        roi: projectDoc.roi,
        breakeven: projectDoc.breakeven,
        npv: projectDoc.npv,
        irr: projectDoc.irr,
        score: projectDoc.score,
        cashflows: projectDoc.cashflows || [],
        aiAnalysisAnswers: projectDoc.aiAnalysisAnswers || [],
        date: projectDoc.date || new Date(projectDoc.createdAt).toLocaleDateString('fr-FR'),
        createdAt: projectDoc.createdAt
    };
}

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caracteres.' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'Cet email est deja utilise.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword });
        return res.status(201).json(toPublicUser(user));
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Cet email est deja utilise.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Donnees invalides.' });
        }
        return res.status(500).json({ message: 'Erreur serveur lors de l inscription.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        if (!normalizedEmail.includes('@')) {
            return res.status(400).json({ message: 'Email invalide.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        return res.json(toPublicUser(user));
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
});

app.get('/api/projects/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project.find({ userId }).sort({ createdAt: -1 });
        return res.json(projects.map(toClientProject));
    } catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ message: 'Erreur lors du chargement des projets.' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        if (!req.body.userId || !req.body.name) {
            return res.status(400).json({ message: 'userId et name sont requis.' });
        }

        const project = await Project.create(req.body);
        return res.status(201).json(toClientProject(project));
    } catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({ message: 'Erreur lors de la creation du projet.' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Project.findByIdAndDelete(id);
        return res.json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ message: 'Erreur lors de la suppression du projet.' });
    }
});

app.delete('/api/projects/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await Project.deleteMany({ userId });
        return res.json({ success: true });
    } catch (error) {
        console.error('Clear projects error:', error);
        return res.status(500).json({ message: 'Erreur lors de la suppression des projets.' });
    }
});

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} est deja utilise. Essayez de fermer l'autre instance ou changez le port.`);
            } else {
                console.error('Erreur serveur:', err);
            }
            process.exit(1);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    });
