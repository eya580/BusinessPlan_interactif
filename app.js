// Platform State Management
let projects = [];
let currentProject = null;
let cashflowChart = null;
let currentUser = null;
let currentStep = 1;
const API_BASE_URL = window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : `${window.location.origin}/api`;

// Localization Configuration
const LOCALE_CONFIG = {
    country: 'Tunisie',
    currency: 'TND',
    currencySymbol: 'DT',
    locale: 'fr-TN',
    timeZone: 'Africa/Tunis'
};

const LOCATION_LABELS = {
    tunis: 'Tunis',
    sfax: 'Sfax',
    sousse: 'Sousse',
    gabes: 'Gabes',
    bizerte: 'Bizerte',
    ariana: 'Ariana',
    gafsa: 'Gafsa',
    monastir: 'Monastir',
    kairouan: 'Kairouan',
    'ben-arous': 'Ben Arous',
    other: 'Autre'
};

const TUNISIA_CITY_COORDS = {
    tunis: { lat: 36.8065, lon: 10.1815 },
    sfax: { lat: 34.7406, lon: 10.7603 },
    sousse: { lat: 35.8256, lon: 10.6084 },
    gabes: { lat: 33.8815, lon: 10.0982 },
    bizerte: { lat: 37.2744, lon: 9.8739 },
    ariana: { lat: 36.8665, lon: 10.1647 },
    gafsa: { lat: 34.425, lon: 8.7842 },
    monastir: { lat: 35.777, lon: 10.8262 },
    kairouan: { lat: 35.6781, lon: 10.0963 },
    'ben-arous': { lat: 36.7531, lon: 10.2189 }
};

// Location Ratings and Suggestions
const LOCATION_RATINGS = {
    tunis: {
        rating: 9.2,
        population: 638845,
        gdp: 8.5,
        tourism: 8.8,
        business: 9.5,
        description: "Capitale économique, centre d'affaires majeur avec forte activité touristique"
    },
    sfax: {
        rating: 8.1,
        population: 330440,
        gdp: 7.2,
        tourism: 6.5,
        business: 8.2,
        description: "Deuxième ville économique, port important et centre industriel"
    },
    sousse: {
        rating: 8.5,
        population: 221530,
        gdp: 6.8,
        tourism: 9.2,
        business: 7.8,
        description: "Destination touristique majeure avec bon potentiel commercial"
    },
    gabes: {
        rating: 7.3,
        population: 116323,
        gdp: 6.2,
        tourism: 6.8,
        business: 7.1,
        description: "Centre pétrochimique avec potentiel de développement touristique"
    },
    bizerte: {
        rating: 7.8,
        population: 142966,
        gdp: 6.5,
        tourism: 7.5,
        business: 7.2,
        description: "Port stratégique avec potentiel touristique et industriel"
    },
    ariana: {
        rating: 8.8,
        population: 114486,
        gdp: 8.2,
        tourism: 7.1,
        business: 9.1,
        description: "Banlieue moderne de Tunis avec forte activité économique"
    },
    gafsa: {
        rating: 6.9,
        population: 95979,
        gdp: 5.8,
        tourism: 6.2,
        business: 6.5,
        description: "Centre minier historique avec potentiel agricole"
    },
    monastir: {
        rating: 8.3,
        population: 104535,
        gdp: 7.1,
        tourism: 8.9,
        business: 7.5,
        description: "Destination touristique avec université et potentiel commercial"
    },
    kairouan: {
        rating: 7.5,
        population: 186653,
        gdp: 6.1,
        tourism: 8.5,
        business: 6.8,
        description: "Ville sainte avec fort potentiel touristique culturel"
    },
    'ben-arous': {
        rating: 8.0,
        population: 146371,
        gdp: 7.5,
        tourism: 7.2,
        business: 8.1,
        description: "Centre économique en croissance avec bon accès à Tunis"
    }
};

// AI Analysis Questions by Sector
const ANALYSIS_QUESTIONS = {
    restauration: [
        {
            question: "Quelle est la capacité optimale de votre établissement en termes de couverts par service?",
            generateAnswer: (data) => {
                const capacity = Math.floor(data.initialInvestment / 300);
                return `Pour un investissement de ${data.initialInvestment.toLocaleString('fr-TN')} DT, une capacité de ${capacity} couverts par service est recommandée. Cela permet d'optimiser les coûts fixes tout en maximisant le revenu par service.`
            }
        },
        {
            question: "Comment structurer votre menu pour maximiser la marge bénéficiaire?",
            generateAnswer: (data) => {
                const margin = ((data.annualRevenue - data.annualCosts) / data.annualRevenue * 100).toFixed(1);
                return `Avec une marge actuelle de ${margin}%, recommandez un menu avec 60% de plats à forte marge (couscous, grillades) et 40% de plats signature. Le prix moyen par couvert devrait être de ${Math.floor(data.annualRevenue / 365 / 50)} DT pour atteindre vos objectifs.`
            }
        },
        {
            question: "Quelle stratégie de sourcing des matières premières garantirait la qualité et la rentabilité?",
            generateAnswer: (data) => {
                return `Adoptez une approche mixte: 70% de fournisseurs locaux (marchés de gros tunisiens) pour la fraîcheur et la réduction des coûts de transport, 30% de fournisseurs spécialisés pour les produits premium. Négociez des contrats à long terme pour stabiliser les coûts qui représentent environ ${Math.floor(data.annualCosts * 0.4).toLocaleString('fr-TN')} DT annuels.`
            }
        },
        {
            question: "Comment optimiser le personnel pour différentes périodes de l'année?",
            generateAnswer: (data) => {
                const staffCost = Math.floor(data.annualCosts * 0.35);
                return `Avec un budget personnel de ${staffCost.toLocaleString('fr-TN')} DT, prévoyez: 1 chef permanent, 2 sous-chefs, 4 commis en base, et un pool de 10 intérimaires pour les pics saisonniers (Ramadan, été). Utilisez un système de plannings prévisionnels basés sur l'historique des réservations.`
            }
        },
        {
            question: "Quels canaux de distribution sont les plus adaptés à votre concept?",
            generateAnswer: (data) => {
                return `Multi-canal recommandé: 50% vente sur place (expérience client), 30% livraison (Yassine Food, Delivery), 20% à emporter. Diversifiez les revenus pour réduire la dépendance à un seul canal et atteindre ${data.annualRevenue.toLocaleString('fr-TN')} DT annuels.`
            }
        },
        {
            question: "Comment optimiser votre gestion des stocks pour minimiser le gaspillage?",
            generateAnswer: (data) => {
                const stockValue = Math.floor(data.annualCosts * 0.15);
                return `Valeur moyenne des stocks: ${stockValue.toLocaleString('fr-TN')} DT. Implémentez un système FIFO, analysez les ventes hebdomadaires pour ajuster les commandes, et utilisez des promotions pour écouler les stocks proches de péremption. Objectif: <5% de gaspillage alimentaire.`
            }
        },
        {
            question: "Quelle stratégie marketing locale serait la plus efficace?",
            generateAnswer: (data) => {
                const marketingBudget = Math.floor(data.annualCosts * 0.08);
                return `Budget marketing: ${marketingBudget.toLocaleString('fr-TN')} DT/an. Focus sur: réseaux sociaux (Facebook/Instagram), partenariats avec influenceurs locaux tunisiens, événements communautaires, et programme de parrainage. Ciblez un rayon de 5km autour de votre établissement.`
            }
        }
    ],
    ecommerce: [
        {
            question: "Quelle stratégie de logistique minimiserait les coûts tout en garantissant la satisfaction client?",
            generateAnswer: (data) => {
                const logisticsCost = Math.floor(data.annualCosts * 0.25);
                return `Budget logistique estimé: ${logisticsCost.toLocaleString('fr-TN')} DT. Adoptez un modèle hybride: stockage local pour 60% des ventes (livraison 24h via TNT Tunisie), fulfilment externe pour 40% (produits encombrants). Négociez des tarifs de volume avec les transporteurs locaux.`
            }
        },
        {
            question: "Comment optimiser le taux de conversion de votre site e-commerce?",
            generateAnswer: (data) => {
                const conversionRate = (data.annualRevenue / (data.annualRevenue * 10) * 100).toFixed(1);
                return `Pour atteindre ${data.annualRevenue.toLocaleString('fr-TN')} DT, visez un taux de conversion de ${conversionRate}%. Optimisez: UX mobile, paiement en ligne (D17, Flouci), temps de chargement <2s, A/B testing des CTA, panier abandonné avec emails de relance.`
            }
        },
        {
            question: "Quelle stratégie de marketing digital générerait le meilleur ROI?",
            generateAnswer: (data) => {
                const marketingBudget = Math.floor(data.annualCosts * 0.15);
                return `Budget marketing: ${marketingBudget.toLocaleString('fr-TN')} DT. Répartition: 40% SEO/Content (long terme), 30% PPC Facebook/Google Ads (ventes immédiates), 20% réseaux sociaux (Instagram, TikTok), 10% email marketing (fidélisation).`
            }
        },
        {
            question: "Comment gérer les retours et réclamations pour minimiser leur impact financier?",
            generateAnswer: (data) => {
                const returnRate = 0.15;
                const returnCost = Math.floor(data.annualRevenue * returnRate * 0.3);
                return `Anticipez un taux de retour de 15% (coût: ${returnCost.toLocaleString('fr-TN')} DT). Implémentez: descriptions détaillées, photos multiples, guide des tailles, politique de retour claire (14 jours), et analyse des motifs de retour pour améliorer les produits.`
            }
        },
        {
            question: "Quelle stratégie de prix maximiserait votre marge et votre volume de ventes?",
            generateAnswer: (data) => {
                const avgOrder = Math.floor(data.annualRevenue / 1000);
                return `Panier moyen cible: ${avgOrder} DT. Stratégie: prix psychologique (9,900 DT), bundling (+15% panier moyen), upselling/cross-selling, promotions saisonnières (soldes d'été, Ramadan). Testez différents points de prix pour trouver l'optimum.`
            }
        },
        {
            question: "Comment optimiser l'expérience utilisateur mobile pour augmenter les conversions?",
            generateAnswer: (data) => {
                return `Optimisez: navigation simplifiée, chargement rapide <3s, paiement one-click (sauvegarde des infos), design responsive. 70% du trafic e-commerce tunisien est mobile. Testez régulièrement avec des utilisateurs locaux.`
            }
        },
        {
            question: "Quelle stratégie de fidélisation client maximisera la LTV?",
            generateAnswer: (data) => {
                const loyaltyBudget = Math.floor(data.annualCosts * 0.05);
                return `Budget fidélisation: ${loyaltyBudget.toLocaleString('fr-TN')} DT. Programme: points par achat, offres exclusives, early access aux ventes, recommandations personnalisées. Ciblez un taux de rétention >60%.`
            }
        }
    ],
    tech: [
        {
            question: "Quelle architecture technique garantirait la scalabilité et la sécurité?",
            generateAnswer: (data) => {
                return `Architecture microservices recommandée: frontend React/Vue, backend Node.js/Python, base de données PostgreSQL + Redis pour le cache. Utilisez AWS/Azure ou des hébergeurs tunisiens (Topnet, GlobalNet) pour l'infrastructure cloud. Budget DevOps: ${Math.floor(data.annualCosts * 0.2).toLocaleString('fr-TN')} DT/an.`
            }
        },
        {
            question: "Comment structurer votre roadmap produit pour maximiser l'adoption?",
            generateAnswer: (data) => {
                return `Roadmap en 3 phases: Phase 1 (MVP, 3 mois) - fonctionnalités core, Phase 2 (6 mois) - intégrations et analytics, Phase 3 (12 mois) - IA et automatisation. Livrez des itérations mensuelles pour maintenir l'engagement.`
            }
        },
        {
            question: "Quelle stratégie de financement est adaptée à votre stade de développement?",
            generateAnswer: (data) => {
                return `Pour un investissement de ${data.initialInvestment.toLocaleString('fr-TN')} DT: Phase 1 - bootstrapping + love money, Phase 2 - business angels tunisiens (100-300K DT), Phase 3 - VC international ou fonds tunisiens (500K-2M DT). Préparez dès maintenant vos KPIs et pitch deck.`
            }
        },
        {
            question: "Comment protéger votre propriété intellectuelle?",
            generateAnswer: (data) => {
                return `Protection multi-niveaux: dépôt de brevet à l'INNORPI (coût: ~5K DT), marques pour l'identité, NDA pour les partenariats, open source pour les composants non-core. Budget IP: ${Math.floor(data.initialInvestment * 0.05).toLocaleString('fr-TN')} DT.`
            }
        },
        {
            question: "Quelle stratégie de recrutement technique assurerait une croissance durable?",
            generateAnswer: (data) => {
                const teamSize = Math.floor(data.annualCosts / 40000);
                return `Objectif: ${teamSize} ingénieurs en 12 mois. Recrutement: 70% local (ISET, Esprit, FSI), 30% remote (talents internationaux). Salaire moyen: 2-4K DT/mois + equity. Investissez dans la culture d'entreprise pour réduire le turnover.`
            }
        },
        {
            question: "Comment valider votre produit sur le marché tunisien avant le lancement?",
            generateAnswer: (data) => {
                return `Conductez: interviews utilisateurs (50+), MVP beta (100 testeurs), landing page pour mesurer l'intérêt, partenariats pilotes avec entreprises locales. Ciblez Tunis, Sfax, Sousse pour les tests initiaux.`
            }
        },
        {
            question: "Quelle stratégie de go-to-market maximisera l'adoption rapide?",
            generateAnswer: (data) => {
                const gtmBudget = Math.floor(data.annualCosts * 0.2);
                return `Budget go-to-market: ${gtmBudget.toLocaleString('fr-TN')} DT. Stratégie: product-led growth, content marketing en arabe/français, partnerships avec incubateurs tunisiens (Startup Hub, Réseau Entreprendre), présence événementielle (DigiTech, Tunisie Digital Summit).`
            }
        }
    ],
    services: [
        {
            question: "Comment standardiser vos services sans perdre en qualité?",
            generateAnswer: (data) => {
                return `Créez des playbooks détaillés pour chaque service, formez vos équipes aux standards, implémentez des checklists de qualité, et utilisez des outils de CRM pour suivre les livrables. Budget formation: ${Math.floor(data.annualCosts * 0.05).toLocaleString('fr-TN')} DT/an.`
            }
        },
        {
            question: "Quelle stratégie de tarification maximiserait votre valeur perçue?",
            generateAnswer: (data) => {
                const hourlyRate = Math.floor(data.annualRevenue / 2000);
                return `Taux horaire recommandé: ${hourlyRate} DT/heure. Modèles: rétention (forfait mensuel), projet (prix fixe), success fee (commission sur résultats). Testez différents modèles avec vos clients les plus fidèles.`
            }
        },
        {
            question: "Comment développer votre clientèle B2B de manière systématique?",
            generateAnswer: (data) => {
                const salesBudget = Math.floor(data.annualCosts * 0.2);
                return `Budget commercial: ${salesBudget.toLocaleString('fr-TN')} DT. Stratégie: LinkedIn outreach, networking événementiel (CCIT, UTICA), partenariats stratégiques, content marketing B2B. Visez 20 nouveaux clients/mois avec un taux de conversion de 5%.`
            }
        },
        {
            question: "Quels indicateurs de performance (KPIs) suivre pour optimiser vos services?",
            generateAnswer: (data) => {
                return `KPIs essentiels: NPS (satisfaction client), taux de rétention (>80%), marge par projet (>30%), temps de livraison, utilisation des ressources. Implémentez un dashboard en temps réel pour piloter l'activité.`
            }
        },
        {
            question: "Comment automatiser les processus répétitifs pour gagner en efficacité?",
            generateAnswer: (data) => {
                return `Automatisez: facturation, reporting, onboarding client, notifications. Utilisez Zapier/Make pour l'intégration d'outils. Gain de temps estimé: 15h/semaine par personne. ROI de l'automatisation: ${Math.floor(data.annualRevenue * 0.1).toLocaleString('fr-TN')} DT/an.`
            }
        },
        {
            question: "Comment développer des partenariats stratégiques en Tunisie?",
            generateAnswer: (data) => {
                return `Ciblez: chambres de commerce (CCIT, UTICA), clusters sectoriels, universités pour le recrutement stagiaires, et entreprises complémentaires. Participez aux événements B2B et maintenez un réseau actif sur LinkedIn.`
            }
        },
        {
            question: "Quelle stratégie de pricing par projet maximisera votre rentabilité?",
            generateAnswer: (data) => {
                const projectMargin = 0.35;
                return `Visez une marge de ${projectMargin * 100}% par projet. Structurez vos prix: frais fixes (setup) + variables (temps) + succès (bonus). Utilisez des cap clauses pour les projets à long terme avec des clients tunisiens.`
            }
        }
    ],
    retail: [
        {
            question: "Comment optimiser l'assortiment de votre point de vente?",
            generateAnswer: (data) => {
                return `Règle 80/20: 20% des produits génèrent 80% du CA. Analysez vos ventes mensuelles, éliminez les produits à rotation lente, augmentez les stocks des best-sellers. Budget stock: ${Math.floor(data.annualCosts * 0.3).toLocaleString('fr-TN')} DT.`
            }
        },
        {
            question: "Quelle stratégie omnicanal maximiserait vos ventes?",
            generateAnswer: (data) => {
                return `Intégrez: click & collect (30% des ventes online), livraison en magasin, inventaire unifié, programme de fidélité cross-canal. Les clients omnicanal dépensent 30% de plus que les clients mono-canal.`
            }
        },
        {
            question: "Comment optimiser votre merchandising pour augmenter le panier moyen?",
            generateAnswer: (data) => {
                const basketSize = Math.floor(data.annualRevenue / 10000);
                return `Panier moyen cible: ${basketSize} DT. Techniques: produits d'impulsion en caisse (+15%), cross-merchandising (produits complémentaires), promotions panier moyen, zones chaudes en début de rayon.`
            }
        },
        {
            question: "Quelle stratégie de localisation est optimale pour votre concept?",
            generateAnswer: (data) => {
                const rentBudget = Math.floor(data.annualCosts * 0.25);
                return `Budget loyer: ${rentBudget.toLocaleString('fr-TN')} DT/an. Ciblez: zones à fort trafic piéton (Avenue Habib Bourguiba, Sfax, Sousse), proximité de vos clients cible, parking disponible. Analysez la concurrence dans un rayon de 500m avant de signer.`
            }
        },
        {
            question: "Comment fidéliser votre clientèle locale?",
            generateAnswer: (data) => {
                return `Programme de fidélité: points par achat, offres exclusives, événements en magasin. Communication: SMS pour les promotions immédiates, email pour les offres personnalisées. Taux de rétention cible: >70%.`
            }
        },
        {
            question: "Comment optimiser votre présence en ligne pour le retail tunisien?",
            generateAnswer: (data) => {
                return `Créez une fiche Google My Business complète, utilisez Facebook/Instagram pour les promotions locales, implémentez un système de réservation en ligne, et collectez des avis clients. 80% des clients tunisiens recherchent les magasins en ligne avant de visiter.`
            }
        },
        {
            question: "Quelle stratégie de merchandising saisonnier maximisera les ventes?",
            generateAnswer: (data) => {
                return `Adaptez votre assortiment: Ramadan (produits alimentaires, vêtements), été (maillots, climatiseurs), rentrée scolaire (fournitures), fêtes (cadeaux). Planifiez 3 mois à l'avance et négociez avec les fournisseurs pour les périodes de forte demande.`
            }
        }
    ],
    other: [
        {
            question: "Quels sont les risques principaux de votre projet et comment les mitiger?",
            generateAnswer: (data) => {
                return `Risques identifiés: financier (cash flow), opérationnel (exécution), marché (concurrence). Mitigation: réserve de trésorerie (6 mois), plan B pour chaque scénario, veille concurrentielle continue. Budget contingence: ${Math.floor(data.initialInvestment * 0.15).toLocaleString('fr-TN')} DT.`
            }
        },
        {
            question: "Comment valider votre modèle économique avant l'investissement complet?",
            generateAnswer: (data) => {
                return `Validation en 3 étapes: MVP minimal (testez avec 50 clients), preuve de marché (100 ventes), scaling. Budget validation: ${Math.floor(data.initialInvestment * 0.1).toLocaleString('fr-TN')} DT. N'investissez pas plus sans validation.`
            }
        },
        {
            question: "Quelle structure juridique est adaptée à votre activité?",
            generateAnswer: (data) => {
                return `Recommandation: Société à Responsabilité Limitée (SARL) pour la flexibilité (capital minimum 1 DT), responsabilité limitée. Alternatives: EURL (activité solo), SA (grandes entreprises). Consultez un avocat ou expert-comptable tunisien pour le choix optimal. Coût création: ~500 DT.`
            }
        },
        {
            question: "Comment structurer votre plan de financement?",
            generateAnswer: (data) => {
                return `Plan de financement: apport personnel (30%), love money (20%), business angels tunisiens (30%), banque/Prêt (20%, BFPME, SICAV). Préparez un business plan détaillé et des projections financières réalistes. Taux d'intérêt cible: <7%.`
            }
        },
        {
            question: "Quels indicateurs suivre pour piloter votre activité?",
            generateAnswer: (data) => {
                return `KPIs essentiels: CA mensuel, marge brute, trésorerie, nombre de clients, coût d'acquisition client, LTV. Revue mensuelle obligatoire pour ajuster la stratégie. Implémentez un outil de gestion dès le début.`
            }
        },
        {
            question: "Comment accéder aux financements publics tunisiens?",
            generateAnswer: (data) => {
                return `Explorez: BFPME (prêts jusqu'à 500K DT), Caisse de Garantie, SICAV (fonds d'investissement), programmes de l'APII, et subventions régionales. Préparez un dossier solide avec projections financières et étude de marché.`
            }
        },
        {
            question: "Quelle stratégie de networking en Tunisie maximisera vos opportunités?",
            generateAnswer: (data) => {
                return `Rejoignez: CCIT, UTICA, Réseau Entreprendre, Startup Hub, et associations sectorielles. Participez aux événements (DigiTech, Journées de l'Entrepreneur). Maintenez un profil LinkedIn actif et sollicitez des mentors expérimentés.`
            }
        }
    ]
};

// Store AI analysis answers
let aiAnalysisAnswers = [];

async function apiRequest(endpoint, options = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
    } catch (_error) {
        throw new Error('Impossible de joindre le serveur. Verifiez que le backend est demarre.');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Erreur serveur.');
    }
    return data;
}

async function addProject(project) {
    return apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(project)
    });
}

async function getProjectsByUserId(userId) {
    return apiRequest(`/projects/user/${userId}`);
}

async function deleteProjectFromDB(projectId) {
    await apiRequest(`/projects/${projectId}`, { method: 'DELETE' });
}

async function clearAllProjectsFromDB() {
    if (!currentUser) return;
    await apiRequest(`/projects/user/${currentUser.id}`, { method: 'DELETE' });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    // Always continue initialization
    await loadCurrentUser();
    
    try {
        checkAuth();
    } catch (error) {
        console.error('Erreur lors du checkAuth:', error);
    }
    
    initializeForms();
    initializeLocationFeature();
    initializeAddressLookup();

    // Add event listeners for location ratings and suggestions
    const industrySelect = document.getElementById('industry');
    if (industrySelect) {
        industrySelect.addEventListener('change', displayLocationSuggestions);
    }

    const locationSelect = document.getElementById('location');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            displayLocationRating();
            displayLocationSuggestions();
        });
    }

    if (currentUser) {
        await loadProjects();
        updateDashboard();
        loadReports();
    }
});

// Load current user from localStorage (session persistence)
async function loadCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.id && parsedUser.email && parsedUser.name) {
                currentUser = parsedUser;
            }
        } catch (error) {
            console.warn('Error parsing user data from localStorage, ignoring...');
        }
    }
}

// Authentication Management
function checkAuth() {
    const sectionAuth = document.getElementById('section-auth');
    const mainNav = document.getElementById('main-nav');
    const mainContent = document.getElementById('main-content');
    
    if (!sectionAuth || !mainNav || !mainContent) {
        console.warn('Éléments d\'authentification non trouvés dans le DOM');
        return;
    }
    
    if (currentUser) {
        sectionAuth.classList.add('hidden');
        mainNav.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        updateWelcomeMessage();
        showSection('dashboard');
        // Load projects in background - if token is invalid, it will fail and logout
        loadProjects().catch(error => {
            console.warn('Failed to load projects, token may be invalid:', error);
            // Don't logout immediately, let the user try to navigate
        });
    } else {
        sectionAuth.classList.remove('hidden');
        mainNav.classList.add('hidden');
        mainContent.classList.add('hidden');
    }
}

function updateWelcomeMessage() {
    const welcomeElement = document.getElementById('welcome-message');
    if (welcomeElement && currentUser) {
        welcomeElement.textContent = `Bienvenue, ${currentUser.name} ! Vue d'ensemble de vos projets et analyses`;
    }
}

function showAuthTab(tab) {
    const loginPanel = document.getElementById('login-panel');
    const registerPanel = document.getElementById('register-panel');
    const loginTab = document.getElementById('tab-login');
    const registerTab = document.getElementById('tab-register');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    if (!loginPanel || !registerPanel || !loginTab || !registerTab || !loginError || !registerError) {
        console.warn('Éléments d\'authentification non trouvés dans showAuthTab');
        return;
    }

    // Clear errors
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');

    if (tab === 'login') {
        loginPanel.classList.remove('hidden');
        registerPanel.classList.add('hidden');
        loginTab.classList.add('bg-purple-600', 'text-white');
        loginTab.classList.remove('bg-gray-100', 'text-gray-600');
        loginTab.setAttribute('aria-selected', 'true');
        registerTab.classList.remove('bg-purple-600', 'text-white');
        registerTab.classList.add('bg-gray-100', 'text-gray-600');
        registerTab.setAttribute('aria-selected', 'false');
    } else {
        loginPanel.classList.add('hidden');
        registerPanel.classList.remove('hidden');
        registerTab.classList.add('bg-purple-600', 'text-white');
        registerTab.classList.remove('bg-gray-100', 'text-gray-600');
        registerTab.setAttribute('aria-selected', 'true');
        loginTab.classList.remove('bg-purple-600', 'text-white');
        loginTab.classList.add('bg-gray-100', 'text-gray-600');
        loginTab.setAttribute('aria-selected', 'false');
    }
}

async function login(email, password) {
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim(), password })
        });
        currentUser = response;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        checkAuth();
        await loadProjects();
        updateDashboard();
        loadReports();
        return { success: true, message: '' };
    } catch (error) {
        console.error('Erreur de connexion:', error);
        return { success: false, message: error.message || 'Erreur de connexion.' };
    }
}

async function register(name, email, password) {
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name: name.trim(), email: email.trim(), password })
        });
        currentUser = response;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        checkAuth();
        await loadProjects();
        updateDashboard();
        loadReports();
        return { success: true, message: '' };
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        return { success: false, message: error.message || 'Erreur d inscription.' };
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    projects = [];
    checkAuth();
}

// Load projects for current user
async function loadProjects() {
    if (currentUser) {
        try {
            projects = await getProjectsByUserId(currentUser.id);
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            projects = [];
        }
    }
}

// Navigation Management
function showSection(sectionId) {
    const targetSection = document.getElementById(`section-${sectionId}`);
    
    if (!targetSection) {
        console.warn(`Section ${sectionId} non trouvée`);
        return;
    }
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    targetSection.classList.remove('hidden');
    targetSection.classList.add('fade-in');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('nav-active');
    });
    const navBtn = document.getElementById(`nav-${sectionId}`);
    if (navBtn) {
        navBtn.classList.add('nav-active');
    }
    
    // Reset analysis step if going to analysis section
    if (sectionId === 'analysis') {
        resetAnalysisSteps();
    }
}

// Form Initialization
function initializeForms() {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const loginError = document.getElementById('login-error');
        
        const result = await login(email, password);
        if (result.success) {
            loginError.classList.add('hidden');
        } else {
            loginError.textContent = result.message || 'Email ou mot de passe incorrect';
            loginError.classList.remove('hidden');
        }
    });
    
    // Register Form
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const registerError = document.getElementById('register-error');
        
        if (password.length < 6) {
            registerError.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            registerError.classList.remove('hidden');
            return;
        }
        
        if (password !== confirm) {
            registerError.textContent = 'Les mots de passe ne correspondent pas';
            registerError.classList.remove('hidden');
            return;
        }
        
        const result = await register(name, email, password);
        if (result.success) {
            registerError.classList.add('hidden');
        } else {
            registerError.textContent = result.message || 'Erreur d inscription';
            registerError.classList.remove('hidden');
        }
    });
    
    // Step 1 Form
    document.getElementById('step1-form').addEventListener('submit', function(e) {
        e.preventDefault();
        goToStep(2);
    });
    
    // Step 2 Form
    document.getElementById('step2-form').addEventListener('submit', function(e) {
        e.preventDefault();
        goToStep(3);
    });
}

function initializeLocationFeature() {
    const detectBtn = document.getElementById('detect-location-btn');
    if (!detectBtn) return;
    detectBtn.addEventListener('click', detectUserLocation);
}

function initializeAddressLookup() {
    const searchBtn = document.getElementById('address-search-btn');
    if (!searchBtn) return;
    searchBtn.addEventListener('click', searchAddress);
}

async function searchAddress() {
    const input = document.getElementById('address-search');
    const statusEl = document.getElementById('address-search-status');
    const mapIframe = document.getElementById('address-map-iframe');

    if (!input || !statusEl || !mapIframe) return;

    const query = (input.value || '').trim();
    if (!query) {
        statusEl.textContent = 'Veuillez saisir une adresse valide.';
        return;
    }

    statusEl.textContent = 'Recherche de l adresse...';
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await response.json();
        if (!results || results.length === 0) {
            statusEl.textContent = 'Adresse non trouvee. Essayez une autre adresse.';
            return;
        }

        const place = results[0];
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);
        const delta = 0.02;
        const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
        mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
        statusEl.textContent = `Adresse trouvee: ${place.display_name}`;
    } catch (error) {
        console.error('Address search error:', error);
        statusEl.textContent = 'Erreur lors de la recherche de l adresse.';
    }
}

function detectUserLocation() {
    const statusEl = document.getElementById('location-status');
    const locationSelect = document.getElementById('location');

    if (!statusEl || !locationSelect) return;

    if (!navigator.geolocation) {
        statusEl.textContent = 'Geolocalisation non supportee par ce navigateur.';
        return;
    }

    statusEl.textContent = 'Detection de votre position en cours...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const nearestLocation = findNearestLocation(latitude, longitude);

            if (!nearestLocation) {
                statusEl.textContent = 'Position detectee, mais aucune ville proche trouvee.';
                return;
            }

            locationSelect.value = nearestLocation;
            statusEl.textContent = `Position detectee: ${formatLocationLabel(nearestLocation)} selectionnee automatiquement.`;
        },
        (error) => {
            if (error.code === 1) {
                statusEl.textContent = 'Permission refusee. Autorisez la localisation pour continuer.';
            } else if (error.code === 2) {
                statusEl.textContent = 'Position indisponible. Reessayez.';
            } else if (error.code === 3) {
                statusEl.textContent = 'Delai depasse. Reessayez.';
            } else {
                statusEl.textContent = 'Impossible de recuperer la position.';
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function findNearestLocation(lat, lon) {
    let nearest = null;
    let minDistance = Infinity;

    Object.entries(TUNISIA_CITY_COORDS).forEach(([key, coords]) => {
        const distance = haversineDistance(lat, lon, coords.lat, coords.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = key;
        }
    });

    return nearest;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => value * (Math.PI / 180);
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function formatLocationLabel(locationValue) {
    if (!locationValue) return 'Non specifie';
    return LOCATION_LABELS[locationValue] || locationValue;
}

function getLocationRating(locationValue) {
    if (!locationValue || !LOCATION_RATINGS[locationValue]) return null;
    return LOCATION_RATINGS[locationValue];
}

function generateLocationSuggestions(industry) {
    const suggestions = [];
    const industryWeights = {
        restauration: { tourism: 0.4, population: 0.3, business: 0.2, gdp: 0.1 },
        ecommerce: { business: 0.4, population: 0.3, gdp: 0.2, tourism: 0.1 },
        tech: { business: 0.5, gdp: 0.3, population: 0.2 },
        services: { population: 0.4, business: 0.3, gdp: 0.2, tourism: 0.1 },
        retail: { population: 0.4, tourism: 0.3, business: 0.2, gdp: 0.1 },
        other: { population: 0.3, business: 0.3, gdp: 0.2, tourism: 0.2 }
    };

    const weights = industryWeights[industry] || industryWeights.other;

    Object.entries(LOCATION_RATINGS).forEach(([city, data]) => {
        let score = 0;
        if (weights.tourism) score += data.tourism * weights.tourism;
        if (weights.population) score += (data.population / 100000) * weights.population; // Normalize population
        if (weights.business) score += data.business * weights.business;
        if (weights.gdp) score += data.gdp * weights.gdp;

        suggestions.push({
            city,
            name: LOCATION_LABELS[city],
            score: Math.round(score * 10) / 10,
            rating: data.rating,
            description: data.description
        });
    });

    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

function displayLocationRating() {
    const locationSelect = document.getElementById('location');
    const ratingContainer = document.getElementById('location-rating-container');

    if (!locationSelect || !ratingContainer) return;

    const selectedLocation = locationSelect.value;
    const rating = getLocationRating(selectedLocation);

    if (!rating) {
        ratingContainer.innerHTML = '';
        return;
    }

    const stars = Math.round((rating.rating / 10) * 5);
    const starHtml = '★'.repeat(stars) + '☆'.repeat(5 - stars);

    ratingContainer.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-blue-800">${LOCATION_LABELS[selectedLocation]}</h4>
                <div class="flex items-center">
                    <span class="text-yellow-500 mr-1">${starHtml}</span>
                    <span class="text-sm font-bold text-blue-600">${rating.rating}/10</span>
                </div>
            </div>
            <p class="text-sm text-blue-700 mb-2">${rating.description}</p>
            <div class="grid grid-cols-2 gap-2 text-xs text-blue-600">
                <div>Population: ${rating.population.toLocaleString()} hab.</div>
                <div>Activité économique: ${rating.business}/10</div>
                <div>Tourisme: ${rating.tourism}/10</div>
                <div>PIB régional: ${rating.gdp}/10</div>
            </div>
        </div>
    `;
}

function displayLocationSuggestions() {
    const industry = document.getElementById('industry').value;
    const suggestionsContainer = document.getElementById('location-suggestions');

    if (!industry || !suggestionsContainer) return;

    const suggestions = generateLocationSuggestions(industry);

    suggestionsContainer.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <h4 class="font-semibold text-green-800 mb-3 flex items-center">
                <i class="fas fa-lightbulb mr-2"></i>
                Suggestions d'emplacements pour ${industry}
            </h4>
            <div class="space-y-2">
                ${suggestions.map((suggestion, index) => `
                    <div class="flex items-center justify-between bg-white rounded p-3 cursor-pointer hover:bg-green-50 transition-colors"
                         onclick="selectSuggestedLocation('${suggestion.city}')">
                        <div class="flex items-center">
                            <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                ${index + 1}
                            </span>
                            <div>
                                <div class="font-medium text-gray-800">${suggestion.name}</div>
                                <div class="text-xs text-gray-500">${suggestion.description}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-bold text-green-600">${suggestion.score}/10</div>
                            <div class="text-xs text-yellow-500">★ ${suggestion.rating}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectSuggestedLocation(city) {
    const locationSelect = document.getElementById('location');
    if (locationSelect) {
        locationSelect.value = city;
        displayLocationRating();
    }
}

// Step Navigation
function resetAnalysisSteps() {
    currentStep = 1;
    updateStepIndicators();
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('hidden');
    });
    document.getElementById('step-1').classList.remove('hidden');
    
    // Clear forms
    document.getElementById('step1-form').reset();
    document.getElementById('step2-form').reset();
    
    // Clear results
    document.getElementById('bp-preview').innerHTML = '<p class="text-gray-500 text-center py-8">Le business plan sera généré automatiquement après validation.</p>';
}

function goToStep(step) {
    currentStep = step;
    updateStepIndicators();
    
    document.querySelectorAll('.step-content').forEach(s => {
        s.classList.add('hidden');
    });
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
    if (step === 3) {
        generateBusinessPlanPreview();
        generateAIQuestions();
    }
}

// Generate AI Analysis Questions and Answers
function generateAIQuestions() {
    const industry = document.getElementById('industry').value || 'other';
    const questions = ANALYSIS_QUESTIONS[industry] || ANALYSIS_QUESTIONS.other;
    
    // Get project data for personalized answers
    const projectData = {
        initialInvestment: parseFloat(document.getElementById('initial-investment').value) || 0,
        annualRevenue: parseFloat(document.getElementById('annual-revenue').value) || 0,
        annualCosts: parseFloat(document.getElementById('annual-costs').value) || 0,
        projectDuration: parseInt(document.getElementById('project-duration').value) || 5,
        discountRate: parseFloat(document.getElementById('discount-rate').value) || 10
    };
    
    // Generate answers
    aiAnalysisAnswers = questions.map(q => ({
        question: q.question,
        answer: q.generateAnswer(projectData)
    }));
    
    // Display questions and answers
    const container = document.getElementById('ai-questions-container');
    container.innerHTML = aiAnalysisAnswers.map((qa, index) => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all">
            <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-blue-600 font-bold text-sm">${index + 1}</span>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-2">${qa.question}</h4>
                    <p class="text-gray-600 text-sm leading-relaxed">${qa.answer}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStepIndicators() {
    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        indicator.classList.remove('step-active', 'step-completed', 'step-inactive');
        
        if (i < currentStep) {
            indicator.classList.add('step-completed');
        } else if (i === currentStep) {
            indicator.classList.add('step-active');
        } else {
            indicator.classList.add('step-inactive');
        }
    }
    
    // Update progress bars
    for (let i = 1; i <= 3; i++) {
        const progress = document.getElementById(`progress-${i}`);
        if (i < currentStep) {
            progress.style.width = '100%';
        } else {
            progress.style.width = '0%';
        }
    }
}

// Business Plan Preview (Step 3)
function generateBusinessPlanPreview() {
    const companyName = document.getElementById('company-name').value || 'Entreprise sans nom';
    const industry = document.getElementById('industry').value || 'Non spécifié';
    const revenueModel = document.getElementById('revenue-model').value || 'Non spécifié';
    const valueProposition = document.getElementById('value-proposition').value || 'Non spécifiée';
    const keyPartners = document.getElementById('key-partners').value || 'Non spécifiés';
    const address = document.getElementById('address-search').value || 'Non spécifiée';
    const projectDescription = document.getElementById('project-description').value || 'Description non fournie';
    const targetAudience = document.getElementById('target-audience').value || 'Non spécifié';
    const competitiveAdvantage = document.getElementById('competitive-advantage').value || 'Non spécifié';
    
    const executiveSummary = generateExecutiveSummary(companyName, industry, projectDescription);
    const swot = generateSWOT(industry, competitiveAdvantage);
    const financialPlan = generateFinancialPlan();
    
    const bpPreview = document.getElementById('bp-preview');
    bpPreview.innerHTML = `
        <div class="space-y-4">
            <div class="border-b pb-3">
                <h3 class="text-lg font-bold text-gray-800">Business Plan - ${companyName}</h3>
                <p class="text-sm text-gray-500">Secteur: ${industry}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Résumé Exécutif</h4>
                <p class="text-sm text-gray-600 mt-1">${executiveSummary}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Description du Projet</h4>
                <p class="text-sm text-gray-600 mt-1">${projectDescription}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Modèle de revenus</h4>
                <p class="text-sm text-gray-600 mt-1">${revenueModel}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Proposition de valeur</h4>
                <p class="text-sm text-gray-600 mt-1">${valueProposition}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Partenaires clés</h4>
                <p class="text-sm text-gray-600 mt-1">${keyPartners}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Adresse / Zone</h4>
                <p class="text-sm text-gray-600 mt-1">${address}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Public Cible</h4>
                <p class="text-sm text-gray-600 mt-1">${targetAudience}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700">Avantages Concurrentiels</h4>
                <p class="text-sm text-gray-600 mt-1">${competitiveAdvantage}</p>
            </div>
        </div>
    `;
}

// Final Analysis Generation (Step 4)
async function generateFinalAnalysis() {
    const projectName = document.getElementById('project-name').value || 'Projet sans nom';
    const companyName = document.getElementById('company-name').value || 'Entreprise sans nom';
    const industry = document.getElementById('industry').value || 'Non spécifié';
    const revenueModel = document.getElementById('revenue-model').value || 'Non spécifié';
    const valueProposition = document.getElementById('value-proposition').value || 'Non spécifiée';
    const keyPartners = document.getElementById('key-partners').value || 'Non spécifiés';
    const address = document.getElementById('address-search').value || 'Non spécifiée';
    const location = document.getElementById('location').value || 'Non spécifié';
    const projectDescription = document.getElementById('project-description').value || 'Description non fournie';
    const targetAudience = document.getElementById('target-audience').value || 'Non spécifié';
    const competitiveAdvantage = document.getElementById('competitive-advantage').value || 'Non spécifié';
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
    const annualRevenue = parseFloat(document.getElementById('annual-revenue').value) || 0;
    const annualCosts = parseFloat(document.getElementById('annual-costs').value) || 0;
    const projectDuration = parseInt(document.getElementById('project-duration').value) || 5;
    const discountRate = parseFloat(document.getElementById('discount-rate').value) || 10;

    // Calculate financial metrics
    const annualProfit = annualRevenue - annualCosts;
    const totalProfit = annualProfit * projectDuration;
    const roi = initialInvestment > 0 ? ((totalProfit - initialInvestment) / initialInvestment) * 100 : 0;
    const breakeven = annualProfit > 0 ? initialInvestment / annualProfit : Infinity;
    
    let npv = -initialInvestment;
    for (let i = 1; i <= projectDuration; i++) {
        npv += annualProfit / Math.pow(1 + discountRate / 100, i);
    }
    
    let irr = 0;
    if (initialInvestment > 0 && annualProfit > 0) {
        irr = calculateIRR(initialInvestment, annualProfit, projectDuration);
    }
    
    const cashflows = [];
    cashflows.push(-initialInvestment);
    for (let i = 1; i <= projectDuration; i++) {
        cashflows.push(annualProfit);
    }
    
    const score = calculateFeasibilityScore(roi, npv, breakeven, irr);
    
    // Display results
    displayFeasibilityResults(score, roi, breakeven, npv, irr, cashflows);
    
    // Generate complete business plan
    const executiveSummary = generateExecutiveSummary(companyName, industry, projectDescription);
    const swot = generateSWOT(industry, competitiveAdvantage);
    const financialPlan = generateFinancialPlan();
    
    const bpFinalContent = document.getElementById('bp-final-content');
    bpFinalContent.innerHTML = `
        <div class="space-y-6">
            <div class="border-b pb-4">
                <h3 class="text-2xl font-bold text-gray-800">Business Plan - ${companyName}</h3>
                <p class="text-gray-500 mt-1">Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
                <p class="text-sm text-gray-400">Localisation: ${formatLocationLabel(location)}</p>
                <p class="text-sm text-gray-400">Adresse: ${address}</p>
                <p class="text-sm text-gray-400">Modèle de revenus: ${revenueModel}</p>
            </div>
            <div class="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <h4 class="text-lg font-semibold text-gray-800 mb-2">Résultats clés</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div><strong>ROI:</strong> ${roi.toFixed(1)}%</div>
                    <div><strong>VAN (NPV):</strong> ${npv.toLocaleString('fr-TN')} DT</div>
                    <div><strong>Seuil de rentabilité:</strong> ${breakeven === Infinity ? 'Non atteint' : breakeven.toFixed(1) + ' ans'}</div>
                    <div><strong>TRI:</strong> ${irr.toFixed(1)}%</div>
                    <div><strong>Score de faisabilité:</strong> ${score}/100</div>
                    <div><strong>Partenaires clés:</strong> ${keyPartners}</div>
                </div>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">1. Résumé Exécutif</h4>
                <p class="text-gray-700 leading-relaxed">${executiveSummary}</p>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">2. Description du Projet</h4>
                <p class="text-gray-700 leading-relaxed">${projectDescription}</p>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">3. Proposition de valeur</h4>
                <p class="text-gray-700 leading-relaxed">${valueProposition}</p>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">4. Public Cible</h4>
                <p class="text-gray-700 leading-relaxed">${targetAudience}</p>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">4. Avantages Concurrentiels</h4>
                <p class="text-gray-700 leading-relaxed">${competitiveAdvantage}</p>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">5. Plan Financier</h4>
                <p class="text-gray-700 leading-relaxed">${financialPlan}</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 class="text-lg font-bold text-blue-800 mb-4 flex items-center">
                    <i class="fas fa-robot mr-2"></i> 6. Insights IA - Analyse Stratégique
                </h4>
                <div class="space-y-4">
                    ${aiAnalysisAnswers.map((qa, index) => `
                        <div class="bg-white rounded-lg p-4">
                            <h5 class="font-semibold text-gray-800 mb-2">${index + 1}. ${qa.question}</h5>
                            <p class="text-gray-600 text-sm leading-relaxed">${qa.answer}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">7. Plan d'Action Recommandé</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                    <ul class="list-disc list-inside text-gray-700 space-y-2">
                        <li><strong>Phase 1 (0-3 mois):</strong> Finalisation de la structure juridique, recrutement clé, lancement des opérations pilotes</li>
                        <li><strong>Phase 2 (3-6 mois):</strong> Déploiement commercial complet, optimisation des processus, acquisition des premiers clients</li>
                        <li><strong>Phase 3 (6-12 mois):</strong> Expansion géographique, développement de nouveaux services, optimisation de la rentabilité</li>
                        <li><strong>Phase 4 (12-24 mois):</strong> Consolidation du marché, exploration de nouvelles opportunités, préparation à la croissance</li>
                    </ul>
                </div>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">8. Analyse des Risques et Mitigation</h4>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="space-y-3">
                        <div>
                            <h5 class="font-semibold text-red-800">Risque Financier</h5>
                            <p class="text-sm text-gray-600">Cash flow insuffisant → Mitigation: Maintenir 6 mois de trésorerie de réserve, diversifier les sources de revenus</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-red-800">Risque Opérationnel</h5>
                            <p class="text-sm text-gray-600">Difficultés d'exécution → Mitigation: Plan B pour chaque scénario, formation continue de l'équipe</p>
                        </div>
                        <div>
                            <h5 class="font-semibold text-red-800">Risque Marché</h5>
                            <p class="text-sm text-gray-600">Concurrence accrue → Mitigation: Innovation continue, veille concurrentielle, différenciation forte</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h4 class="text-lg font-bold text-gray-800 mb-2">9. Conclusion et Recommandations</h4>
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p class="text-gray-700 leading-relaxed">
                        Basé sur l'analyse financière et les insights stratégiques, le projet présente un score de faisabilité de <strong>${score}/100</strong>. 
                        ${score >= 70 ? 'Le projet est jugé viable avec un potentiel de croissance significatif. Les recommandations ci-dessus doivent être suivies pour maximiser les chances de succès.' : 
                        score >= 50 ? 'Le projet présente un potentiel mais nécessite des ajustements importants. Il est recommandé de revoir les hypothèses financières et de renforcer le plan d\'action avant le lancement.' : 
                        'Le projet comporte des risques significatifs. Une révision complète du modèle économique et des hypothèses est nécessaire avant tout investissement.'}
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Update SWOT
    document.getElementById('swot-strengths').innerHTML = swot.strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('swot-weaknesses').innerHTML = swot.weaknesses.map(w => `<li>${w}</li>`).join('');
    document.getElementById('swot-opportunities').innerHTML = swot.opportunities.map(o => `<li>${o}</li>`).join('');
    document.getElementById('swot-threats').innerHTML = swot.threats.map(t => `<li>${t}</li>`).join('');
    
    // Save project
    if (!currentUser || !currentUser.id) {
        alert('Vous devez être connecté pour enregistrer un projet.');
        return;
    }

    currentProject = {
        userId: currentUser.id,
        name: projectName,
        companyName,
        industry,
            revenueModel,
            valueProposition,
            keyPartners,
            location,
            address,
        annualCosts,
        projectDuration,
        discountRate,
        roi,
        breakeven,
        npv,
        irr,
        score,
        cashflows,
        aiAnalysisAnswers,
        date: new Date().toLocaleDateString('fr-FR'),
        createdAt: new Date().toISOString()
    };
    
    try {
        const savedProject = await addProject(currentProject);
        currentProject = savedProject;
        projects.push(savedProject);
        updateDashboard();
        loadReports();
        goToStep(4);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du projet:', error);
        alert('Erreur lors de la sauvegarde du projet');
    }
}

// Feasibility Calculations (legacy, kept for compatibility)
function calculateFeasibility() {
    generateFinalAnalysis();
}

function calculateIRR(initialInvestment, annualProfit, years) {
    let low = 0;
    let high = 100;
    let irr = 0;
    
    for (let i = 0; i < 100; i++) {
        irr = (low + high) / 2;
        let npv = -initialInvestment;
        for (let j = 1; j <= years; j++) {
            npv += annualProfit / Math.pow(1 + irr / 100, j);
        }
        
        if (Math.abs(npv) < 1) break;
        if (npv > 0) low = irr;
        else high = irr;
    }
    
    return irr;
}

function calculateFeasibilityScore(roi, npv, breakeven, irr) {
    let score = 0;
    
    // ROI Score (0-30 points)
    if (roi > 50) score += 30;
    else if (roi > 30) score += 25;
    else if (roi > 20) score += 20;
    else if (roi > 10) score += 15;
    else if (roi > 0) score += 10;
    
    // NPV Score (0-30 points)
    if (npv > 100000) score += 30;
    else if (npv > 50000) score += 25;
    else if (npv > 20000) score += 20;
    else if (npv > 0) score += 15;
    else if (npv > -20000) score += 10;
    
    // Breakeven Score (0-20 points)
    if (breakeven < 2) score += 20;
    else if (breakeven < 3) score += 15;
    else if (breakeven < 4) score += 10;
    else if (breakeven < 5) score += 5;
    
    // IRR Score (0-20 points)
    if (irr > 30) score += 20;
    else if (irr > 20) score += 15;
    else if (irr > 15) score += 10;
    else if (irr > 10) score += 5;
    
    return Math.min(score, 100);
}

function displayFeasibilityResults(score, roi, breakeven, npv, irr, cashflows) {
    // Show result cards
    document.getElementById('score-card').classList.remove('hidden');
    document.getElementById('metrics-card').classList.remove('hidden');
    document.getElementById('chart-card').classList.remove('hidden');
    
    // Display Score
    const scoreDisplay = document.getElementById('score-display');
    scoreDisplay.textContent = score;
    scoreDisplay.className = 'w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold';
    
    const scoreText = document.getElementById('score-text');
    const scoreDescription = document.getElementById('score-description');
    
    if (score >= 70) {
        scoreDisplay.classList.add('score-excellent');
        scoreText.textContent = 'Excellent';
        scoreDescription.textContent = 'Projet très viable et rentable';
    } else if (score >= 50) {
        scoreDisplay.classList.add('score-good');
        scoreText.textContent = 'Bon';
        scoreDescription.textContent = 'Projet viable avec quelques ajustements';
    } else {
        scoreDisplay.classList.add('score-poor');
        scoreText.textContent = 'Faible';
        scoreDescription.textContent = 'Projet à risque, révision nécessaire';
    }
    
    // Display Metrics
    document.getElementById('metric-roi').textContent = roi.toFixed(1) + '%';
    document.getElementById('metric-breakeven').textContent = breakeven === Infinity ? 'Jamais' : breakeven.toFixed(1) + ' ans';
    document.getElementById('metric-npv').textContent = npv.toLocaleString('fr-TN') + ' DT';
    document.getElementById('metric-irr').textContent = irr.toFixed(1) + '%';
    
    // Display Chart
    displayCashflowChart(cashflows);
}

function displayCashflowChart(cashflows) {
    const ctx = document.getElementById('cashflow-chart').getContext('2d');
    
    if (cashflowChart) {
        cashflowChart.destroy();
    }
    
    const labels = cashflows.map((_, index) => `Année ${index}`);
    const data = cashflows.map(cf => cf);
    
    cashflowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cashflow (DT)',
                data: data,
                backgroundColor: data.map(cf => cf >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                borderColor: data.map(cf => cf >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('fr-TN') + ' DT';
                        }
                    }
                }
            }
        }
    });
}

// Update cashflow forecast based on adjustable parameters
function updateCashflowForecast() {
    if (!currentProject) return;
    
    const growthRate = parseFloat(document.getElementById('growth-rate').value) / 100;
    const inflationRate = parseFloat(document.getElementById('inflation-rate').value) / 100;
    const costVariation = parseFloat(document.getElementById('cost-variation').value) / 100;
    
    // Update display values
    document.getElementById('growth-rate-value').textContent = document.getElementById('growth-rate').value + '%';
    document.getElementById('inflation-rate-value').textContent = document.getElementById('inflation-rate').value + '%';
    document.getElementById('cost-variation-value').textContent = document.getElementById('cost-variation').value + '%';
    
    // Recalculate cashflows with parameters
    const baseRevenue = currentProject.annualRevenue - currentProject.annualCosts;
    const adjustedCashflows = [-currentProject.initialInvestment];
    
    for (let i = 1; i <= currentProject.projectDuration; i++) {
        // Apply growth rate to revenue
        const adjustedRevenue = baseRevenue * Math.pow(1 + growthRate, i - 1);
        // Apply inflation and cost variation
        const adjustedCosts = adjustedRevenue * (1 + inflationRate - costVariation);
        adjustedCashflows.push(adjustedRevenue - adjustedCosts);
    }
    
    // Update chart
    displayCashflowChart(adjustedCashflows);
}

// Business Plan Generation (legacy, kept for compatibility)
function generateBusinessPlan() {
    generateBusinessPlanPreview();
}

function generateExecutiveSummary(companyName, industry, description) {
    return `${companyName} est une entreprise innovante opérant dans le secteur ${industry}. ${description} Cette entreprise se positionne comme un acteur clé sur son marché grâce à une approche centrée sur l'innovation et la satisfaction client. Le modèle d'affaires repose sur des processus optimisés et une proposition de valeur unique qui répond aux besoins croissants du marché.`;
}

function generateSWOT(industry, advantage) {
    const swotData = {
        restauration: {
            strengths: ['Produits de qualité', 'Service client excellent', 'Emplacement stratégique', 'Équipe expérimentée'],
            weaknesses: ['Coûts opérationnels élevés', 'Dépendance aux fournisseurs', 'Concurrence forte'],
            opportunities: ['Expansion géographique', 'Nouveaux services de livraison', 'Partenariats locaux', 'Tendance bio/healthy'],
            threats: ['Augmentation des coûts des matières premières', 'Réglementations sanitaires', 'Fluctuations saisonnières']
        },
        ecommerce: {
            strengths: ['Accessibilité 24/7', 'Coûts de fonctionnement réduits', 'Large portée géographique', 'Données clients précieuses'],
            weaknesses: ['Dépendance à la logistique', 'Concurrence mondiale', 'Marges réduites'],
            opportunities: ['Expansion internationale', 'Personnalisation par IA', 'Nouveaux marchés émergents', 'Mobile commerce'],
            threats: ['Cybersécurité', 'Frais de livraison', 'Réglementations e-commerce']
        },
        tech: {
            strengths: ['Innovation continue', 'Propriété intellectuelle', 'Équipe technique qualifiée', 'Scalabilité'],
            weaknesses: ['Dépendance au financement', 'Temps de développement long', 'Risque technologique'],
            opportunities: ['Partenariats stratégiques', 'Nouveaux marchés', 'Acquisitions', 'IA et automatisation'],
            threats: ['Concurrence des géants tech', 'Évolutions technologiques rapides', 'Pénurie de talents']
        },
        services: {
            strengths: ['Relation client personnalisée', 'Expertise métier', 'Flexibilité', 'Réputation'],
            weaknesses: ['Difficulté de scalabilité', 'Dépendance aux talents', 'Standardisation complexe'],
            opportunities: ['Digitalisation des services', 'Nouveaux segments de marché', 'Franchise', 'Partenariats B2B'],
            threats: ['Pression sur les prix', 'Automatisation', 'Concurrence low-cost']
        },
        retail: {
            strengths: ['Expérience client en magasin', 'Visibilité locale', 'Stock immédiat', 'Contact humain'],
            weaknesses: ['Coûts immobiliers élevés', 'Horaires limités', 'Gestion des stocks complexe'],
            opportunities: ['Omnicanal', 'Expériences immersives', 'Loyauté client', 'Pop-up stores'],
            threats: ['E-commerce', "Coûts d'exploitation", 'Changements de comportement']
        },
        other: {
            strengths: ['Flexibilité', 'Innovation', 'Équipe motivée', 'Adaptabilité'],
            weaknesses: ['Ressources limitées', 'Manque de notoriété', 'Processus à définir'],
            opportunities: ['Croissance du marché', 'Nouveaux partenariats', 'Innovation produit', 'Expansion'],
            threats: ['Concurrence', 'Réglementations', 'Conditions économiques']
        }
    };
    
    return swotData[industry] || swotData.other;
}

function generateFinancialPlan() {
    return `Le plan financier prévoit une structure de coûts optimisée avec des investissements initiaux concentrés sur les actifs stratégiques. Les projections de revenus sont basées sur une croissance progressive du marché et une acquisition de clients ciblée. Le modèle prévoit l'atteinte du seuil de rentabilité dans les 24 à 36 mois suivant le lancement, avec un retour sur investissement positif à partir de la troisième année. Les scénarios de sensibilité ont été élaborés pour anticiper les variations du marché et assurer la résilience financière du projet.`;
}

// Dashboard Management
function updateDashboard() {
    // Update stats
    document.getElementById('stat-projects').textContent = projects.length;
    
    if (projects.length > 0) {
        const avgScore = projects.reduce((sum, p) => sum + p.score, 0) / projects.length;
        const avgRoi = projects.reduce((sum, p) => sum + p.roi, 0) / projects.length;
        
        document.getElementById('stat-score').textContent = avgScore.toFixed(0) + '/100';
        document.getElementById('stat-roi').textContent = avgRoi.toFixed(1) + '%';
        document.getElementById('stat-bp').textContent = projects.length;
    }
    
    // Update recent projects
    const recentProjectsDiv = document.getElementById('recent-projects');
    if (projects.length > 0) {
        const recentProjects = projects.slice(-5).reverse();
        recentProjectsDiv.innerHTML = recentProjects.map(project => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer" onclick="loadProject(${project.id})">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${project.score >= 70 ? 'bg-green-100 text-green-600' : project.score >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${project.name}</p>
                        <p class="text-sm text-gray-500">${project.date} - Score: ${project.score}/100</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-medium text-gray-800">${project.roi.toFixed(1)}% ROI</p>
                    <p class="text-sm text-gray-500">${project.npv.toLocaleString('fr-TN')} DT VAN</p>
                </div>
            </div>
        `).join('');
    } else {
        recentProjectsDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun projet récent. Commencez par créer une nouvelle analyse.</p>';
    }
}

// Load Project
function loadProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        currentProject = project;
        
        // Fill all forms
        document.getElementById('project-name').value = project.name;
        document.getElementById('company-name').value = project.companyName || '';
        document.getElementById('industry').value = project.industry || '';
        document.getElementById('location').value = project.location || '';
        document.getElementById('project-description').value = project.projectDescription || '';
        document.getElementById('target-audience').value = project.targetAudience || '';
        document.getElementById('competitive-advantage').value = project.competitiveAdvantage || '';
        document.getElementById('initial-investment').value = project.initialInvestment;
        document.getElementById('annual-revenue').value = project.annualRevenue;
        document.getElementById('annual-costs').value = project.annualCosts;
        document.getElementById('project-duration').value = project.projectDuration;
        document.getElementById('discount-rate').value = project.discountRate;
        
        // Show results directly in step 4
        displayFeasibilityResults(
            project.score,
            project.roi,
            project.breakeven,
            project.npv,
            project.irr,
            project.cashflows
        );
        
        // Generate business plan
        if (project.companyName) {
            const executiveSummary = generateExecutiveSummary(project.companyName, project.industry, project.projectDescription);
            const swot = generateSWOT(project.industry, project.competitiveAdvantage);
            const financialPlan = generateFinancialPlan();
            
            // Restore AI answers if available
            if (project.aiAnalysisAnswers && project.aiAnalysisAnswers.length > 0) {
                aiAnalysisAnswers = project.aiAnalysisAnswers;
            }
            
            const bpFinalContent = document.getElementById('bp-final-content');
            bpFinalContent.innerHTML = `
                <div class="space-y-6">
                    <div class="border-b pb-4">
                        <h3 class="text-2xl font-bold text-gray-800">Business Plan - ${project.companyName}</h3>
                        <p class="text-gray-500 mt-1">Généré le ${project.date}</p>
                        <p class="text-sm text-gray-400">Localisation: ${formatLocationLabel(project.location)}</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">1. Résumé Exécutif</h4>
                        <p class="text-gray-700 leading-relaxed">${executiveSummary}</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">2. Description du Projet</h4>
                        <p class="text-gray-700 leading-relaxed">${project.projectDescription}</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">3. Public Cible</h4>
                        <p class="text-gray-700 leading-relaxed">${project.targetAudience}</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">4. Avantages Concurrentiels</h4>
                        <p class="text-gray-700 leading-relaxed">${project.competitiveAdvantage}</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">5. Plan Financier</h4>
                        <p class="text-gray-700 leading-relaxed">${financialPlan}</p>
                    </div>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 class="text-lg font-bold text-blue-800 mb-4 flex items-center">
                            <i class="fas fa-robot mr-2"></i> 6. Insights IA - Analyse Stratégique
                        </h4>
                        <div class="space-y-4">
                            ${aiAnalysisAnswers.map((qa, index) => `
                                <div class="bg-white rounded-lg p-4">
                                    <h5 class="font-semibold text-gray-800 mb-2">${index + 1}. ${qa.question}</h5>
                                    <p class="text-gray-600 text-sm leading-relaxed">${qa.answer}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">7. Plan d'Action Recommandé</h4>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <ul class="list-disc list-inside text-gray-700 space-y-2">
                                <li><strong>Phase 1 (0-3 mois):</strong> Finalisation de la structure juridique, recrutement clé, lancement des opérations pilotes</li>
                                <li><strong>Phase 2 (3-6 mois):</strong> Déploiement commercial complet, optimisation des processus, acquisition des premiers clients</li>
                                <li><strong>Phase 3 (6-12 mois):</strong> Expansion géographique, développement de nouveaux services, optimisation de la rentabilité</li>
                                <li><strong>Phase 4 (12-24 mois):</strong> Consolidation du marché, exploration de nouvelles opportunités, préparation à la croissance</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">8. Analyse des Risques et Mitigation</h4>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="space-y-3">
                                <div>
                                    <h5 class="font-semibold text-red-800">Risque Financier</h5>
                                    <p class="text-sm text-gray-600">Cash flow insuffisant → Mitigation: Maintenir 6 mois de trésorerie de réserve, diversifier les sources de revenus</p>
                                </div>
                                <div>
                                    <h5 class="font-semibold text-red-800">Risque Opérationnel</h5>
                                    <p class="text-sm text-gray-600">Difficultés d'exécution → Mitigation: Plan B pour chaque scénario, formation continue de l'équipe</p>
                                </div>
                                <div>
                                    <h5 class="font-semibold text-red-800">Risque Marché</h5>
                                    <p class="text-sm text-gray-600">Concurrence accrue → Mitigation: Innovation continue, veille concurrentielle, différenciation forte</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">9. Conclusion et Recommandations</h4>
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="text-gray-700 leading-relaxed">
                                Basé sur l'analyse financière et les insights stratégiques, le projet présente un score de faisabilité de <strong>${project.score}/100</strong>. 
                                ${project.score >= 70 ? 'Le projet est jugé viable avec un potentiel de croissance significatif. Les recommandations ci-dessus doivent être suivies pour maximiser les chances de succès.' : 
                                project.score >= 50 ? 'Le projet présente un potentiel mais nécessite des ajustements importants. Il est recommandé de revoir les hypothèses financières et de renforcer le plan d\'action avant le lancement.' : 
                                'Le projet comporte des risques significatifs. Une révision complète du modèle économique et des hypothèses est nécessaire avant tout investissement.'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('swot-strengths').innerHTML = swot.strengths.map(s => `<li>${s}</li>`).join('');
            document.getElementById('swot-weaknesses').innerHTML = swot.weaknesses.map(w => `<li>${w}</li>`).join('');
            document.getElementById('swot-opportunities').innerHTML = swot.opportunities.map(o => `<li>${o}</li>`).join('');
            document.getElementById('swot-threats').innerHTML = swot.threats.map(t => `<li>${t}</li>`).join('');
        }
        
        // Go to step 4
        currentStep = 4;
        updateStepIndicators();
        showSection('analysis');
        document.querySelectorAll('.step-content').forEach(s => s.classList.add('hidden'));
        document.getElementById('step-4').classList.remove('hidden');
    }
}

// Reports Management
function loadReports() {
    const reportsList = document.getElementById('reports-list');
    
    if (projects.length > 0) {
        reportsList.innerHTML = projects.map(project => `
            <div class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <i class="fas fa-file-alt text-purple-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${project.name}</p>
                        <p class="text-sm text-gray-500">${project.date}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${project.score >= 70 ? 'bg-green-100 text-green-700' : project.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
                        Score: ${project.score}/100
                    </span>
                    <button onclick="loadProject(${project.id})" class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200 transition-all">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="deleteProject(${project.id})" class="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        reportsList.innerHTML = '<p class="text-gray-500 text-center py-8">Aucun rapport disponible.</p>';
    }
}

async function deleteProject(projectId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        try {
            await deleteProjectFromDB(projectId);
            projects = projects.filter(p => p.id !== projectId);
            updateDashboard();
            loadReports();
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            alert('Erreur lors de la suppression du projet');
        }
    }
}

async function clearAllData() {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les projets? Cette action est irréversible.')) {
        try {
            await clearAllProjectsFromDB();
            projects = [];
            updateDashboard();
            loadReports();
            
            // Hide result cards
            document.getElementById('score-card').classList.add('hidden');
            document.getElementById('metrics-card').classList.add('hidden');
            document.getElementById('chart-card').classList.add('hidden');
        } catch (error) {
            console.error('Erreur lors de la suppression des projets:', error);
            alert('Erreur lors de la suppression des projets');
        }
    }
}

// Export Functions
function exportPDF() {
    const content = document.getElementById('bp-final-content').innerHTML || document.getElementById('bp-preview').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Business Plan - Stratify</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; }
                .logo-header { display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #d97706; padding-bottom: 20px; }
                .logo-header img { width: 80px; height: auto; margin-right: 20px; }
                .logo-text { font-size: 24px; font-weight: bold; color: #1f2937; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
                p { margin-bottom: 10px; line-height: 1.6; }
                ul { margin-left: 20px; }
                li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="logo-header">
                <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
                  <defs>
                    <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#d4a574"/>
                      <stop offset="100%" stop-color="#8b6f47"/>
                    </linearGradient>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#84c1ff"/>
                      <stop offset="100%" stop-color="#1f5fc0"/>
                    </linearGradient>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.15"/>
                    </filter>
                  </defs>
                  <circle cx="100" cy="100" r="96" fill="#f8fafc" stroke="#d1d5db" stroke-width="1"/>
                  <circle cx="100" cy="100" r="82" fill="#ffffff"/>
                  <g filter="url(#shadow)">
                    <path d="M 42 100 C 42 55 72 40 92 40 L 132 40 C 158 40 168 62 168 96 L 168 104 C 168 138 158 160 132 160 L 92 160 C 72 160 42 145 42 100 Z" fill="none" stroke="url(#copperGrad)" stroke-width="16"/>
                    <path d="M 69 99 C 69 84 77 78 86 78 H 115 C 124 78 132 84 132 99 V 101 C 132 116 124 122 115 122 H 86 C 77 122 69 116 69 101 Z" fill="url(#blueGrad)" opacity="0.95"/>
                    <path d="M 76 99 C 76 88 82 84 86 84 H 115 C 119 84 125 88 125 99 V 101 C 125 112 119 116 115 116 H 86 C 82 116 76 112 76 101 Z" fill="#e2f2ff"/>
                    <path d="M 85 95 L 115 95" stroke="#1f5fc0" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 85 105 L 115 105" stroke="#1f5fc0" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="84" cy="95" r="3" fill="#1f5fc0"/>
                    <circle cx="116" cy="105" r="3" fill="#1f5fc0"/>
                    <path d="M 60 120 L 140 40" stroke="url(#copperGrad)" stroke-width="12" stroke-linecap="round"/>
                    <polygon points="140,40 132,52 148,52" fill="url(#copperGrad)"/>
                  </g>
                  <circle cx="100" cy="142" r="3" fill="#1f5fc0"/>
                  <circle cx="118" cy="102" r="3" fill="#1f5fc0"/>
                  <circle cx="82" cy="118" r="3" fill="#1f5fc0"/>
                </svg>
                <div class="logo-text">Business Plan - Stratify</div>
            </div>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function exportWord() {
    const content = (document.getElementById('bp-final-content').innerText || document.getElementById('bp-preview').innerText);
    const header = `STRATIFY - INTERACTIVE FEASIBILITY & BUSINESS PLANS\n${'='.repeat(60)}\nBusiness Plan Document\n${'='.repeat(60)}\n\n`;
    const fullContent = header + content;
    const blob = new Blob(['\ufeff', fullContent], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stratify_business_plan.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
