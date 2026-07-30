/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { butter: '#FFF8E8', custard: '#FFD96A', tomato: '#F36F56', mint: '#CFE9D8', leaf: '#255044', aubergine: '#56396F', ink: '#173B34', oat: '#F1E8D2' },
    boxShadow: { card: '0 10px 0 rgba(37,80,68,.08), 0 18px 40px rgba(37,80,68,.10)', pop: '0 7px 0 #173B34' },
    borderRadius: { munch: '1.75rem' },
    fontFamily: { display: ['"Arial Rounded MT Bold"', '"Trebuchet MS"', 'sans-serif'], body: ['Nunito', '"Segoe UI"', 'sans-serif'] },
    keyframes: {
      popIn: { '0%': { opacity: '0', transform: 'translateY(10px) scale(.97)' }, '70%': { transform: 'translateY(-2px) scale(1.01)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
      munchBounce: { '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' }, '50%': { transform: 'translateY(-8px) rotate(2deg)' } },
      tinyBurst: { '0%': { opacity: '0', transform: 'scale(.4)' }, '45%': { opacity: '1' }, '100%': { opacity: '0', transform: 'scale(1.5) translateY(-12px)' } },
    },
    animation: { 'pop-in': 'popIn .38s cubic-bezier(.2,.8,.2,1) both', 'munch-bounce': 'munchBounce 2.8s ease-in-out infinite', 'tiny-burst': 'tinyBurst .65s ease-out both' },
  } },
  plugins: [],
};
