interface DonutChartProps {
    variant?: "default" | "blue" | "orange"
  }
  
  export function DonutChart({ variant = "default" }: DonutChartProps) {
    // This is a placeholder component - in a real app, you'd use a charting library
    // like Recharts, Chart.js, or D3.js to create actual charts
  
    let colors = {
      primary: "#22c55e",
      secondary: "#f97316",
    }
  
    if (variant === "blue") {
      colors = {
        primary: "#f97316",
        secondary: "#60a5fa",
      }
    } else if (variant === "orange") {
      colors = {
        primary: "#f97316",
        secondary: "#60a5fa",
      }
    }
  
    return (
      <div className="w-full h-full relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={colors.primary}
            strokeWidth="20"
            strokeDasharray="188.5 251.3"
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={colors.secondary}
            strokeWidth="20"
            strokeDasharray="62.8 251.3"
            strokeDashoffset="-188.5"
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>
    )
  }
  