import { Book, Store } from '../types';

export const SEED_STORES: Store[] = [
  {
    id: "reserve_boutique",
    ownerUid: "partner_alex",
    name: "Bibliophile's Reserve",
    description: "Curation of rare digital classics, first-edition translations, and premium high-fidelity typography layouts.",
    bannerImage: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "gothic_boutique",
    ownerUid: "partner_sabrina",
    name: "The Modern Gothic",
    description: "Specialized boutique for atmospheric gothic literature, premium thrillers, and immersive romantic tales.",
    bannerImage: "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "enclave_boutique",
    ownerUid: "partner_cloutier",
    name: "L'Enclave Poétique",
    description: "Un havre littéraire français dédié aux œuvres classiques, à la poésie moderne et aux essais philosophiques.",
    bannerImage: "https://images.unsplash.com/photo-1491841573190-7980d22227d8?auto=format&fit=crop&q=80&w=1200"
  }
];

export const SEED_BOOKS: Book[] = [
  {
    id: "book_ Sphinx",
    title: "Whispers of the Sphinx",
    author: "Samira Hegazi",
    price: 24.99,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    storeId: "reserve_boutique",
    isOriginal: true
  },
  {
    id: "book_Midnight",
    title: "The Midnight Horizon",
    author: "Alistair Vance",
    price: 14.99,
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    storeId: "reserve_boutique",
    isOriginal: true
  },
  {
    id: "book_Amberwood",
    title: "Chronicles of Amberwood",
    author: "Elena Rostova",
    price: 18.50,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    storeId: "gothic_boutique",
    isOriginal: false
  },
  {
    id: "book_Etoile",
    title: "L'Étoile Absente",
    author: "Jean-Pierre Cloutier",
    price: 12.00,
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
    storeId: "enclave_boutique",
    isOriginal: false
  },
  {
    id: "book_Matter",
    title: "Metaphysics of Digital Matter",
    author: "Dr. K. Vance",
    price: 29.00,
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
    storeId: "reserve_boutique",
    isOriginal: true
  },
  {
    id: "book_GoldenScarab",
    title: "جرب الذهبي (The Golden Scarab)",
    author: "Tariq Al-Fayed",
    price: 21.99,
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600",
    storeId: "enclave_boutique",
    isOriginal: false
  }
];
