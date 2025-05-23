import React from 'react';

type ThemeIconProps = {
    isSelected: boolean;
    className?: string; // Added optional className prop
}

const ThemeIcon: React.FC<ThemeIconProps> = ({ isSelected, className }) => {
    return (
        <svg
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 512 512"
            className={className} // Added className prop
        >
            <g fill={isSelected ? "#f84f03" : "#7f7f7f"}>
                <g>
                    <path d="M438.944,352c11.046,0,20-8.954,20-20V80c0-44.112-35.888-80-80-80H133.056c-44.112,0-80,35.888-80,80v352
			c0,44.112,35.888,80,80,80h245.888c44.113,0,80-35.888,80.001-80c0-11.046-8.954-20-20-20c-11.046,0-20,8.954-20,20
			c0,22.056-17.944,40-40,40H133.056c-22.056,0-40-17.944-40-40V80c0-22.056,17.944-40,40-40h245.889c22.056,0,40,17.944,40,40v252
			C418.944,343.046,427.899,352,438.944,352z"/>
                </g>
            </g>
            <g fill={isSelected ? "#f84f03" : "#7f7f7f"}>
                <g>
                    <path d="M358.944,120h-206c-11.046,0-20,8.954-20,20s8.954,20,20,20h206c11.046,0,20-8.954,20-20S369.989,120,358.944,120z" />
                </g>
            </g>
            <g fill={isSelected ? "#f84f03" : "#7f7f7f"}>
                <g>
                    <path d="M358.944,200h-206c-11.046,0-20,8.954-20,20s8.954,20,20,20h206c11.046,0,20-8.954,20-20S369.989,200,358.944,200z" />
                </g>
            </g>
            <g fill={isSelected ? "#f84f03" : "#7f7f7f"}>
                <g>
                    <path d="M278.054,280H152.944c-11.046,0-20,8.954-20,20c0,11.046,8.954,20,20,20h125.112c11.046,0,19.999-8.954,19.999-20
			C298.054,288.954,289.1,280,278.054,280z"/>
                </g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
            <g>
            </g>
        </svg>
    )
}

export default ThemeIcon;