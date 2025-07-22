import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from 'bcrypt';
import db from '../lib/db';
import cuid from 'cuid';
import {
  users,
  news,
  gallery,
  gradeReports,
  studentGrades,
  students,
  userProfiles,
  facilities,
  achievements,
  contacts,
  applications,
  bookings,
} from '../schema';

// Generate cuids for users
const userIds = {
  admin: cuid(),
  super_admin: cuid(),
  teacher1: cuid(),
  teacher2: cuid(),
  teacher3: cuid(),
};

// Generate cuids for students
const studentIds = {
  GBHS2024001: cuid(),
  GBHS2024002: cuid(),
  GBHS2024003: cuid(),
  GBHS2024004: cuid(),
  GBHS2024005: cuid(),
};

// Generate cuids for grade reports
const gradeReportIds = {
  math: cuid(),
  physics: cuid(),
  chemistry: cuid(),
};

// Sample news data
const sampleNews = [
  {
    title: 'Welcome to the New Academic Year 2025-2026',
    titleFr: 'Bienvenue à la Nouvelle Année Académique 2025-2026',
    content:
      'We are excited to welcome all students back for the 2025-2026 academic year. This year promises to be filled with learning, growth, and achievement. Our dedicated team of over 100 teachers is ready to guide our 1500+ students towards excellence.',
    contentFr:
      "Nous sommes ravis d'accueillir tous les étudiants pour l'année académique 2025-2026. Cette année promet d'être remplie d'apprentissage, de croissance et de réussite. Notre équipe dévouée de plus de 100 enseignants est prête à guider nos plus de 1500 étudiants vers l'excellence.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-09-01'),
  },
  {
    title: 'Annual Sports Day Announcement',
    titleFr: 'Annonce de la Journée Sportive Annuelle',
    content:
      'Our annual sports day will be held on October 15th, 2024. All students are encouraged to participate in various athletic events including football, basketball, athletics, and traditional games. This event promotes physical fitness and team spirit.',
    contentFr:
      "Notre journée sportive annuelle aura lieu le 15 octobre 2024. Tous les étudiants sont encouragés à participer à divers événements athlétiques, y compris le football, le basketball, l'athlétisme et les jeux traditionnels. Cet événement promeut la forme physique et l'esprit d'équipe.",
    category: 'sports',
    isPublished: true,
    publishedAt: new Date('2025-09-15'),
  },
  {
    title: 'Science Fair 2024: Innovation and Discovery',
    titleFr: 'Foire aux Sciences 2024: Innovation et Découverte',
    content:
      'The annual science fair showcasing student projects and innovations will be held on November 15th, 2024. Students from all classes will present their research projects, experiments, and innovative solutions to real-world problems.',
    contentFr:
      'La foire aux sciences annuelle présentant les projets et innovations des étudiants aura lieu le 15 novembre 2024. Les étudiants de toutes les classes présenteront leurs projets de recherche, expériences et solutions innovantes aux problèmes du monde réel.',
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-10-01'),
  },
  {
    title: 'Parent-Teacher Meeting Schedule',
    titleFr: 'Calendrier des Réunions Parents-Enseignants',
    content:
      "Quarterly parent-teacher meetings will be held to discuss student progress. The first meeting is scheduled for October 20th, 2024. Parents are encouraged to attend to discuss their children's academic performance and development.",
    contentFr:
      'Des réunions parents-enseignants trimestrielles seront organisées pour discuter du progrès des étudiants. La première réunion est prévue pour le 20 octobre 2024. Les parents sont encouragés à y assister pour discuter de la performance académique et du développement de leurs enfants.',
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-09-20'),
  },
  {
    title: 'Library Week: Promoting Reading Culture',
    titleFr: 'Semaine de la Bibliothèque: Promouvoir la Culture de la Lecture',
    content:
      'Join us for Library Week from November 5th to 9th, 2024. Various activities including book readings, storytelling sessions, and literary competitions will be organized to promote reading culture among students.',
    contentFr:
      'Rejoignez-nous pour la Semaine de la Bibliothèque du 5 au 9 novembre 2024. Diverses activités, y compris des lectures de livres, des séances de contes et des compétitions littéraires, seront organisées pour promouvoir la culture de la lecture parmi les étudiants.',
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-10-15'),
  },
  {
    title: 'Environmental Awareness Campaign',
    titleFr: "Campagne de Sensibilisation à l'Environnement",
    content:
      'Our school is launching an environmental awareness campaign to promote sustainable practices. Students will participate in tree planting, waste management workshops, and environmental education programs.',
    contentFr:
      "Notre école lance une campagne de sensibilisation à l'environnement pour promouvoir des pratiques durables. Les étudiants participeront à la plantation d'arbres, des ateliers de gestion des déchets et des programmes d'éducation environnementale.",
    category: 'community',
    isPublished: true,
    publishedAt: new Date('2025-09-10'),
  },
  {
    title: 'Mathematics Olympiad Registration Open',
    titleFr: 'Inscription aux Olympiades de Mathématiques Ouverte',
    content:
      'Registration for the annual Mathematics Olympiad is now open. Students from Form 3 to Form 5 are eligible to participate. The competition will test problem-solving skills and mathematical reasoning.',
    contentFr:
      "L'inscription aux Olympiades de Mathématiques annuelles est maintenant ouverte. Les étudiants de la 3ème à la 5ème sont éligibles pour participer. La compétition testera les compétences de résolution de problèmes et le raisonnement mathématique.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-09-25'),
  },
  {
    title: 'Cultural Day Celebration',
    titleFr: 'Célébration de la Journée Culturelle',
    content:
      "Our annual Cultural Day will celebrate the rich diversity of Cameroon's cultures. Students will showcase traditional dances, music, art, and cuisine from different regions of the country.",
    contentFr:
      "Notre Journée Culturelle annuelle célébrera la riche diversité des cultures du Cameroun. Les étudiants présenteront des danses traditionnelles, de la musique, de l'art et de la cuisine de différentes régions du pays.",
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-10-05'),
  },
  // Achievement-related news items
  {
    title: 'GBHS XYZ Wins Regional Academic Excellence Award 2024',
    titleFr: "GBHS Remporte le Prix d'Excellence Académique Régionale 2024",
    content:
      'We are proud to announce that  "" has been awarded the Regional Academic Excellence Award for 2024. This recognition comes after our outstanding performance in regional and national examinations, with a 95% pass rate and numerous distinctions.',
    contentFr:
      "Nous sommes fiers d'annoncer que  le lycee de XYZ a reçu le Prix d'Excellence Académique Régionale pour 2024. Cette reconnaissance vient après notre performance exceptionnelle aux examens régionaux et nationaux, avec un taux de réussite de 95% et de nombreuses distinctions.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-08-15'),
  },
  {
    title: 'Students Win National Science Competition',
    titleFr: 'Les Étudiants Remportent la Compétition Nationale de Sciences',
    content:
      'Congratulations to our science team who won first place in the National Science Competition! Their innovative project on renewable energy solutions impressed the judges and demonstrated our commitment to scientific excellence.',
    contentFr:
      "Félicitations à notre équipe scientifique qui a remporté la première place à la Compétition Nationale de Sciences ! Leur projet innovant sur les solutions d'énergie renouvelable a impressionné les juges et démontré notre engagement envers l'excellence scientifique.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-07-20'),
  },
  {
    title: 'Bilingual Program Receives National Recognition',
    titleFr: 'Le Programme Bilingue Reçoit une Reconnaissance Nationale',
    content:
      'Our bilingual education program has been recognized as one of the best in Cameroon. The Ministry of Education commended our innovative approach to language learning and cultural integration.',
    contentFr:
      "Notre programme d'éducation bilingue a été reconnu comme l'un des meilleurs du Cameroun. Le Ministère de l'Éducation a salué notre approche innovante de l'apprentissage des langues et de l'intégration culturelle.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-06-10'),
  },
  {
    title: 'Football Team Wins Regional Championship',
    titleFr: "L'Équipe de Football Remporte le Championnat Régional",
    content:
      'Our school football team has won the regional championship for the third consecutive year! The team demonstrated exceptional skill, teamwork, and sportsmanship throughout the tournament.',
    contentFr:
      "Notre équipe de football scolaire a remporté le championnat régional pour la troisième année consécutive ! L'équipe a démontré un talent exceptionnel, un esprit d'équipe et un fair-play tout au long du tournoi.",
    category: 'sports',
    isPublished: true,
    publishedAt: new Date('2025-05-25'),
  },
  {
    title: 'Cultural Performance Wins National Award',
    titleFr: 'La Performance Culturelle Remporte un Prix National',
    content:
      'Our cultural dance troupe won the National Cultural Performance Award for their outstanding presentation of traditional Cameroonian dances. The performance showcased our rich cultural heritage.',
    contentFr:
      'Notre troupe de danse culturelle a remporté le Prix National de Performance Culturelle pour leur présentation exceptionnelle des danses traditionnelles camerounaises. La performance a mis en valeur notre riche patrimoine culturel.',
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-04-15'),
  },
  {
    title: 'Community Service Project Recognized',
    titleFr: 'Le Projet de Service Communautaire Reconnu',
    content:
      'Our community service initiative "Education for All" has been recognized by the local government for its positive impact on the community. Students provided free tutoring to underprivileged children.',
    contentFr:
      'Notre initiative de service communautaire "Éducation pour Tous" a été reconnue par le gouvernement local pour son impact positif sur la communauté. Les étudiants ont fourni des cours particuliers gratuits aux enfants défavorisés.',
    category: 'community',
    isPublished: true,
    publishedAt: new Date('2025-03-20'),
  },
  {
    title: 'Environmental Project Wins Green Award',
    titleFr: 'Le Projet Environnemental Remporte le Prix Vert',
    content:
      'Our environmental conservation project "Green Campus Initiative" has won the National Green Award. Students planted 500 trees and implemented a comprehensive recycling program.',
    contentFr:
      'Notre projet de conservation environnementale "Initiative Campus Vert" a remporté le Prix National Vert. Les étudiants ont planté 500 arbres et mis en place un programme de recyclage complet.',
    category: 'community',
    isPublished: true,
    publishedAt: new Date('2025-02-28'),
  },
  {
    title: 'Technology Integration Program Launched',
    titleFr: "Le Programme d'Intégration Technologique Lancé",
    content:
      'We are excited to announce the launch of our new Technology Integration Program. This initiative will provide students with cutting-edge digital tools and prepare them for the digital age.',
    contentFr:
      "Nous sommes ravis d'annoncer le lancement de notre nouveau Programme d'Intégration Technologique. Cette initiative fournira aux étudiants des outils numériques de pointe et les préparera à l'ère numérique.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-01-15'),
  },
  // Upcoming events
  {
    title: 'Upcoming: Annual Alumni Reunion 2024',
    titleFr: 'À Venir: Réunion Annuelle des Anciens 2024',
    content:
      "Join us for our annual alumni reunion on December 15th, 2024. This special event will bring together graduates from different years to celebrate our school's legacy and share success stories.",
    contentFr:
      "Rejoignez-nous pour notre réunion annuelle des anciens le 15 décembre 2024. Cet événement spécial réunira les diplômés de différentes années pour célébrer l'héritage de notre école et partager des histoires de réussite.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-11-01'),
  },
  {
    title: 'Upcoming: Career Guidance Workshop',
    titleFr: "À Venir: Atelier d'Orientation Professionnelle",
    content:
      'A comprehensive career guidance workshop will be held on November 30th, 2024. Industry professionals will share insights about various career paths and opportunities for our students.',
    contentFr:
      "Un atelier complet d'orientation professionnelle aura lieu le 30 novembre 2024. Des professionnels du secteur partageront des informations sur diverses carrières et opportunités pour nos étudiants.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-10-20'),
  },
  {
    title: 'Upcoming: International Exchange Program',
    titleFr: "À Venir: Programme d'Échange International",
    content:
      'We are launching an international exchange program with partner schools in France and Canada. Students will have the opportunity to experience different cultures and educational systems.',
    contentFr:
      "Nous lançons un programme d'échange international avec des écoles partenaires en France et au Canada. Les étudiants auront l'opportunité d'expérimenter différentes cultures et systèmes éducatifs.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-09-30'),
  },
  // Additional news for pagination testing
  {
    title: 'New Computer Lab Equipment Installed',
    titleFr: 'Nouveau Matériel de Salle Informatique Installé',
    content:
      'Our computer laboratory has been upgraded with the latest technology including 50 new computers, interactive whiteboards, and high-speed internet connectivity. This upgrade will enhance our students digital literacy skills.',
    contentFr:
      'Notre laboratoire informatique a été modernisé avec la dernière technologie, y compris 50 nouveaux ordinateurs, des tableaux blancs interactifs et une connectivité Internet haute vitesse. Cette mise à niveau améliorera les compétences numériques de nos étudiants.',
    category: 'infrastructure',
    isPublished: true,
    publishedAt: new Date('2025-08-10'),
  },
  {
    title: 'School Library Expansion Completed',
    titleFr: "L'Expansion de la Bibliothèque Scolaire Terminée",
    content:
      'The school library expansion project has been completed successfully. The new facility includes a reading room, study areas, and a digital resources section with access to online databases and e-books.',
    contentFr:
      "Le projet d'expansion de la bibliothèque scolaire a été mené à bien avec succès. La nouvelle installation comprend une salle de lecture, des espaces d'étude et une section de ressources numériques avec accès aux bases de données en ligne et aux livres électroniques.",
    category: 'infrastructure',
    isPublished: true,
    publishedAt: new Date('2025-07-25'),
  },
  {
    title: 'Sports Complex Renovation Begins',
    titleFr: 'La Rénovation du Complexe Sportif Commence',
    content:
      'Renovation work has begun on our sports complex. The project includes upgrading the football field, basketball courts, and adding new facilities for athletics and indoor sports.',
    contentFr:
      "Les travaux de rénovation ont commencé sur notre complexe sportif. Le projet comprend la modernisation du terrain de football, des courts de basketball et l'ajout de nouvelles installations pour l'athlétisme et les sports en salle.",
    category: 'infrastructure',
    isPublished: true,
    publishedAt: new Date('2025-07-15'),
  },
  {
    title: 'Student Council Elections Results',
    titleFr: 'Résultats des Élections du Conseil des Étudiants',
    content:
      'The annual student council elections have concluded. Congratulations to the newly elected representatives who will serve as the voice of the student body and work towards improving school life.',
    contentFr:
      'Les élections annuelles du conseil des étudiants ont pris fin. Félicitations aux nouveaux représentants élus qui serviront de voix au corps étudiant et travailleront à améliorer la vie scolaire.',
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-06-20'),
  },
  {
    title: 'Teacher Professional Development Workshop',
    titleFr: 'Atelier de Développement Professionnel des Enseignants',
    content:
      'Our teaching staff participated in a comprehensive professional development workshop focused on modern teaching methodologies, technology integration, and student engagement strategies.',
    contentFr:
      "Notre personnel enseignant a participé à un atelier complet de développement professionnel axé sur les méthodologies d'enseignement modernes, l'intégration technologique et les stratégies d'engagement des étudiants.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-06-05'),
  },
  {
    title: 'School Canteen Menu Improvements',
    titleFr: 'Améliorations du Menu de la Cantine Scolaire',
    content:
      'The school canteen has introduced new healthy menu options with a focus on balanced nutrition. The new menu includes more fruits, vegetables, and locally sourced ingredients.',
    contentFr:
      "La cantine scolaire a introduit de nouvelles options de menu saines avec un accent sur la nutrition équilibrée. Le nouveau menu comprend plus de fruits, légumes et ingrédients d'origine locale.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-05-30'),
  },
  {
    title: 'Music and Arts Festival Success',
    titleFr: "Succès du Festival de Musique et d'Arts",
    content:
      'Our annual Music and Arts Festival was a tremendous success, showcasing the incredible talents of our students in music, dance, drama, and visual arts. The event attracted over 500 attendees.',
    contentFr:
      "Notre Festival annuel de Musique et d'Arts a été un succès retentissant, présentant les talents incroyables de nos étudiants en musique, danse, théâtre et arts visuels. L'événement a attiré plus de 500 participants.",
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-05-15'),
  },
  {
    title: 'School Bus Service Expansion',
    titleFr: 'Expansion du Service de Bus Scolaire',
    content:
      'We are pleased to announce the expansion of our school bus service to cover more routes and accommodate more students. This will improve accessibility and reduce transportation challenges for families.',
    contentFr:
      "Nous sommes heureux d'annoncer l'expansion de notre service de bus scolaire pour couvrir plus d'itinéraires et accueillir plus d'étudiants. Cela améliorera l'accessibilité et réduira les défis de transport pour les familles.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-05-10'),
  },
  {
    title: 'Student Achievement Awards Ceremony',
    titleFr: 'Cérémonie de Remise des Prix de Réussite des Étudiants',
    content:
      'The annual Student Achievement Awards Ceremony recognized outstanding academic performance, leadership, and community service. Over 100 students received awards in various categories.',
    contentFr:
      'La cérémonie annuelle de remise des prix de réussite des étudiants a reconnu les performances académiques exceptionnelles, le leadership et le service communautaire. Plus de 100 étudiants ont reçu des prix dans diverses catégories.',
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-04-25'),
  },
  {
    title: 'School Website Redesign Launch',
    titleFr: "Lancement de la Refonte du Site Web de l'École",
    content:
      'Our school website has been completely redesigned with a modern, user-friendly interface. The new website provides better access to information for students, parents, and the community.',
    contentFr:
      "Le site web de notre école a été complètement repensé avec une interface moderne et conviviale. Le nouveau site web offre un meilleur accès à l'information pour les étudiants, les parents et la communauté.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-04-20'),
  },
  {
    title: 'Parent-Teacher Association Meeting',
    titleFr: "Réunion de l'Association Parents-Enseignants",
    content:
      "The Parent-Teacher Association held its quarterly meeting to discuss school improvements, upcoming events, and ways to enhance parent involvement in their children's education.",
    contentFr:
      "L'Association Parents-Enseignants a tenu sa réunion trimestrielle pour discuter des améliorations scolaires, des événements à venir et des moyens d'améliorer l'implication des parents dans l'éducation de leurs enfants.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-04-10'),
  },
  {
    title: 'School Security Enhancement',
    titleFr: 'Amélioration de la Sécurité Scolaire',
    content:
      'We have implemented enhanced security measures including CCTV cameras, access control systems, and security personnel to ensure the safety of all students and staff.',
    contentFr:
      "Nous avons mis en place des mesures de sécurité renforcées, y compris des caméras de surveillance, des systèmes de contrôle d'accès et du personnel de sécurité pour assurer la sécurité de tous les étudiants et du personnel.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-03-30'),
  },
  {
    title: 'Student Leadership Training Program',
    titleFr: 'Programme de Formation au Leadership des Étudiants',
    content:
      'A comprehensive leadership training program has been launched for student leaders. The program focuses on developing communication skills, problem-solving abilities, and ethical leadership.',
    contentFr:
      'Un programme complet de formation au leadership a été lancé pour les leaders étudiants. Le programme se concentre sur le développement des compétences en communication, des capacités de résolution de problèmes et du leadership éthique.',
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-03-15'),
  },
  {
    title: 'School Health Clinic Opening',
    titleFr: 'Ouverture de la Clinique de Santé Scolaire',
    content:
      'Our new school health clinic is now operational, providing basic health services, first aid, and health education to students. The clinic is staffed by qualified health professionals.',
    contentFr:
      'Notre nouvelle clinique de santé scolaire est maintenant opérationnelle, fournissant des services de santé de base, des premiers soins et une éducation à la santé aux étudiants. La clinique est dotée de professionnels de santé qualifiés.',
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-03-05'),
  },
  {
    title: 'International Day Celebration',
    titleFr: 'Célébration de la Journée Internationale',
    content:
      'Students celebrated International Day with cultural presentations, traditional costumes, and international cuisine. The event promoted global awareness and cultural appreciation.',
    contentFr:
      "Les étudiants ont célébré la Journée Internationale avec des présentations culturelles, des costumes traditionnels et une cuisine internationale. L'événement a promu la sensibilisation mondiale et l'appréciation culturelle.",
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-02-20'),
  },
  {
    title: 'School Newsletter Launch',
    titleFr: "Lancement du Bulletin d'Information Scolaire",
    content:
      'We are launching a monthly school newsletter to keep parents and the community informed about school activities, achievements, and important announcements.',
    contentFr:
      "Nous lançons un bulletin d'information scolaire mensuel pour tenir les parents et la communauté informés des activités scolaires, des réalisations et des annonces importantes.",
    category: 'general',
    isPublished: true,
    publishedAt: new Date('2025-02-10'),
  },
  {
    title: 'Student Mentoring Program',
    titleFr: 'Programme de Mentorat des Étudiants',
    content:
      'A new student mentoring program has been established, pairing senior students with junior students to provide academic guidance, emotional support, and friendship.',
    contentFr:
      "Un nouveau programme de mentorat des étudiants a été établi, jumelant des étudiants seniors avec des étudiants juniors pour fournir des conseils académiques, un soutien émotionnel et de l'amitié.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-02-05'),
  },
  {
    title: 'School Garden Project Success',
    titleFr: 'Succès du Projet de Jardin Scolaire',
    content:
      'Our school garden project has been a great success, teaching students about sustainable agriculture, environmental conservation, and healthy eating habits.',
    contentFr:
      "Notre projet de jardin scolaire a été un grand succès, enseignant aux étudiants l'agriculture durable, la conservation de l'environnement et les habitudes alimentaires saines.",
    category: 'community',
    isPublished: true,
    publishedAt: new Date('2025-01-25'),
  },
  {
    title: 'School Band Performance',
    titleFr: 'Performance de la Fanfare Scolaire',
    content:
      'Our school band performed at the regional music festival and received high praise for their musical talent and dedication. The band includes students from all grade levels.',
    contentFr:
      'Notre fanfare scolaire a performé au festival de musique régional et a reçu de vives louanges pour leur talent musical et leur dévouement. La fanfare comprend des étudiants de tous les niveaux.',
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-01-20'),
  },
  {
    title: 'School Photography Club Exhibition',
    titleFr: 'Exposition du Club de Photographie Scolaire',
    content:
      'The school photography club held its annual exhibition showcasing student photography skills. The exhibition featured landscapes, portraits, and creative compositions.',
    contentFr:
      "Le club de photographie scolaire a tenu son exposition annuelle présentant les compétences photographiques des étudiants. L'exposition présentait des paysages, des portraits et des compositions créatives.",
    category: 'cultural',
    isPublished: true,
    publishedAt: new Date('2025-01-15'),
  },
  {
    title: 'School Chess Tournament',
    titleFr: "Tournoi d'Échecs Scolaire",
    content:
      'Our annual chess tournament attracted over 50 participants from different classes. The tournament promotes strategic thinking, concentration, and friendly competition.',
    contentFr:
      "Notre tournoi d'échecs annuel a attiré plus de 50 participants de différentes classes. Le tournoi promeut la pensée stratégique, la concentration et la compétition amicale.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-01-10'),
  },
  {
    title: 'School Debate Competition',
    titleFr: 'Compétition de Débat Scolaire',
    content:
      'The school debate competition featured teams from all classes discussing current social issues. The event improved public speaking skills and critical thinking abilities.',
    contentFr:
      "La compétition de débat scolaire a présenté des équipes de toutes les classes discutant des problèmes sociaux actuels. L'événement a amélioré les compétences en prise de parole en public et les capacités de pensée critique.",
    category: 'academic',
    isPublished: true,
    publishedAt: new Date('2025-01-05'),
  },
];

// Sample gallery data
const sampleGallery = [
  {
    title: 'School Building Front View',
    titleFr: 'Vue de Face du Bâtiment Scolaire',
    description:
      'The main entrance of  GBHS XYZ showing the beautiful architecture and welcoming environment for students.',
    descriptionFr:
      "L'entrée principale du GBHS XYZ montrant la belle architecture et l'environnement accueillant pour les étudiants.",
    imageUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
  {
    title: 'Students in Classroom',
    titleFr: 'Étudiants en Classe',
    description:
      'Students actively engaged in learning activities in our modern classrooms equipped with the latest educational technology.',
    descriptionFr:
      "Étudiants activement engagés dans des activités d'apprentissage dans nos salles de classe modernes équipées de la dernière technologie éducative.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'Science Laboratory',
    titleFr: 'Laboratoire de Sciences',
    description:
      'Our well-equipped science laboratory where students conduct experiments and develop their scientific skills.',
    descriptionFr:
      'Notre laboratoire de sciences bien équipé où les étudiants mènent des expériences et développent leurs compétences scientifiques.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Sports Field',
    titleFr: 'Terrain de Sport',
    description:
      'The school sports field where students participate in various athletic activities and competitions.',
    descriptionFr:
      "Le terrain de sport de l'école où les étudiants participent à diverses activités athlétiques et compétitions.",
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    category: 'sports',
    isPublished: true,
  },
  {
    title: 'Library Interior',
    titleFr: 'Intérieur de la Bibliothèque',
    description:
      'Our comprehensive library with a vast collection of books, digital resources, and study spaces for students.',
    descriptionFr:
      "Notre bibliothèque complète avec une vaste collection de livres, ressources numériques et espaces d'étude pour les étudiants.",
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Computer Lab',
    titleFr: 'Salle Informatique',
    description:
      'Modern computer laboratory with the latest technology to prepare students for the digital age.',
    descriptionFr:
      "Laboratoire informatique moderne avec la dernière technologie pour préparer les étudiants à l'ère numérique.",
    imageUrl:
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Students at Assembly',
    titleFr: 'Étudiants en Assemblée',
    description:
      'Students gathered for morning assembly, promoting unity and school spirit.',
    descriptionFr:
      "Étudiants rassemblés pour l'assemblée du matin, promouvant l'unité et l'esprit scolaire.",
    imageUrl:
      'https://images.unsplash.com/photo-1523240794102-9c5f2c2b0d8a?w=800&h=600&fit=crop&auto=format&q=80',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'Cultural Performance',
    titleFr: 'Performance Culturelle',
    description:
      'Students performing traditional dances during cultural celebrations.',
    descriptionFr:
      'Étudiants exécutant des danses traditionnelles pendant les célébrations culturelles.',
    imageUrl:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    category: 'cultural',
    isPublished: true,
  },
  {
    title: 'Science Fair Projects',
    titleFr: 'Projets de la Foire aux Sciences',
    description:
      'Students showcasing their innovative science projects at the annual science fair.',
    descriptionFr:
      'Étudiants présentant leurs projets scientifiques innovants à la foire aux sciences annuelle.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Garden',
    titleFr: "Jardin de l'École",
    description:
      'The school garden where students learn about agriculture and environmental sustainability.',
    descriptionFr:
      "Le jardin de l'école où les étudiants apprennent l'agriculture et la durabilité environnementale.",
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    category: 'environmental',
    isPublished: true,
  },
  // Additional gallery images for pagination testing
  {
    title: 'Basketball Court',
    titleFr: 'Terrain de Basketball',
    description:
      'Our indoor basketball court where students practice and compete in basketball tournaments.',
    descriptionFr:
      "Notre terrain de basketball en salle où les étudiants s'entraînent et participent à des tournois de basketball.",
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
    category: 'sports',
    isPublished: true,
  },
  {
    title: 'Chemistry Lab Equipment',
    titleFr: 'Équipement de Laboratoire de Chimie',
    description:
      'Advanced chemistry laboratory equipment for conducting experiments and research.',
    descriptionFr:
      'Équipement de laboratoire de chimie avancé pour mener des expériences et des recherches.',
    imageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Auditorium',
    titleFr: "Auditorium de l'École",
    description:
      'Our spacious auditorium for school assemblies, performances, and special events.',
    descriptionFr:
      'Notre auditorium spacieux pour les assemblées scolaires, performances et événements spéciaux.',
    imageUrl:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Student Art Exhibition',
    titleFr: "Exposition d'Art des Étudiants",
    description:
      'Annual student art exhibition showcasing creative works in various mediums.',
    descriptionFr:
      "Exposition d'art annuelle des étudiants présentant des œuvres créatives dans divers médiums.",
    imageUrl:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=800&h=600&fit=crop',
    category: 'cultural',
    isPublished: true,
  },
  {
    title: 'School Cafeteria',
    titleFr: "Cafétéria de l'École",
    description:
      'Modern cafeteria providing healthy meals and a comfortable dining environment.',
    descriptionFr:
      'Cafétéria moderne fournissant des repas sains et un environnement de restauration confortable.',
    imageUrl:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Athletics Track',
    titleFr: "Piste d'Athlétisme",
    description:
      'Professional athletics track for training and competitions in various track events.',
    descriptionFr:
      "Piste d'athlétisme professionnelle pour l'entraînement et les compétitions dans divers événements de piste.",
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    category: 'sports',
    isPublished: true,
  },
  {
    title: 'Music Room',
    titleFr: 'Salle de Musique',
    description:
      'Dedicated music room with instruments and equipment for music education and practice.',
    descriptionFr:
      "Salle de musique dédiée avec instruments et équipements pour l'éducation musicale et la pratique.",
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Bus Fleet',
    titleFr: 'Flotte de Bus Scolaires',
    description:
      'Our fleet of school buses providing safe transportation for students.',
    descriptionFr:
      'Notre flotte de bus scolaires fournissant un transport sécurisé pour les étudiants.',
    imageUrl:
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
  {
    title: 'Student Council Meeting',
    titleFr: 'Réunion du Conseil des Étudiants',
    description:
      'Student council members discussing school improvements and student welfare.',
    descriptionFr:
      'Membres du conseil des étudiants discutant des améliorations scolaires et du bien-être des étudiants.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Clinic',
    titleFr: 'Clinique Scolaire',
    description:
      'School health clinic providing basic medical care and health education.',
    descriptionFr:
      'Clinique de santé scolaire fournissant des soins médicaux de base et une éducation à la santé.',
    imageUrl:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'Environmental Club Activity',
    titleFr: 'Activité du Club Environnemental',
    description:
      'Environmental club members participating in tree planting and conservation activities.',
    descriptionFr:
      "Membres du club environnemental participant à la plantation d'arbres et aux activités de conservation.",
    imageUrl:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    category: 'environmental',
    isPublished: true,
  },
  {
    title: 'School Security Post',
    titleFr: 'Poste de Sécurité Scolaire',
    description:
      'Security personnel ensuring the safety and well-being of all students and staff.',
    descriptionFr:
      'Personnel de sécurité assurant la sécurité et le bien-être de tous les étudiants et du personnel.',
    imageUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
  {
    title: 'Student Leadership Workshop',
    titleFr: 'Atelier de Leadership des Étudiants',
    description:
      'Leadership training workshop for student representatives and club leaders.',
    descriptionFr:
      'Atelier de formation au leadership pour les représentants étudiants et les leaders de clubs.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Newsletter Team',
    titleFr: 'Équipe du Bulletin Scolaire',
    description:
      'Students working on the school newsletter, developing journalism and communication skills.',
    descriptionFr:
      'Étudiants travaillant sur le bulletin scolaire, développant des compétences en journalisme et communication.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Photography Club',
    titleFr: 'Club de Photographie Scolaire',
    description:
      'Photography club members learning and practicing photography skills.',
    descriptionFr:
      'Membres du club de photographie apprenant et pratiquant les compétences photographiques.',
    imageUrl:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=800&h=600&fit=crop',
    category: 'cultural',
    isPublished: true,
  },
  {
    title: 'School Chess Club',
    titleFr: "Club d'Échecs Scolaire",
    description:
      'Chess club members participating in strategic games and tournaments.',
    descriptionFr:
      "Membres du club d'échecs participant à des jeux stratégiques et des tournois.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Debate Team',
    titleFr: 'Équipe de Débat Scolaire',
    description:
      'Debate team members practicing public speaking and critical thinking skills.',
    descriptionFr:
      "Membres de l'équipe de débat pratiquant les compétences de prise de parole en public et de pensée critique.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Band Practice',
    titleFr: 'Répétition de la Fanfare Scolaire',
    description:
      'School band members practicing musical instruments and preparing for performances.',
    descriptionFr:
      'Membres de la fanfare scolaire pratiquant des instruments de musique et se préparant pour les performances.',
    imageUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    category: 'cultural',
    isPublished: true,
  },
  {
    title: 'School Drama Club',
    titleFr: 'Club de Théâtre Scolaire',
    description:
      'Drama club members rehearsing plays and developing acting skills.',
    descriptionFr:
      "Membres du club de théâtre répétant des pièces et développant des compétences d'acteur.",
    imageUrl:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    category: 'cultural',
    isPublished: true,
  },
  {
    title: 'School Science Club',
    titleFr: 'Club de Sciences Scolaire',
    description:
      'Science club members conducting experiments and exploring scientific concepts.',
    descriptionFr:
      'Membres du club de sciences menant des expériences et explorant des concepts scientifiques.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Mathematics Club',
    titleFr: 'Club de Mathématiques Scolaire',
    description:
      'Mathematics club members solving complex problems and participating in competitions.',
    descriptionFr:
      'Membres du club de mathématiques résolvant des problèmes complexes et participant à des compétitions.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Language Club',
    titleFr: 'Club de Langues Scolaire',
    description:
      'Language club members practicing different languages and cultural exchange.',
    descriptionFr:
      'Membres du club de langues pratiquant différentes langues et échange culturel.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Sports Club',
    titleFr: 'Club Sportif Scolaire',
    description:
      'Sports club members training in various athletic activities and team sports.',
    descriptionFr:
      "Membres du club sportif s'entraînant dans diverses activités athlétiques et sports d'équipe.",
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    category: 'sports',
    isPublished: true,
  },
  {
    title: 'School Technology Club',
    titleFr: 'Club de Technologie Scolaire',
    description:
      'Technology club members learning programming, robotics, and digital skills.',
    descriptionFr:
      'Membres du club de technologie apprenant la programmation, la robotique et les compétences numériques.',
    imageUrl:
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Community Service',
    titleFr: 'Service Communautaire Scolaire',
    description:
      'Students participating in community service activities and volunteer work.',
    descriptionFr:
      'Étudiants participant à des activités de service communautaire et de bénévolat.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'community',
    isPublished: true,
  },
  {
    title: 'School Alumni Meeting',
    titleFr: 'Réunion des Anciens Élèves',
    description:
      'Alumni gathering to share experiences and maintain connections with the school.',
    descriptionFr:
      "Rassemblement d'anciens élèves pour partager des expériences et maintenir des liens avec l'école.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'general',
    isPublished: true,
  },
  {
    title: 'School Awards Ceremony',
    titleFr: 'Cérémonie de Remise des Prix Scolaire',
    description:
      'Annual awards ceremony recognizing outstanding achievements and contributions.',
    descriptionFr:
      'Cérémonie annuelle de remise des prix reconnaissant les réalisations et contributions exceptionnelles.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Graduation Ceremony',
    titleFr: 'Cérémonie de Remise des Diplômes',
    description:
      'Graduation ceremony celebrating the achievements of graduating students.',
    descriptionFr:
      'Cérémonie de remise des diplômes célébrant les réalisations des étudiants diplômés.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Open Day',
    titleFr: 'Journée Portes Ouvertes',
    description:
      'Open day event showcasing school facilities and programs to prospective students and parents.',
    descriptionFr:
      'Événement de journée portes ouvertes présentant les installations et programmes scolaires aux futurs étudiants et parents.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'general',
    isPublished: true,
  },
  {
    title: 'School Parent Meeting',
    titleFr: 'Réunion des Parents',
    description:
      'Regular parent meetings to discuss student progress and school development.',
    descriptionFr:
      'Réunions régulières des parents pour discuter du progrès des étudiants et du développement scolaire.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'general',
    isPublished: true,
  },
  {
    title: 'School Teacher Training',
    titleFr: 'Formation des Enseignants',
    description:
      'Professional development training for teachers to enhance teaching skills and methodologies.',
    descriptionFr:
      "Formation de développement professionnel pour les enseignants afin d'améliorer les compétences et méthodologies d'enseignement.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Library Reading Session',
    titleFr: 'Séance de Lecture à la Bibliothèque',
    description:
      'Students participating in reading sessions and literary activities in the school library.',
    descriptionFr:
      'Étudiants participant à des séances de lecture et activités littéraires dans la bibliothèque scolaire.',
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Computer Class',
    titleFr: "Cours d'Informatique",
    description:
      'Students learning computer skills and digital literacy in our modern computer lab.',
    descriptionFr:
      'Étudiants apprenant les compétences informatiques et la littératie numérique dans notre laboratoire informatique moderne.',
    imageUrl:
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
    category: 'academic',
    isPublished: true,
  },
  {
    title: 'School Physics Lab',
    titleFr: 'Laboratoire de Physique',
    description:
      'Physics laboratory where students conduct experiments and learn scientific principles.',
    descriptionFr:
      'Laboratoire de physique où les étudiants mènent des expériences et apprennent les principes scientifiques.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Biology Lab',
    titleFr: 'Laboratoire de Biologie',
    description:
      'Biology laboratory equipped for studying living organisms and biological processes.',
    descriptionFr:
      'Laboratoire de biologie équipé pour étudier les organismes vivants et les processus biologiques.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Geography Room',
    titleFr: 'Salle de Géographie',
    description:
      'Geography classroom with maps, globes, and geographical learning resources.',
    descriptionFr:
      "Salle de classe de géographie avec cartes, globes et ressources d'apprentissage géographique.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School History Museum',
    titleFr: "Musée d'Histoire Scolaire",
    description:
      'School history museum showcasing historical artifacts and educational exhibits.',
    descriptionFr:
      "Musée d'histoire scolaire présentant des artefacts historiques et des expositions éducatives.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Art Studio',
    titleFr: "Studio d'Art Scolaire",
    description:
      'Art studio where students create paintings, sculptures, and other artistic works.',
    descriptionFr:
      "Studio d'art où les étudiants créent des peintures, sculptures et autres œuvres artistiques.",
    imageUrl:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Dance Studio',
    titleFr: 'Studio de Danse Scolaire',
    description:
      'Dance studio for dance classes, rehearsals, and cultural performances.',
    descriptionFr:
      'Studio de danse pour les cours de danse, répétitions et performances culturelles.',
    imageUrl:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Meditation Room',
    titleFr: 'Salle de Méditation Scolaire',
    description:
      'Quiet meditation room for students to practice mindfulness and relaxation.',
    descriptionFr:
      'Salle de méditation calme pour que les étudiants pratiquent la pleine conscience et la relaxation.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Prayer Room',
    titleFr: 'Salle de Prière Scolaire',
    description:
      'Multi-faith prayer room for students to practice their religious beliefs.',
    descriptionFr:
      'Salle de prière multi-confessionnelle pour que les étudiants pratiquent leurs croyances religieuses.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Counseling Office',
    titleFr: 'Bureau de Counseling Scolaire',
    description:
      'Counseling office providing guidance and support to students and their families.',
    descriptionFr:
      'Bureau de counseling fournissant des conseils et un soutien aux étudiants et leurs familles.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Administrative Office',
    titleFr: 'Bureau Administratif Scolaire',
    description:
      'Main administrative office handling school operations and student services.',
    descriptionFr:
      'Bureau administratif principal gérant les opérations scolaires et les services aux étudiants.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Staff Room',
    titleFr: 'Salle du Personnel Scolaire',
    description:
      'Staff room where teachers can relax, prepare lessons, and collaborate.',
    descriptionFr:
      'Salle du personnel où les enseignants peuvent se détendre, préparer les leçons et collaborer.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Maintenance Workshop',
    titleFr: 'Atelier de Maintenance Scolaire',
    description:
      'Maintenance workshop for school equipment and facility repairs.',
    descriptionFr:
      "Atelier de maintenance pour l'équipement scolaire et les réparations d'installations.",
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Storage Facility',
    titleFr: 'Installation de Stockage Scolaire',
    description:
      'Storage facility for school supplies, equipment, and materials.',
    descriptionFr:
      'Installation de stockage pour les fournitures, équipements et matériaux scolaires.',
    imageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
    category: 'facilities',
    isPublished: true,
  },
  {
    title: 'School Parking Area',
    titleFr: 'Zone de Stationnement Scolaire',
    description:
      'Designated parking area for staff, visitors, and school vehicles.',
    descriptionFr:
      'Zone de stationnement désignée pour le personnel, les visiteurs et les véhicules scolaires.',
    imageUrl:
      'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
  {
    title: 'School Entrance Gate',
    titleFr: "Porte d'Entrée Scolaire",
    description:
      'Main entrance gate with security checkpoints and visitor registration.',
    descriptionFr:
      "Porte d'entrée principale avec points de contrôle de sécurité et enregistrement des visiteurs.",
    imageUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
  {
    title: 'School Emergency Exit',
    titleFr: "Sortie d'Urgence Scolaire",
    description:
      'Emergency exit routes and safety equipment for student and staff safety.',
    descriptionFr:
      "Voies de sortie d'urgence et équipements de sécurité pour la sécurité des étudiants et du personnel.",
    imageUrl:
      'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    category: 'infrastructure',
    isPublished: true,
  },
];

// Sample users (with cuids)
const sampleUsers = [
  {
    id: userIds.admin,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Administrator',
    email: 'lyceebilinguebafia@gmail.com',
  },
  {
    id: userIds.super_admin,
    username: 'super_admin',
    password: 'admin123',
    role: 'super_admin',
    fullName: 'Super Administrator',
    email: 'lyceebilinguebafia@gmail.com',
  },
  {
    id: userIds.teacher1,
    username: 'teacher1',
    password: 'teacher123',
    role: 'teacher',
    fullName: 'John Doe',
    email: 'lyceebilinguebafia@gmail.com',
    teacherSubject: 'Mathematics',
  },
  {
    id: userIds.teacher2,
    username: 'teacher2',
    password: 'teacher123',
    role: 'teacher',
    fullName: 'Jane Smith',
    email: 'lyceebilinguebafia@gmail.com',
    teacherSubject: 'Physics',
  },
  {
    id: userIds.teacher3,
    username: 'teacher3',
    password: 'teacher123',
    role: 'teacher',
    fullName: 'Michael Johnson',
    email: 'lyceebilinguebafia@gmail.com',
    teacherSubject: 'Chemistry',
  },
];

// Sample students (with cuids)
const sampleStudents = [
  {
    id: studentIds.GBHS2024001,
    studentId: 'GBHS2024001',
    password: 'student123',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+237612345678',
    className: 'Form 1A',
    gender: 'female',
    dateOfBirth: new Date('2008-03-15'),
    parentName: 'Robert Johnson',
    parentEmail: 'robert.johnson@example.com',
    parentPhone: '+237612345679',
    address: '123 Main Street, Bafia',
    isActive: true,
  },
  {
    id: studentIds.GBHS2024002,
    studentId: 'GBHS2024002',
    password: 'student123',
    fullName: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+237612345680',
    className: 'Form 1A',
    gender: 'male',
    dateOfBirth: new Date('2008-07-22'),
    parentName: 'Mary Smith',
    parentEmail: 'mary.smith@example.com',
    parentPhone: '+237612345681',
    address: '456 Oak Avenue, Bafia',
    isActive: true,
  },
  {
    id: studentIds.GBHS2024003,
    studentId: 'GBHS2024003',
    password: 'student123',
    fullName: 'Carol Davis',
    email: 'carol.davis@example.com',
    phone: '+237612345682',
    className: 'Form 1B',
    gender: 'female',
    dateOfBirth: new Date('2008-11-08'),
    parentName: 'James Davis',
    parentEmail: 'james.davis@example.com',
    parentPhone: '+237612345683',
    address: '789 Pine Road, Bafia',
    isActive: true,
  },
  {
    id: studentIds.GBHS2024004,
    studentId: 'GBHS2024004',
    password: 'student123',
    fullName: 'David Wilson',
    email: 'david.wilson@example.com',
    phone: '+237612345684',
    className: 'Form 1B',
    gender: 'male',
    dateOfBirth: new Date('2008-05-12'),
    parentName: 'Sarah Wilson',
    parentEmail: 'sarah.wilson@example.com',
    parentPhone: '+237612345685',
    address: '321 Elm Street, Bafia',
    isActive: true,
  },
  {
    id: studentIds.GBHS2024005,
    studentId: 'GBHS2024005',
    password: 'student123',
    fullName: 'Eva Brown',
    email: 'eva.brown@example.com',
    phone: '+237612345686',
    className: 'Form 2A',
    gender: 'female',
    dateOfBirth: new Date('2007-09-30'),
    parentName: 'Thomas Brown',
    parentEmail: 'thomas.brown@example.com',
    parentPhone: '+237612345687',
    address: '654 Maple Drive, Bafia',
    isActive: true,
  },
];

// Sample grade reports (with cuids and teacherId cuids)
const sampleGradeReports = [
  {
    id: gradeReportIds.math,
    teacherId: userIds.teacher1,
    className: 'Form 1A',
    subject: 'Mathematics',
    academicYear: '2025-2026',
    term: 'First Term',
    gradingPeriod: 'Sequence 1',
    coursesExpected: 8,
    coursesDone: 6,
    expectedPeriodHours: 40,
    periodHoursDone: 32,
    tpTdExpected: 4,
    tpTdDone: 3,
    isFinalized: false,
  },
  {
    id: gradeReportIds.physics,
    teacherId: userIds.teacher2,
    className: 'Form 1A',
    subject: 'Physics',
    academicYear: '2025-2026',
    term: 'First Term',
    gradingPeriod: 'Sequence 1',
    coursesExpected: 6,
    coursesDone: 5,
    expectedPeriodHours: 30,
    periodHoursDone: 25,
    tpTdExpected: 3,
    tpTdDone: 2,
    isFinalized: false,
  },
  {
    id: gradeReportIds.chemistry,
    teacherId: userIds.teacher3,
    className: 'Form 1A',
    subject: 'Chemistry',
    academicYear: '2025-2026',
    term: 'First Term',
    gradingPeriod: 'Sequence 1',
    coursesExpected: 7,
    coursesDone: 6,
    expectedPeriodHours: 35,
    periodHoursDone: 30,
    tpTdExpected: 4,
    tpTdDone: 3,
    isFinalized: false,
  },
];

// Sample student grades (with gradeReportId cuids)
const sampleStudentGrades = [
  // Form 1A Mathematics grades
  {
    gradeReportId: gradeReportIds.math,
    studentName: 'Alice Johnson',
    gender: 'female',
    matricule: '001',
    grade: 15,
    remarks: 'Excellent work',
  },
  {
    gradeReportId: gradeReportIds.math,
    studentName: 'Bob Smith',
    gender: 'male',
    matricule: '002',
    grade: 12,
    remarks: 'Good progress',
  },
  {
    gradeReportId: gradeReportIds.math,
    studentName: 'Carol Davis',
    gender: 'female',
    matricule: '003',
    grade: 18,
    remarks: 'Outstanding performance',
  },
  {
    gradeReportId: gradeReportIds.math,
    studentName: 'David Wilson',
    gender: 'male',
    matricule: '004',
    grade: 10,
    remarks: 'Needs improvement',
  },
  {
    gradeReportId: gradeReportIds.math,
    studentName: 'Eva Brown',
    gender: 'female',
    matricule: '005',
    grade: 14,
    remarks: 'Very good work',
  },

  // Form 1A Physics grades
  {
    gradeReportId: gradeReportIds.physics,
    studentName: 'Alice Johnson',
    gender: 'female',
    matricule: '001',
    grade: 16,
    remarks: 'Excellent understanding',
  },
  {
    gradeReportId: gradeReportIds.physics,
    studentName: 'Bob Smith',
    gender: 'male',
    matricule: '002',
    grade: 13,
    remarks: 'Good effort',
  },
  {
    gradeReportId: gradeReportIds.physics,
    studentName: 'Carol Davis',
    gender: 'female',
    matricule: '003',
    grade: 17,
    remarks: 'Exceptional work',
  },
  {
    gradeReportId: gradeReportIds.physics,
    studentName: 'David Wilson',
    gender: 'male',
    matricule: '004',
    grade: 11,
    remarks: 'Keep practicing',
  },
  {
    gradeReportId: gradeReportIds.physics,
    studentName: 'Eva Brown',
    gender: 'female',
    matricule: '005',
    grade: 15,
    remarks: 'Very good performance',
  },

  // Form 1A Chemistry grades
  {
    gradeReportId: gradeReportIds.chemistry,
    studentName: 'Alice Johnson',
    gender: 'female',
    matricule: '001',
    grade: 14,
    remarks: 'Good work',
  },
  {
    gradeReportId: gradeReportIds.chemistry,
    studentName: 'Bob Smith',
    gender: 'male',
    matricule: '002',
    grade: 16,
    remarks: 'Excellent progress',
  },
  {
    gradeReportId: gradeReportIds.chemistry,
    studentName: 'Carol Davis',
    gender: 'female',
    matricule: '003',
    grade: 19,
    remarks: 'Outstanding achievement',
  },
  {
    gradeReportId: gradeReportIds.chemistry,
    studentName: 'David Wilson',
    gender: 'male',
    matricule: '004',
    grade: 9,
    remarks: 'Needs more practice',
  },
  {
    gradeReportId: gradeReportIds.chemistry,
    studentName: 'Eva Brown',
    gender: 'female',
    matricule: '005',
    grade: 13,
    remarks: 'Good understanding',
  },
];

// Sample facilities data
const sampleFacilities = [
  {
    name: 'Modern Science Laboratory',
    nameFr: 'Laboratoire de Sciences Modernes',
    description:
      'A state-of-the-art science lab for physics, chemistry, and biology experiments.',
    descriptionFr:
      'Un laboratoire de sciences à la pointe pour les expériences de physique, chimie et biologie.',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    category: 'science',
    features: JSON.stringify([
      'Fume hood',
      'Microscopes',
      'Lab benches',
      'Safety equipment',
    ]),
    equipment: JSON.stringify(['Beakers', 'Test tubes', 'Bunsen burners']),
    isPublished: true,
  },
  {
    name: 'School Library',
    nameFr: 'Bibliothèque Scolaire',
    description:
      'A large library with books, digital resources, and study spaces.',
    descriptionFr:
      "Une grande bibliothèque avec des livres, des ressources numériques et des espaces d'étude.",
    imageUrl:
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
    category: 'library',
    features: JSON.stringify([
      'Reading room',
      'Digital catalog',
      'Study tables',
    ]),
    equipment: JSON.stringify(['Books', 'Computers', 'Printers']),
    isPublished: true,
  },
];

// Sample achievements data
const sampleAchievements = [
  {
    title: 'Regional Academic Excellence Awards',
    titleFr: "Prix d'Excellence Académique Régionale",
    description:
      'Recognition for our exceptional performance in regional and national examinations.',
    descriptionFr:
      'Reconnaissance pour nos résultats exceptionnels aux examens régionaux et nationaux.',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
    category: 'academic',
    date: new Date('2025-08-15'),
    isPublished: true,
  },
  {
    title: 'National Science Competition Winners',
    titleFr: 'Vainqueurs de la Compétition Nationale de Sciences',
    description:
      'Our students have won multiple awards in national science competitions.',
    descriptionFr:
      'Nos étudiants ont remporté plusieurs prix dans les compétitions scientifiques nationales.',
    imageUrl:
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop',
    category: 'academic',
    date: new Date('2025-07-20'),
    isPublished: true,
  },
];

// Sample contacts data
const sampleContacts = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+237 612345678',
    inquiryType: 'admissions',
    message:
      'I would like to inquire about the admission process for Form 1. What documents are required and what are the deadlines?',
    status: 'new',
    submittedAt: new Date('2025-01-15T10:30:00Z'),
  },
  {
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+237 623456789',
    inquiryType: 'academics',
    message:
      'I am interested in learning more about the bilingual program offered at your school. How does it work and what are the benefits?',
    status: 'read',
    submittedAt: new Date('2025-01-14T14:20:00Z'),
  },
  {
    name: 'David Johnson',
    email: 'david.johnson@email.com',
    phone: '+237 634567890',
    inquiryType: 'general',
    message:
      'I would like to know more about the school facilities and extracurricular activities available for students.',
    status: 'responded',
    submittedAt: new Date('2025-01-13T09:15:00Z'),
    respondedAt: new Date('2025-01-14T11:00:00Z'),
    response:
      'Thank you for your inquiry. Our school offers excellent facilities including a modern library, science labs, and sports facilities. We have various clubs and activities including debate, music, and sports teams.',
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@email.com',
    phone: '+237 645678901',
    inquiryType: 'complaint',
    message:
      'I have concerns about the transportation service provided by the school. The bus is often late and overcrowded.',
    status: 'closed',
    submittedAt: new Date('2025-01-12T16:45:00Z'),
    respondedAt: new Date('2025-01-13T10:30:00Z'),
    response:
      'We apologize for the inconvenience. We have addressed this issue with our transportation provider and implemented a new schedule. Please let us know if you continue to experience problems.',
  },
  {
    name: 'Pierre Mbarga',
    email: 'pierre.mbarga@email.com',
    phone: '+237 656789012',
    inquiryType: 'suggestion',
    message:
      'I suggest implementing a digital homework submission system to reduce paper usage and improve organization.',
    status: 'new',
    submittedAt: new Date('2025-01-16T08:00:00Z'),
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@email.com',
    phone: '+237 667890123',
    inquiryType: 'admissions',
    message:
      'My daughter is currently in Form 2 at another school. What is the transfer process and are there any special requirements?',
    status: 'read',
    submittedAt: new Date('2025-01-15T13:20:00Z'),
  },
  {
    name: 'Jean-Pierre Nguemo',
    email: 'jp.nguemo@email.com',
    phone: '+237 678901234',
    inquiryType: 'academics',
    message:
      'I am interested in the advanced mathematics program. What are the prerequisites and how can my child apply?',
    status: 'new',
    submittedAt: new Date('2025-01-16T11:45:00Z'),
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+237 689012345',
    inquiryType: 'general',
    message:
      'What are the school hours and is there an after-school program available?',
    status: 'responded',
    submittedAt: new Date('2025-01-14T15:30:00Z'),
    respondedAt: new Date('2025-01-15T09:15:00Z'),
    response:
      'School hours are from 7:30 AM to 3:30 PM. We do offer an after-school program from 3:30 PM to 5:30 PM which includes homework assistance and various activities.',
  },
  {
    name: 'Marc Etoa',
    email: 'marc.etoa@email.com',
    phone: '+237 690123456',
    inquiryType: 'complaint',
    message:
      'There is an issue with the school cafeteria food quality. The meals are often cold and the variety is limited.',
    status: 'read',
    submittedAt: new Date('2025-01-15T12:00:00Z'),
  },
  {
    name: 'Sophie Martin',
    email: 'sophie.martin@email.com',
    phone: '+237 701234567',
    inquiryType: 'suggestion',
    message:
      "I suggest organizing more parent-teacher meetings throughout the year to keep parents better informed about their children's progress.",
    status: 'new',
    submittedAt: new Date('2025-01-16T14:20:00Z'),
  },
];

// Sample applications data
const sampleApplications = [
  {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@email.com',
    phone: '+237 712345678',
    form: 'form1',
    status: 'pending',
    submittedAt: new Date('2025-01-10T09:00:00Z'),
  },
  {
    firstName: 'Fatima',
    lastName: 'Ahmed',
    email: 'fatima.ahmed@email.com',
    phone: '+237 723456789',
    form: 'form2',
    status: 'approved',
    submittedAt: new Date('2025-01-08T14:30:00Z'),
    reviewedAt: new Date('2025-01-12T10:15:00Z'),
    notes: 'Excellent academic record. Approved for Form 2.',
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+237 734567890',
    form: 'form3',
    status: 'rejected',
    submittedAt: new Date('2025-01-05T11:20:00Z'),
    reviewedAt: new Date('2025-01-09T16:45:00Z'),
    notes:
      'Incomplete documentation. Missing birth certificate and previous school records.',
  },
  {
    firstName: 'Aisha',
    lastName: 'Diallo',
    email: 'aisha.diallo@email.com',
    phone: '+237 745678901',
    form: 'form1',
    status: 'pending',
    submittedAt: new Date('2025-01-12T13:45:00Z'),
  },
  {
    firstName: 'Thomas',
    lastName: 'Wilson',
    email: 'thomas.wilson@email.com',
    phone: '+237 756789012',
    form: 'form4',
    status: 'approved',
    submittedAt: new Date('2025-01-06T08:15:00Z'),
    reviewedAt: new Date('2025-01-11T14:20:00Z'),
    notes: 'Strong academic background. Approved for Form 4.',
  },
  {
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@email.com',
    phone: '+237 767890123',
    form: 'form2',
    status: 'pending',
    submittedAt: new Date('2025-01-14T10:30:00Z'),
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+237 778901234',
    form: 'form5',
    status: 'rejected',
    submittedAt: new Date('2025-01-03T15:20:00Z'),
    reviewedAt: new Date('2025-01-07T11:30:00Z'),
    notes: 'Academic performance below required standards for Form 5.',
  },
  {
    firstName: 'Kwame',
    lastName: 'Mensah',
    email: 'kwame.mensah@email.com',
    phone: '+237 789012345',
    form: 'form1',
    status: 'approved',
    submittedAt: new Date('2025-01-09T12:00:00Z'),
    reviewedAt: new Date('2025-01-13T09:45:00Z'),
    notes: 'Good potential. Approved for Form 1.',
  },
  {
    firstName: 'Elena',
    lastName: 'Petrov',
    email: 'elena.petrov@email.com',
    phone: '+237 790123456',
    form: 'form3',
    status: 'pending',
    submittedAt: new Date('2025-01-15T16:15:00Z'),
  },
  {
    firstName: 'James',
    lastName: "O'Connor",
    email: 'james.oconnor@email.com',
    phone: '+237 801234567',
    form: 'form2',
    status: 'approved',
    submittedAt: new Date('2025-01-07T09:30:00Z'),
    reviewedAt: new Date('2025-01-10T13:15:00Z'),
    notes: 'Excellent application. Approved for Form 2.',
  },
];

// Sample bookings data
const sampleBookings = [
  {
    studentName: 'Emma Johnson',
    parentName: 'Sarah Johnson',
    parentEmail: 'sarah.johnson@email.com',
    parentPhone: '+237 812345678',
    teacherName: 'Dr. Michael Brown',
    subject: 'mathematics',
    preferredDate: new Date('2025-01-20T00:00:00Z'),
    preferredTime: '14:00',
    purpose:
      "Discuss Emma's progress in advanced mathematics and explore additional challenges.",
    status: 'pending',
    createdAt: new Date('2025-01-15T10:00:00Z'),
  },
  {
    studentName: 'David Chen',
    parentName: 'Li Chen',
    parentEmail: 'li.chen@email.com',
    parentPhone: '+237 823456789',
    teacherName: 'Ms. Jennifer Davis',
    subject: 'physics',
    preferredDate: new Date('2025-01-22T00:00:00Z'),
    preferredTime: '15:30',
    purpose:
      "Review David's performance in physics and discuss strategies for improvement.",
    status: 'confirmed',
    createdAt: new Date('2025-01-14T14:30:00Z'),
    confirmedDate: new Date('2025-01-22T00:00:00Z'),
    confirmedTime: '15:30',
    notes: "Meeting confirmed. Please bring David's recent test papers.",
  },
  {
    studentName: 'Fatima Ahmed',
    parentName: 'Ahmed Hassan',
    parentEmail: 'ahmed.hassan@email.com',
    parentPhone: '+237 834567890',
    teacherName: 'Mr. Robert Wilson',
    subject: 'chemistry',
    preferredDate: new Date('2025-01-18T00:00:00Z'),
    preferredTime: '16:00',
    purpose:
      "Discuss Fatima's interest in pursuing chemistry at university level.",
    status: 'cancelled',
    createdAt: new Date('2025-01-13T11:15:00Z'),
    notes: 'Cancelled due to family emergency. Will reschedule.',
  },
  {
    studentName: 'Michael Thompson',
    parentName: 'John Thompson',
    parentEmail: 'john.thompson@email.com',
    parentPhone: '+237 845678901',
    teacherName: 'Mrs. Patricia Martinez',
    subject: 'english',
    preferredDate: new Date('2025-01-25T00:00:00Z'),
    preferredTime: '13:00',
    purpose:
      "Discuss Michael's writing skills and explore ways to enhance his creative writing abilities.",
    status: 'pending',
    createdAt: new Date('2025-01-16T09:45:00Z'),
  },
  {
    studentName: 'Aisha Diallo',
    parentName: 'Mamadou Diallo',
    parentEmail: 'mamadou.diallo@email.com',
    parentPhone: '+237 856789012',
    teacherName: 'Mme. Sophie Dubois',
    subject: 'french',
    preferredDate: new Date('2025-01-19T00:00:00Z'),
    preferredTime: '14:30',
    purpose:
      "Review Aisha's French language skills and discuss her preparation for the DELF exam.",
    status: 'completed',
    createdAt: new Date('2025-01-12T15:20:00Z'),
    confirmedDate: new Date('2025-01-19T00:00:00Z'),
    confirmedTime: '14:30',
    notes:
      'Meeting completed successfully. Aisha is well-prepared for the DELF exam.',
  },
  {
    studentName: 'Thomas Wilson',
    parentName: 'Mary Wilson',
    parentEmail: 'mary.wilson@email.com',
    parentPhone: '+237 867890123',
    teacherName: 'Dr. James Anderson',
    subject: 'biology',
    preferredDate: new Date('2025-01-23T00:00:00Z'),
    preferredTime: '15:00',
    purpose:
      "Discuss Thomas's interest in medical studies and his performance in biology.",
    status: 'pending',
    createdAt: new Date('2025-01-15T13:00:00Z'),
  },
  {
    studentName: 'Yuki Tanaka',
    parentName: 'Hiroshi Tanaka',
    parentEmail: 'hiroshi.tanaka@email.com',
    parentPhone: '+237 878901234',
    teacherName: 'Mr. Christopher Lee',
    subject: 'mathematics',
    preferredDate: new Date('2025-01-21T00:00:00Z'),
    preferredTime: '16:30',
    purpose:
      "Discuss Yuki's exceptional performance in mathematics and explore advanced topics.",
    status: 'confirmed',
    createdAt: new Date('2025-01-14T10:45:00Z'),
    confirmedDate: new Date('2025-01-21T00:00:00Z'),
    confirmedTime: '16:30',
    notes: 'Meeting confirmed. Will discuss advanced mathematics curriculum.',
  },
  {
    studentName: 'Maria Garcia',
    parentName: 'Carlos Garcia',
    parentEmail: 'carlos.garcia@email.com',
    parentPhone: '+237 889012345',
    teacherName: 'Ms. Rachel Green',
    subject: 'english',
    preferredDate: new Date('2025-01-24T00:00:00Z'),
    preferredTime: '14:00',
    purpose:
      "Discuss Maria's reading comprehension skills and strategies for improvement.",
    status: 'pending',
    createdAt: new Date('2025-01-16T12:30:00Z'),
  },
  {
    studentName: 'Kwame Mensah',
    parentName: 'Kofi Mensah',
    parentEmail: 'kofi.mensah@email.com',
    parentPhone: '+237 890123456',
    teacherName: 'Mr. Daniel Taylor',
    subject: 'physics',
    preferredDate: new Date('2025-01-26T00:00:00Z'),
    preferredTime: '15:00',
    purpose:
      "Discuss Kwame's progress in physics and address any concerns about his understanding of complex concepts.",
    status: 'cancelled',
    createdAt: new Date('2025-01-13T16:15:00Z'),
    notes: 'Cancelled by parent. Will reschedule for next week.',
  },
  {
    studentName: 'Elena Petrov',
    parentName: 'Ivan Petrov',
    parentEmail: 'ivan.petrov@email.com',
    parentPhone: '+237 901234567',
    teacherName: 'Dr. Lisa Johnson',
    subject: 'chemistry',
    preferredDate: new Date('2025-01-27T00:00:00Z'),
    preferredTime: '13:30',
    purpose:
      "Discuss Elena's laboratory skills and her interest in pursuing chemistry research.",
    status: 'pending',
    createdAt: new Date('2025-01-17T08:45:00Z'),
  },
];

export async function seedDatabase() {
  // delete all data from the database in the correct order
  await db.delete(studentGrades);
  await db.delete(gradeReports);
  await db.delete(news);
  await db.delete(gallery);
  await db.delete(userProfiles);
  await db.delete(students);
  await db.delete(users);
  await db.delete(contacts);
  await db.delete(applications);
  await db.delete(bookings);

  try {
    console.log('🌱 Seeding database with mock data...');

    // Create users if they don't exist
    console.log('👥 Creating sample users...');
    for (const user of sampleUsers) {
      const hashedPassword = await hash(user.password, 10);
      try {
        await (db as any).insert(users).values({
          id: user.id,
          username: user.username,
          password: hashedPassword,
          role: user.role,
          fullName: user.fullName,
          email: user.email,
          teacherSubject: user.teacherSubject,
          createdAt: new Date(),
        });
        console.log(`✅ Created user: ${user.username}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating user ${user.username}:`,
          error.message
        );
      }
    }

    // Create students
    console.log('🎓 Creating sample students...');
    for (const student of sampleStudents) {
      const hashedPassword = await hash(student.password, 10);
      try {
        await db.insert(students).values({
          id: student.id,
          studentId: student.studentId,
          password: hashedPassword,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          className: student.className,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          parentName: student.parentName,
          parentEmail: student.parentEmail,
          parentPhone: student.parentPhone,
          address: student.address,
          isActive: student.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`✅ Created student: ${student.fullName}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating student ${student.fullName}:`,
          error.message
        );
      }
    }

    // Create news items
    console.log('📰 Creating sample news...');
    for (const newsItem of sampleNews) {
      try {
        await db.insert(news).values(newsItem);
        console.log(`✅ Created news: ${newsItem.title}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating news "${newsItem.title}":`,
          error.message
        );
      }
    }

    // Create gallery items
    console.log('🖼️  Creating sample gallery items...');
    for (const galleryItem of sampleGallery) {
      try {
        await db.insert(gallery).values(galleryItem);
        console.log(`✅ Created gallery item: ${galleryItem.title}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating gallery item "${galleryItem.title}":`,
          error.message
        );
      }
    }

    // Create grade reports
    console.log('📊 Creating sample grade reports...');
    for (const report of sampleGradeReports) {
      try {
        await db.insert(gradeReports).values(report);
        console.log(
          `✅ Created grade report: ${report.subject} - ${report.className}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error creating grade report "${report.subject}":`,
          error.message
        );
      }
    }

    // Create student grades
    console.log('📝 Creating sample student grades...');
    for (const grade of sampleStudentGrades) {
      try {
        await db.insert(studentGrades).values(grade);
        console.log(`✅ Created grade for: ${grade.studentName}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating grade for "${grade.studentName}":`,
          error.message
        );
      }
    }

    // Create facilities
    console.log('🏫 Creating sample facilities...');
    for (const facility of sampleFacilities) {
      try {
        await db.insert(facilities).values(facility);
        console.log(`✅ Created facility: ${facility.name}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating facility "${facility.name}":`,
          error.message
        );
      }
    }

    // Create achievements
    console.log('🏆 Creating sample achievements...');
    for (const achievement of sampleAchievements) {
      try {
        await db.insert(achievements).values(achievement);
        console.log(`✅ Created achievement: ${achievement.title}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating achievement "${achievement.title}":`,
          error.message
        );
      }
    }

    // Create contacts
    console.log('📞 Creating sample contacts...');
    for (const contact of sampleContacts) {
      try {
        await db.insert(contacts).values(contact);
        console.log(`✅ Created contact: ${contact.name}`);
      } catch (error: any) {
        console.error(
          `❌ Error creating contact "${contact.name}":`,
          error.message
        );
      }
    }

    // Create applications
    console.log('📋 Creating sample applications...');
    for (const application of sampleApplications) {
      try {
        await db.insert(applications).values(application);
        console.log(
          `✅ Created application: ${application.firstName} ${application.lastName}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error creating application "${application.firstName} ${application.lastName}":`,
          error.message
        );
      }
    }

    // Create bookings
    console.log('📅 Creating sample bookings...');
    for (const booking of sampleBookings) {
      try {
        await db.insert(bookings).values(booking);
        console.log(
          `✅ Created booking: ${booking.studentName} - ${booking.subject}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error creating booking "${booking.studentName}":`,
          error.message
        );
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- ${sampleUsers.length} users created`);
    console.log(`- ${sampleStudents.length} students created`);
    console.log(`- ${sampleNews.length} news items created`);
    console.log(`- ${sampleGallery.length} gallery items created`);
    console.log(`- ${sampleGradeReports.length} grade reports created`);
    console.log(`- ${sampleStudentGrades.length} student grades created`);
    console.log(`- ${sampleFacilities.length} facilities created`);
    console.log(`- ${sampleAchievements.length} achievements created`);
    console.log(`- ${sampleContacts.length} contacts created`);
    console.log(`- ${sampleApplications.length} applications created`);
    console.log(`- ${sampleBookings.length} bookings created`);
    console.log('\n🔑 Default login credentials:');
    console.log('Super Admin: username=super_admin, password=admin123');
    console.log('Admin: username=admin, password=admin123');
    console.log('Teacher 1: username=teacher1, password=teacher123');
    console.log('Teacher 2: username=teacher2, password=teacher123');
    console.log('Teacher 3: username=teacher3, password=teacher123');
    console.log('Student 1: username=GBHS2024001, password=student123');
    console.log('Student 2: username=GBHS2024002, password=student123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding
seedDatabase();
