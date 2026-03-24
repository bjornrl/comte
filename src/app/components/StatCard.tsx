interface StatCardProps {
    /**
     * Large number to display (e.g. "30%")
     */
    value: string;
    /**
     * Description below the number
     */
    description: string;
    /**
     * Card background color (any valid CSS color)
     * Default: 'bg-gray-100'
     */
    bgColorClass?: string;
    /**
     * Main number/text color (any valid CSS color class)
     * Default: 'text-foreground/50'
     */
    textColorClass?: string;
    /**
     * Optional inline background color (hex/rgba/css var), takes precedence over bgColorClass.
     */
    backgroundColor?: string;
    /**
     * Optional inline text color (hex/rgba/css var), takes precedence over textColorClass.
     */
    textColor?: string;
}

export default function StatCard({
    value,
    description,
    bgColorClass = "bg-gray-100",
    textColorClass = "text-foreground/50",
    backgroundColor,
    textColor,
}: StatCardProps) {
    return (
        <div className={`relative overflow-hidden min-h-0 rounded-lg ${bgColorClass}`} style={backgroundColor ? { backgroundColor } : undefined}>
            <span
                className={`absolute inset-0 flex items-start justify-start p-6 text-6xl font-light ${textColorClass}`}
                style={textColor ? { color: textColor } : undefined}
            >
                {value}
            </span>
            <p
                className={`absolute bottom-0 left-0 p-6 text-lg font-light ${textColorClass}`}
                style={textColor ? { color: textColor } : undefined}
            >
                {description}
            </p>
        </div>
    );
}