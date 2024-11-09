import React from "react";
import { Switch } from "../ui/switch-darkmode";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };
  React.useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);
  return (
    <Switch
      checked={isDarkMode}
      onCheckedChange={handleDarkModeChange}
      className="data-[state=checked]:bg-primary"
    />
  );
}
