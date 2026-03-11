module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // ProfileBuilder sidebar - active state
    'bg-blue-100', 'bg-blue-50', 'bg-blue-500', 'bg-blue-600', 'bg-blue-200',
    'text-blue-600', 'text-black',
    'border-blue-200', 'border-blue-600',
    'hover:bg-blue-50', 'hover:bg-blue-100', 'hover:bg-blue-200',
    'hover:text-blue-600',
    'shadow-blue-500/10', 'shadow-blue-500/20',
    'group-hover:bg-blue-100', 'group-hover:text-blue-600',
    'group-hover:bg-blue-500',
    'scale-[1.02]',
  ],
  theme: {
    extend: {
      colors: {
        'portal-bg': '#F8FAFC',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
