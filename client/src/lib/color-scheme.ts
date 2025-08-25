// Color scheme management for volleyball scoreboard
export interface TeamColors {
  primary: string;
  secondary: string;
  highlight: string;
  text: string;
  glow: string;
  setBackground: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  primary: string;
}

// Predefined team color schemes
export const TEAM_COLOR_SCHEMES: Record<string, TeamColors> = {
  // Professional volleyball colors
  'pink': {
    primary: 'hsl(330, 70%, 60%)',
    secondary: 'hsl(330, 60%, 50%)',
    highlight: 'hsl(330, 80%, 70%)',
    text: '#FFFFFF',
    glow: 'rgba(236, 72, 153, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'cyan': {
    primary: 'hsl(180, 70%, 60%)',
    secondary: 'hsl(180, 60%, 50%)',
    highlight: 'hsl(180, 80%, 70%)',
    text: '#FFFFFF',
    glow: 'rgba(34, 211, 238, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'orange': {
    primary: 'hsl(25, 95%, 53%)',
    secondary: 'hsl(25, 85%, 43%)',
    highlight: 'hsl(25, 100%, 63%)',
    text: '#FFFFFF',
    glow: 'rgba(251, 146, 60, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'purple': {
    primary: 'hsl(262, 83%, 58%)',
    secondary: 'hsl(262, 73%, 48%)',
    highlight: 'hsl(262, 93%, 68%)',
    text: '#FFFFFF',
    glow: 'rgba(147, 51, 234, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'green': {
    primary: 'hsl(142, 76%, 36%)',
    secondary: 'hsl(142, 66%, 26%)',
    highlight: 'hsl(142, 86%, 46%)',
    text: '#FFFFFF',
    glow: 'rgba(34, 197, 94, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'red': {
    primary: 'hsl(0, 84%, 60%)',
    secondary: 'hsl(0, 74%, 50%)',
    highlight: 'hsl(0, 94%, 70%)',
    text: '#FFFFFF',
    glow: 'rgba(239, 68, 68, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'blue': {
    primary: 'hsl(217, 91%, 60%)',
    secondary: 'hsl(217, 81%, 50%)',
    highlight: 'hsl(217, 100%, 70%)',
    text: '#FFFFFF',
    glow: 'rgba(59, 130, 246, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  },
  'yellow': {
    primary: 'hsl(48, 96%, 53%)',
    secondary: 'hsl(48, 86%, 43%)',
    highlight: 'hsl(48, 100%, 63%)',
    text: '#FFFFFF',
    glow: 'rgba(234, 179, 8, 0.3)',
    setBackground: 'rgba(0, 0, 0, 0.4)'
  }
};

// Theme presets
export const THEME_PRESETS: Record<string, ThemeColors> = {
  'default': {
    background: 'rgba(0, 0, 0, 0.8)',
    surface: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    text: 'rgba(255, 255, 255, 1)',
    primary: 'rgba(59, 130, 246, 1)'
  },
  'dark': {
    background: 'rgba(0, 0, 0, 0.9)',
    surface: 'rgba(17, 24, 39, 0.8)',
    border: 'rgba(75, 85, 99, 0.5)',
    text: 'rgba(255, 255, 255, 1)',
    primary: 'rgba(147, 51, 234, 1)'
  },
  'light': {
    background: 'rgba(255, 255, 255, 0.9)',
    surface: 'rgba(0, 0, 0, 0.05)',
    border: 'rgba(0, 0, 0, 0.2)',
    text: 'rgba(0, 0, 0, 1)',
    primary: 'rgba(59, 130, 246, 1)'
  },
  'tournament': {
    background: 'rgba(0, 0, 0, 0.7)',
    surface: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.25)',
    text: 'rgba(255, 255, 255, 1)',
    primary: 'rgba(251, 146, 60, 1)'
  }
};

// Generate custom team colors
export const generateCustomTeamColors = (customColor: string, customTextColor?: string, customSetBackgroundColor?: string): TeamColors => {
  // Convert hex to HSL if needed
  const hsl = hexToHsl(customColor);
  
  // Generate complementary colors
  const secondaryHue = (hsl.h + 30) % 360; // 30 degrees offset
  const primaryHue = (hsl.h + 180) % 360; // Complementary color
  const intensity = 0.3; // Glow intensity
  
  return {
    primary: customColor, // Use hex directly for primary
    secondary: `hsl(${secondaryHue}, ${Math.max(0, hsl.s - 10)}%, ${Math.max(0, hsl.l - 10)}%)`,
    highlight: `hsl(${primaryHue}, ${Math.min(100, hsl.s + 10)}%, ${Math.min(100, hsl.l + 10)}%)`,
    text: customTextColor || `hsl(${hsl.h}, ${Math.max(0, hsl.s - 50)}%, ${Math.max(0, hsl.l - 40)}%)`,
    glow: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${intensity})`,
    setBackground: customSetBackgroundColor || 'rgba(0, 0, 0, 0.4)'
  };
};

// Get team colors with custom hex support
export const getTeamColors = (colorScheme: string, customColor?: string, customTextColor?: string, customSetBackgroundColor?: string): TeamColors => {
  if (colorScheme === 'custom' && customColor) {
    return generateCustomTeamColors(customColor, customTextColor, customSetBackgroundColor);
  }
  
  return TEAM_COLOR_SCHEMES[colorScheme] || TEAM_COLOR_SCHEMES.pink;
};

// Helper function to convert hex to HSL
const hexToHsl = (hex: string) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Get CSS variables for a team color scheme
export const getTeamColorCSS = (teamId: string, colors: TeamColors): string => {
  return `
    --team-${teamId}-primary: ${colors.primary};
    --team-${teamId}-secondary: ${colors.secondary};
    --team-${teamId}-highlight: ${colors.highlight};
    --team-${teamId}-text: ${colors.text};
    --team-${teamId}-glow: ${colors.glow};
    --team-${teamId}-setBackground: ${colors.setBackground};
  `;
};

// Get CSS variables for a theme
export const getThemeCSS = (theme: ThemeColors): string => {
  return `
    --theme-background: ${theme.background};
    --theme-surface: ${theme.surface};
    --theme-border: ${theme.border};
    --theme-text: ${theme.text};
    --theme-primary: ${theme.primary};
  `;
};

// Validate color values
export const isValidColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// Get contrasting text color for a background
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - can be enhanced
  if (backgroundColor.includes('hsl')) {
    const hsl = backgroundColor.match(/hsl\(([^)]+)\)/);
    if (hsl) {
      const [h, s, l] = hsl[1].split(',').map(x => parseFloat(x));
      return l > 50 ? '#000000' : '#ffffff';
    }
  }
  
  // Default fallback
  return backgroundColor.includes('rgba(0,0,0') || backgroundColor.includes('hsl(0,0%,0%') 
    ? '#ffffff' 
    : '#000000';
};
