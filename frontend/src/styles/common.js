const baseStyles = {
  cards: {
    primary: 'bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800',
    secondary: 'bg-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700',
    interactive: 'transform hover:scale-102 transition-all duration-300 cursor-pointer',
    feature: 'bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20',
    stat: 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all duration-300',
    action: 'bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-md rounded-xl p-6 border border-primary-500/20 hover:border-primary-500/50 transition-all duration-300'
  },
  buttons: {
    primary: 'px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:transition-none',
    secondary: 'px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:transition-none',
    danger: 'px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:transition-none',
    icon: 'p-2 rounded-full hover:bg-white/10 transition-colors duration-300',
    link: 'text-primary-500 hover:text-primary-400 transition-colors duration-300 underline-offset-4 hover:underline',
    outline: 'px-6 py-3 border-2 border-primary-500 text-primary-500 rounded-lg hover:bg-primary-500 hover:text-white transition-all duration-300'
  }
};

export const commonStyles = {
  gradients: {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-700',
    secondary: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black',
    card: 'bg-white/80 dark:bg-black/30 backdrop-blur-md',
    success: 'bg-gradient-to-br from-green-500 to-emerald-700',
    warning: 'bg-gradient-to-br from-yellow-500 to-orange-700',
    danger: 'bg-gradient-to-br from-red-500 to-rose-700',
    info: 'bg-gradient-to-br from-blue-500 to-indigo-700'
  },
  buttons: baseStyles.buttons,
  cards: baseStyles.cards,
  inputs: {
    primary: 'w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300',
    search: 'w-full p-3 bg-black/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300'
  },
  animations: {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse'
  },
  text: {
    title: 'text-3xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-xl font-semibold text-gray-800 dark:text-gray-200',
    body: 'text-gray-600 dark:text-gray-300',
    small: 'text-sm text-gray-500 dark:text-gray-400'
  },
  pageTransitions: {
    container: 'animate-fadeIn',
    content: 'animate-slideUp delay-200',
    card: 'animate-scaleIn delay-100',
    list: 'animate-slideIn delay-300'
  },
  backgrounds: {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-700',
    secondary: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black',
    glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-md',
    card: 'bg-white/80 dark:bg-black/30 backdrop-blur-md',
    success: 'bg-gradient-to-br from-green-400 to-emerald-600',
    warning: 'bg-gradient-to-br from-yellow-400 to-orange-600',
    danger: 'bg-gradient-to-br from-red-400 to-rose-600',
    info: 'bg-gradient-to-br from-blue-400 to-indigo-600'
  },
  hover: {
    scale: 'hover:scale-105 transition-transform duration-300',
    glow: 'hover:shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300',
    lift: 'hover:-translate-y-1 transition-transform duration-300',
    pulse: 'hover:animate-pulse'
  },
  layout: {
    page: 'min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6',
    container: 'max-w-7xl mx-auto',
    section: 'mb-12',
    grid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
    flexBetween: 'flex justify-between items-center',
    flexCenter: 'flex justify-center items-center'
  }
}; 