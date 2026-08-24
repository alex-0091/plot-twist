export interface TokenInfo {
  id: string;
  name: string;
  urduName: string;
  emoji: string;
  color: string;
  description: string;
}

export const TOKENS: TokenInfo[] = [
  {
    id: 'rickshaw',
    name: 'Rickshaw',
    urduName: 'چنگ چی / رکشہ',
    emoji: '🛺',
    color: '#EAB308',
    description: 'Master of narrow Pakistani galiyan and sudden U-turns.',
  },
  {
    id: 'chai_cup',
    name: 'Chai Cup',
    urduName: 'کڑک چائے',
    emoji: '☕',
    color: '#D97706',
    description: 'Doodh Patti fuel that runs the entire nation.',
  },
  {
    id: 'chappal',
    name: 'Peshawari Chappal',
    urduName: 'پیشاوری چپل',
    emoji: '🩴',
    color: '#854D0E',
    description: 'Handcrafted pure leather flex and iconic weapon of Desi mothers.',
  },
  {
    id: 'cricket_bat',
    name: 'Cricket Bat',
    urduName: 'سیالکوٹی بلا',
    emoji: '🏏',
    color: '#16A34A',
    description: 'Sialkot export quality tape-ball destroyer.',
  },
  {
    id: 'land_cruiser',
    name: 'V8 Land Cruiser',
    urduName: 'پروٹوکول وی ایٹ',
    emoji: '🚙',
    color: '#1E293B',
    description: 'Tinted windows, flashing police lights, and pure power.',
  },
  {
    id: 'phone',
    name: 'EasyPaisa Phone',
    urduName: 'ایزی پیسہ فون',
    emoji: '📱',
    color: '#2563EB',
    description: 'Sending Rs 50 OTPs and WhatsApp voice notes 24/7.',
  },
  {
    id: 'goat',
    name: 'Bakra',
    urduName: 'بکرامنڈی والا بکرا',
    emoji: '🐐',
    color: '#9333EA',
    description: 'Kamori goat bought from Super Highway Bakra Mandi.',
  },
  {
    id: 'motorcycle',
    name: 'CD 70 Motorcycle',
    urduName: 'ہونڈا 70',
    emoji: '🏍️',
    color: '#DC2626',
    description: 'One-wheeling king with silencer removed.',
  },
];
