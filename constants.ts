
import { Player } from './types';

export const INITIAL_BUDGET = 50.00; // 50 Lakhs
export const BASE_PRICE = 1.00; // 1 Lakh

export const FRANCHISES: any[] = [
  { id: 'F1', name: 'Sagar', budget: INITIAL_BUDGET, roster: [], color: '#004BA0', icon: 'lion' },
  { id: 'F2', name: 'Harsh', budget: INITIAL_BUDGET, roster: [], color: '#FFD700', icon: 'tiger' },
  { id: 'F3', name: 'Devendra', budget: INITIAL_BUDGET, roster: [], color: '#EC1C24', icon: 'fire' },
  { id: 'F4', name: 'Kartik', budget: INITIAL_BUDGET, roster: [], color: '#3A225D', icon: 'warrior' },
  { id: 'F5', name: 'Raju Bhai', budget: INITIAL_BUDGET, roster: [], color: '#FF822E', icon: 'eagle' },
  { id: 'F6', name: 'Murli L', budget: INITIAL_BUDGET, roster: [], color: '#00008B', icon: 'shield' },
];

export const LOCAL_PLAYER_STATS: Record<string, any> = {};

const createPlayer = (name: string, category: 'A+' | 'A' | 'B' | 'C'): Player => {
  const basePrices = {
    'A+': 5.00, // 5 Lakhs
    'A': 3.00,  // 3 Lakhs
    'B': 2.00,  // 2 Lakhs
    'C': 1.00   // 1 Lakh
  };
  
  const ratings = {
    'A+': 95,
    'A': 85,
    'B': 75,
    'C': 65
  };

  const skills = ['Batter', 'Bowler', 'All-Rounder', 'WK-Batter'];
  const randomSkill = skills[Math.floor(Math.random() * skills.length)];

  return {
    id: `p-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    category,
    skill: randomSkill,
    basePrice: basePrices[category],
    country: 'India',
    rating: ratings[category],
    isSold: false,
    originalTeam: 'Local',
    stats: { matches: 0 },
    // Use the player name directly for the image filename
    imageUrl: `players/${name}.jpg`
  };
};

export const INITIAL_PLAYERS: Player[] = [
  // --- CATEGORY A+ (Platinum) ---
  createPlayer('Yash', 'A+'),
  createPlayer('Raj', 'A+'),
  createPlayer('Rishi', 'A+'),
  createPlayer('Amit S', 'A+'),
  createPlayer('Amey', 'A+'),
  createPlayer('Kalp', 'A+'),
  createPlayer('Dipesh', 'A+'),
  createPlayer('Khush', 'A+'),
  createPlayer('Jigar shah', 'A+'),
  createPlayer('Viral Dodia', 'A+'),
  createPlayer('Sagar', 'A+'), // Owner
  createPlayer('Harsh', 'A+'), // Owner
  
  // --- CATEGORY A (Gold) ---
  createPlayer('Ashu P', 'A'),
  createPlayer('Alok', 'A'),
  createPlayer('Bhupesh', 'A'),
  createPlayer('Shiva', 'A'),
  createPlayer('Devendra', 'A'), // Owner
  createPlayer('Kartik', 'A'),   // Owner
  createPlayer('Pareen', 'A'),
  createPlayer('Jigar Joshi', 'A'),
  createPlayer('Parv', 'A'),
  createPlayer('Maheer', 'A'),
  createPlayer('Prashant', 'A'),
  createPlayer('Viral Shah', 'A'),
  createPlayer('Bhavin', 'A'),
  createPlayer('Nimesh', 'A'),
  createPlayer('Arjun', 'A'),
  createPlayer('Lomesh', 'A'),
  createPlayer('Jasmin', 'A'),
  createPlayer('Prakash', 'A'),

  // --- CATEGORY B (Silver) ---
  createPlayer('Amit gold', 'B'),
  createPlayer('Sandeep I', 'B'),
  createPlayer('Krishna', 'B'),
  createPlayer('Dhruv', 'B'),
  createPlayer('Akshay patel', 'B'),
  createPlayer('Tirth', 'B'),
  createPlayer('Ketan', 'B'),
  createPlayer('Jainam', 'B'),
  createPlayer('Chintan', 'B'),
  createPlayer('Mukesh K', 'B'), // Updated casing to match request
  createPlayer('Royston', 'B'),
  createPlayer('Sachin Gopani', 'B'),

  // --- CATEGORY C (Bronze) ---
  createPlayer('Pranav', 'C'),
  createPlayer('Vinit', 'C'),
  createPlayer('Niraj', 'C'),
  createPlayer('Raju Bhai', 'C'), // Owner
  createPlayer('Murli L', 'C'),   // Owner
  createPlayer('Sanyam', 'C'),
  createPlayer('Rajeev', 'C'),
  createPlayer('Mital', 'C'),
  createPlayer('Amol', 'C'),
  createPlayer('Parth Doshi', 'C'),
  createPlayer('Mrugesh', 'C'),
  createPlayer('Sushant', 'C'),
  createPlayer('Varun', 'C'),
  createPlayer('Dr Keyur', 'C'),
  createPlayer('Aryan', 'C'),
  createPlayer('Carlton', 'C'),
  createPlayer('Yash K', 'C'),
  createPlayer('Mihir', 'C'),
  createPlayer('vipul', 'C'),
  createPlayer('Pushkar', 'C'),
  createPlayer('Sachin shah', 'C'),
  createPlayer('Rushabh', 'C'),
  createPlayer('Purvesh', 'C'),
  createPlayer('Parag K', 'C'),
];
