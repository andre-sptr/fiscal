import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";
type ColorTheme = "default" | "ocean" | "royal" | "sunset" | "rose";

interface ThemeContextType {
    themeMode: ThemeMode;
    colorTheme: ColorTheme;
    setThemeMode: (mode: ThemeMode) => void;
    setColorTheme: (theme: ColorTheme) => void;
    toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem("fiscal_theme_mode");
        if (saved === "light" || saved === "dark") return saved;
        return "dark";
    });

    const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
        const saved = localStorage.getItem("fiscal_color_theme");
        return (saved as ColorTheme) || "default";
    });

    useEffect(() => {
        const root = document.documentElement;

        // Handle Dark Mode
        if (themeMode === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("fiscal_theme_mode", themeMode);

    }, [themeMode]);

    useEffect(() => {
        const root = document.documentElement;

        // Handle Color Theme
        // Remove previous themes
        root.removeAttribute("data-theme");

        if (colorTheme !== "default") {
            root.setAttribute("data-theme", colorTheme);
        }
        localStorage.setItem("fiscal_color_theme", colorTheme);

    }, [colorTheme]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    const toggleThemeMode = () => {
        setThemeModeState((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const setColorTheme = (theme: ColorTheme) => {
        setColorThemeState(theme);
    };

    return (
        <ThemeContext.Provider value={{ themeMode, colorTheme, setThemeMode, setColorTheme, toggleThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
