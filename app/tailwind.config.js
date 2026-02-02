/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                'dream-bg': '#0B0C15',
                'dream-card': '#151725',
                'dream-gold': '#FFD700',
                'dream-purple': '#7C3AED',
                'dream-text': '#FFFFFF',
                'dream-text-muted': '#9CA3AF',

                // HTML Design Match
                'primary': '#5D5CDE',
                'bg-light': '#FDFBF7',
                'bg-dark': '#0B0C15',
                'paper-light': '#FFFDF5',
                'paper-dark': '#1E1E24',
                'accent-gold': '#C6A87C',
            },
            fontFamily: {
                sans: ['System', 'sans-serif'], // Mapping Lato to system for now
                serif: ['System', 'serif'],     // Mapping Playfair to system serif for now
                display: ['System', 'serif'],   // Display also maps to serif
            }
        },
    },
    plugins: [],
}
