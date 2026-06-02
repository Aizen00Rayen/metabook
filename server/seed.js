// Initial sample data used to seed a fresh database.
// NOTE: no demo user accounts — real users register through the app.
// Stores have ownerUid: null so they are "unclaimed" platform stores until a partner registers.

export const SEED_STORES = [
  {
    id: 'reserve_boutique',
    ownerUid: null,
    name: "Bibliophile's Reserve",
    description: 'Curation of rare book editions, first-edition translations, and premium high-fidelity typography layouts.',
    bannerImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'gothic_boutique',
    ownerUid: null,
    name: 'The Modern Gothic',
    description: 'Specialized boutique for atmospheric gothic literature, premium thrillers, and immersive romantic tales.',
    bannerImage: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&q=80&w=1200',
  },
  {
    id: 'enclave_boutique',
    ownerUid: null,
    name: "L'Enclave Poetique",
    description: "Un havre litteraire francais dedie aux oeuvres classiques, a la poesie moderne et aux essais philosophiques.",
    bannerImage: 'https://images.unsplash.com/photo-1491841573190-7980d22227d8?auto=format&fit=crop&q=80&w=1200',
  },
];

export const SEED_BOOKS = [
  { id: 'book_Sphinx',      title: 'Whispers of the Sphinx',           author: 'Samira Hegazi',        price: 24.99, coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600', storeId: 'reserve_boutique',  isOriginal: true,  featured: true  },
  { id: 'book_Midnight',    title: 'The Midnight Horizon',             author: 'Alistair Vance',        price: 14.99, coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600', storeId: 'reserve_boutique',  isOriginal: true,  featured: false },
  { id: 'book_Amberwood',   title: 'Chronicles of Amberwood',          author: 'Elena Rostova',         price: 18.50, coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600', storeId: 'gothic_boutique',   isOriginal: false, featured: false },
  { id: 'book_Etoile',      title: "L'Etoile Absente",                 author: 'Jean-Pierre Cloutier',  price: 12.00, coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600', storeId: 'enclave_boutique',  isOriginal: false, featured: false },
  { id: 'book_Matter',      title: 'Metaphysics of Digital Matter',    author: 'Dr. K. Vance',          price: 29.00, coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600', storeId: 'reserve_boutique',  isOriginal: true,  featured: false },
  { id: 'book_GoldenScarab',title: 'The Golden Scarab',                author: 'Tariq Al-Fayed',        price: 21.99, coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600', storeId: 'enclave_boutique',  isOriginal: false, featured: false },
];

export const SEED_NEWS = [
  {
    id: 'news_1',
    title: "Metabook ouvre les candidatures pour les maisons d'edition",
    content: "Nous sommes honores de lancer la campagne d'agrement des boutiques partenaires d'editeurs en Algerie pour assurer des livraisons securisees.",
    category: 'partnership',
    createdAt: '2026-05-20T14:00:00Z',
    authorName: 'Administration',
  },
  {
    id: 'news_2',
    title: 'Lancement des Editions Originales et exclusivites',
    content: "Decouvrez la premiere vague des livres Originaux Metabook, concus avec une grille rigoureuse et des impressions haut de gamme.",
    category: 'book',
    createdAt: '2026-05-21T09:30:00Z',
    authorName: 'Metabook Curator',
  },
];
