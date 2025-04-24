import React from 'react';

type MenuIconProps = {
    isSelected: boolean;
    className?: string; // Added optional className prop
}

const MenuIcon: React.FC<MenuIconProps> = ({ isSelected, className }) => {
    return (
        <svg
            version="1.1"
            id="svg12900"
            width="100%"
            height="100%"
            viewBox="0 0 682.66669 682.66669"
            xmlns="http://www.w3.org/2000/svg"
            className={className} // Added className prop
        ><defs
            id="defs12904"><clipPath
                clipPathUnits="userSpaceOnUse"
                id="clipPath12914"><path
                        fill="red"
                        d="M 0,512 H 512 V 0 H 0 Z"
                        id="path12912" /></clipPath></defs><g
                            id="g12906"
                            transform="matrix(1.3333333,0,0,-1.3333333,0,682.66667)"><g
                                id="g12908"><g
                                    id="g12910"
                                    clipPath="url(#clipPath12914)"><g
                                        id="g12916"
                                        transform="translate(440,388)"><path
                                d="m 0,0 h -368 c -28.719,0 -52,23.281 -52,52 0,28.719 23.281,52 52,52 H 0 c 28.719,0 52,-23.281 52,-52"
                                style={{
                                    fill: "none",
                                    stroke: isSelected ? "#f84f03" : "#7f7f7f",
                                    strokeWidth: 40,
                                    strokeLinecap: "round",
                                    strokeLinejoin: "miter",
                                    strokeMiterlimit: 10,
                                    strokeDasharray: "none",
                                    strokeOpacity: 1
                                }}
                                id="path12918" /></g><g
                                    id="g12920"
                                    transform="translate(440,20)"><path
                                d="m 0,0 h -368 c -28.719,0 -52,23.281 -52,52 0,28.719 23.281,52 52,52 H 0 c 28.719,0 52,-23.281 52,-52"
                                style={{
                                    fill: "none",
                                    stroke: isSelected ? "#f84f03" : "#7f7f7f",
                                    strokeWidth: 40,
                                    strokeLinecap: "round",
                                    strokeLinejoin: "miter",
                                    strokeMiterlimit: 10,
                                    strokeDasharray: "none",
                                    strokeOpacity: 1
                                }}
                                id="path12922" /></g><g
                                    id="g12924"
                                    transform="translate(440,204)"><path
                                d="m 0,0 h -368 c -28.719,0 -52,23.281 -52,52 0,28.719 23.281,52 52,52 H 0 c 28.719,0 52,-23.281 52,-52"
                                style={{
                                    fill: "none",
                                    stroke: isSelected ? "#f84f03" : "#7f7f7f",
                                    strokeWidth: 40,
                                    strokeLinecap: "round",
                                    strokeLinejoin: "miter",
                                    strokeMiterlimit: 10,
                                    strokeDasharray: "none",
                                    strokeOpacity: 1
                                }}
                                id="path12926" /></g></g></g></g></svg>
    )
}

export default MenuIcon;