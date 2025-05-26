import React from 'react';

interface SvgSelectorProps {
    id: string;
    className?: string;
    color?: string;
}

const SvgSelector: React.FC<SvgSelectorProps> = ({id, className, color = '#333333'}) => {
    switch (id) {
        case 'catalog':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={color}
                >
                    <g strokeWidth={2}>
                        <path
                            strokeWidth={1}
                            d="M11 19v-3a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3zm-8 0v-3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm19-3a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3zm-1 3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2zm1-14a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3zm-1 3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2zM2 5v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3zm1 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm6.5 11.238l-3.443 3.43-1.822-1.822.738-.738 1.084 1.088L8.762 15.5z"
                        />
                    </g>
                </svg>
            );

        case 'profile':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24"
                     stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path
                        d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.72 11.28 8.72 9.51C8.72 7.7 10.18 6.23 12 6.23C13.81 6.23 15.28 7.7 15.28 9.51C15.27 11.28 13.88 12.72 12.12 12.78Z"/>
                    <path
                        d="M18.74 19.38C16.96 21.01 14.6 22 12 22C9.4 22 7.04 21.01 5.26 19.38C5.36 18.44 5.96 17.52 7.03 16.8C9.77 14.98 14.25 14.98 16.97 16.8C18.04 17.52 18.64 18.44 18.74 19.38Z"/>
                </svg>
            );

        case 'cart':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={color}
                >
                    <g strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path
                            d="M7.5 18C8.33 18 9 18.67 9 19.5C9 20.33 8.33 21 7.5 21C6.67 21 6 20.33 6 19.5C6 18.67 6.67 18 7.5 18Z"/>
                        <path
                            d="M16.5 18C17.33 18 18 18.67 18 19.5C18 20.33 17.33 21 16.5 21C15.67 21 15 20.33 15 19.5C15 18.67 15.67 18 16.5 18Z"/>
                        <path d="M9.5 9L10.03 12.12"/>
                        <path d="M15.53 9L15 12.12"/>
                        <path
                            d="M2 3L4.59 4.32C4.96 4.87 4.96 5.59 4.96 7.04V9.76C4.96 12.7 5.02 13.67 5.89 14.59C6.75 15.5 8.15 15.5 10.94 15.5H12"/>
                        <path
                            d="M16.24 15.5C17.8 15.5 18.58 15.5 19.13 15.05C19.69 14.6 19.84 13.84 20.16 12.31L20.66 9.88C21 8.14 21.18 7.27 20.73 6.7C20.29 6.12 18.77 6.12 17.09 6.12H11.02"/>
                        <path d="M4.96 6.12H7"/>
                    </g>
                </svg>
            );
        case 'search':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                    fill="none"
                    viewBox="0 -0.5 25 25"
                    stroke={color}
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.5 10.7655C5.50003 8.01511 7.44296 5.64777 10.1405 5.1113C12.8381 4.57483 15.539 6.01866 16.5913 8.55977C17.6437 11.1009 16.7544 14.0315 14.4674 15.5593C12.1804 17.0871 9.13257 16.7866 7.188 14.8415C6.10716 13.7604 5.49998 12.2942 5.5 10.7655Z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M17.029 16.5295L19.5 19.0005"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );

        case 'cross':
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={className}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M16 8L8 16"/>
                    <path d="M12 12L16 16"/>
                    <path d="M8 8L10 10"/>
                </svg>
            );
        case 'eye':
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     className={className}
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke={color}
                     strokeWidth={1.5}
                     strokeLinecap="round"
                     strokeLinejoin="round">
                    <path
                        d="M20.595 11.38C15.855 6.6 8.145 6.6 3.405 11.38L2.645 12.14C2.445 12.34 2.445 12.66 2.645 12.86L3.405 13.62C8.145 18.4 15.855 18.4 20.595 13.62L21.355 12.86C21.555 12.66 21.555 12.34 21.355 12.14L20.595 11.38Z"
                    />
                    <path
                        d="M12.0049 15.06C13.4188 15.06 14.5649 13.9139 14.5649 12.5C14.5649 11.0862 13.4188 9.94 12.0049 9.94C10.5911 9.94 9.44495 11.0862 9.44495 12.5C9.44495 13.9139 10.5911 15.06 12.0049 15.06Z"
                    />
                </svg>
            );

        case 'eye-off':
            return (
                <svg xmlns="http://www.w3.org/2000/svg"
                     className={className}
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke={color}
                     strokeWidth={1.5}
                     strokeLinecap="round"
                     strokeLinejoin="round">
                    <path
                        d="M19.91 14.255C20.15 14.065 20.37 13.845 20.59 13.615L21.35 12.845C21.55 12.645 21.55 12.325 21.35 12.125L20.59 11.355C17.52 8.265 13.22 7.165 9.27 8.085"
                    />
                    <path
                        d="M4.09 10.735C3.85 10.925 3.63 11.145 3.41 11.375L2.65 12.145C2.45 12.345 2.45 12.665 2.65 12.865L3.41 13.635C6.48 16.725 10.78 17.825 14.73 16.905"
                    />
                    <path d="M11.46 14.995C10.93 14.885 10.46 14.605 10.11 14.215"/>
                    <path d="M13.9 10.775C13.55 10.385 13.08 10.105 12.55 9.995"/>
                    <path d="M3.6 7.635L20.41 17.365"/>
                </svg>
            );

        default:
            return null;
    }
};

export default SvgSelector;