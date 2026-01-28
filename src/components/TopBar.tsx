import { useState, useEffect } from 'react';
import { Clock, Package, MapPin, MessageCircle } from 'lucide-react';
import { useStore } from '../store/store';

const iconMap: Record<string, any> = {
    Clock,
    PackageX: Package,
    MapPin,
    MessageCircle
};

// Component for animated TopBar item
function AnimatedTopBarItem({ item }: { item: any }) {
    const [showDetails, setShowDetails] = useState(false);
    const [currentDetailIndex, setCurrentDetailIndex] = useState(0);

    const IconComponent = item.icon ? iconMap[item.icon] : null;

    useEffect(() => {
        // Cycle through: title -> detail 0 -> detail 1 -> ... -> title
        const totalSteps = item.details.length + 1; // +1 for title
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep = (currentStep + 1) % totalSteps;

            if (currentStep === 0) {
                // Show title
                setShowDetails(false);
                setCurrentDetailIndex(0);
            } else {
                // Show detail at index currentStep - 1
                setShowDetails(true);
                setCurrentDetailIndex(currentStep - 1);
            }
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [item.details.length]);

    return (
        <div className="top-bar-item">
            <div className="top-bar-item-content">
                <div className="top-bar-icon">
                    {IconComponent && <IconComponent size={16} />}
                </div>
                <div className="top-bar-text-container">
                    <div className={`top-bar-text ${showDetails ? 'hidden' : 'visible'}`}>
                        <span className="top-bar-item-title">{item.title}</span>
                    </div>
                    <div className={`top-bar-text ${showDetails ? 'visible' : 'hidden'}`}>
                        <span className="top-bar-item-detail">
                            {item.details[currentDetailIndex]}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TopBar() {
    const { topBar } = useStore();
    const {
        active = true,
        backgroundColor = '#000000',
        textColor = '#ffffff',
        dollarRate = 5.80,
        items = []
    } = topBar || {};

    if (!active) return null;

    // Filter only items that have the new structure (with title and details)
    const activeItems = items
        .filter(item => item.active && item.title && item.details)
        .sort((a, b) => a.order - b.order);

    return (
        <div
            className="top-bar"
            style={{
                backgroundColor: backgroundColor,
                color: textColor
            }}
        >
            <div className="container top-bar-container">
                <div className="top-bar-items">
                    {activeItems.map((item) => (
                        <AnimatedTopBarItem key={item.id} item={item} />
                    ))}
                </div>

                {/* Separator and Dollar Rate */}
                <div className="top-bar-dollar">
                    <span className="top-bar-separator">|</span>
                    <span className="dollar-label">US$ 1</span>
                    <span className="dollar-equals">=</span>
                    <span className="dollar-value">R$ {dollarRate.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
        </div>
    );
}
