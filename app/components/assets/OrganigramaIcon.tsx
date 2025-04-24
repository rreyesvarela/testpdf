// OrganigramaIcon.tsx
import React from 'react';

type OrganigramaIconProps = {
    isSelected: boolean;
    className?: string;  // Make className optional
}

const OrganigramaIcon: React.FC<OrganigramaIconProps> = ({ isSelected, className }) => {
    return (
        <svg
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipRule="evenodd" fill={isSelected ? "#f84f03" : "#7f7f7f"} fillRule="evenodd">
                <path d="M 8 4.8 c -0.1 0 -0.3 0.1 -0.3 0.3 v 3 c 0 0.1 0.1 0.3 0.3 0.3 h 8 c 0.1 0 0.3 -0.1 0.3 -0.3 v -3 c 0 -0.1 -0.1 -0.3 -0.3 -0.3 h -1 c -0.4 0 -0.8 -0.3 -0.8 -0.8 s 0.3 -0.8 0.8 -0.8 h 1 c 1 0 1.8 0.8 1.8 1.8 v 3 c 0 1 -0.8 1.8 -1.8 1.8 h -8 c -1 0 -1.8 -0.8 -1.8 -1.8 v -3 c 0 -1 0.8 -1.8 1.8 -1.8 h 3 c 0.4 0 0.8 0.3 0.8 0.8 s -0.3 0.8 -0.8 0.8 z" />
                <path d="M 1.3 17 c 0 -1 0.8 -1.8 1.8 -1.8 h 2 c 1 0 1.8 0.8 1.8 1.8 v 1 c 0 1 -0.8 1.8 -1.8 1.8 h -2 c -1 0 -1.8 -0.8 -1.8 -1.8 z m 1.8 -0.3 c -0.1 0 -0.3 0.1 -0.3 0.3 v 1 c 0 0.1 0.1 0.3 0.3 0.3 h 2 c 0.1 0 0.3 -0.1 0.3 -0.3 v -1 c 0 -0.1 -0.1 -0.3 -0.3 -0.3 z" />
                <path d="M 9.3 17 c 0 -1 0.8 -1.8 1.8 -1.8 h 2 c 1 0 1.8 0.8 1.8 1.8 v 1 c 0 1 -0.8 1.8 -1.8 1.8 h -2 c -1 0 -1.8 -0.8 -1.8 -1.8 z m 1.8 -0.3 c -0.1 0 -0.3 0.1 -0.3 0.3 v 1 c 0 0.1 0.1 0.3 0.3 0.3 h 2 c 0.1 0 0.3 -0.1 0.3 -0.3 v -1 c 0 -0.1 -0.1 -0.3 -0.3 -0.3 z" />
                <path d="M 17.3 17 c 0 -1 0.8 -1.8 1.8 -1.8 h 2 c 1 0 1.8 0.8 1.8 1.8 v 1 c 0 1 -0.8 1.8 -1.8 1.8 h -2 c -1 0 -1.8 -0.8 -1.8 -1.8 z m 1.8 -0.3 c -0.1 0 -0.3 0.1 -0.3 0.3 v 1 c 0 0.1 0.1 0.3 0.3 0.3 h 2 c 0.1 0 0.3 -0.1 0.3 -0.3 v -1 c 0 -0.1 -0.1 -0.3 -0.3 -0.3 z" />
                <path d="M 12 8.3 c 0.4 0 0.8 0.3 0.8 0.8 v 7 c 0 0.4 -0.3 0.8 -0.8 0.8 s -0.8 -0.3 -0.8 -0.8 v -7 c 0 -0.4 0.3 -0.8 0.8 -0.8 z" />
                <path d="M 3.3 13 c 0 -0.4 0.3 -0.8 0.8 -0.8 h 16 c 0.4 0 0.8 0.3 0.8 0.8 v 3 c 0 0.4 -0.3 0.8 -0.8 0.8 s -0.8 -0.3 -0.8 -0.8 v -2.3 h -14.5 v 2.3 c 0 0.4 -0.3 0.8 -0.8 0.8 s -0.8 -0.3 -0.8 -0.8 z" />
            </g>
        </svg>
    );
}

export default OrganigramaIcon;