'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';

import MenuIcon from './assets/MenuIcon';
import ThemeIcon from './assets/ThemeIcon';
import OrganigramaIcon from './assets/OrganigramaIcon';
import HomeIcon from './assets/HomeIcon';
import UserDropdown from './UserDropdown'; // Import the new UserDropdown component
import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatName = (name: string) => {
    if (!name) return '';

    // Split by spaces and format each word
    return name.toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const MenuAction = () => {
    const router = useRouter();
    const pathname = usePathname();
    const report = pathname.split("/")[1] as keyof typeof reportIdToName;
    const params = useParams();
    const searchParams = useSearchParams(); // Para obtener los query params
    const isPDF = searchParams.get('isPDF') === 'true';
    const nameURL = searchParams.get('name') || '';
    const lastNameURL = searchParams.get('lastName') || '';

    const USERID = Array.isArray(params.userId) ? params.userId[0] : (params.userId || ''); // Ensure USERID is a string
    // const USERNAME = searchParams.get('userName') || ''; // Extracted from the query parameter
    // const POSITIONID = searchParams.get('positionId') || ''; // Extracted from the query parameter

    // Use state to store name and lastName to avoid localStorage SSR issues
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bloque, setBloque] = useState('');
    const [directorFields, setDirectorFields] = useState(false);

    // Only access localStorage after component mounts (client-side only)
    useEffect(() => {

        // Function to get values from localStorage
        const updateUserFromStorage = () => {
            if (isPDF) {
                setName(nameURL);
                setLastName(lastNameURL);
            } else {
                setName(localStorage.getItem('name') || '');
                setLastName(localStorage.getItem('lastName') || '');
                setBloque(localStorage.getItem('bloque') || '');
            }
            if (localStorage.getItem('positionIdDirectores') !== null && localStorage.getItem('userIdDirectores') !== null && localStorage.getItem('userNameDirectores') !== null) {
                setDirectorFields(true);
            } else {
                setDirectorFields(false);
            }
        };

        // Initial load from localStorage
        updateUserFromStorage();

        // Set up event listener to detect localStorage changes
        window.addEventListener('storage', updateUserFromStorage);

        // Custom event for cross-component communication
        const handleCustomStorageEvent = () => updateUserFromStorage();
        window.addEventListener('localStorageChange', handleCustomStorageEvent);

        return () => {
            window.removeEventListener('storage', updateUserFromStorage);
            window.removeEventListener('localStorageChange', handleCustomStorageEvent);
        };
    }, []);

    const handleClick = (page: string) => {
        // Only clear localStorage on the client side
        if (typeof window !== 'undefined') {
            localStorage.removeItem('name');
            localStorage.removeItem('lastName');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('positionId');

            localStorage.removeItem('employeeData');
            localStorage.removeItem('hoganData');
            localStorage.removeItem('mgtData');
            localStorage.removeItem('talentCardDetailData');

            // Dispatch custom event to notify about localStorage changes
            window.dispatchEvent(new Event('localStorageChange'));
        }
        if (page === "inicio") {
            localStorage.removeItem('bloque');
            localStorage.removeItem('userIdDirectores');
            localStorage.removeItem('userNameDirectores');
            localStorage.removeItem('positionIdDirectores');
            window.dispatchEvent(new Event('localStorageChange'));
            return router.push(`/${report}`);
        } else if (page === "agenda") {
            localStorage.removeItem('bloque');
            localStorage.removeItem('userIdDirectores');
            localStorage.removeItem('userNameDirectores');
            localStorage.removeItem('positionIdDirectores');
            window.dispatchEvent(new Event('localStorageChange'));
            return router.push(`/${report}/agenda`);
        } else if (page === "directoresn3") {
            localStorage.removeItem('userIdDirectores');
            localStorage.removeItem('userNameDirectores');
            localStorage.removeItem('positionIdDirectores');
            window.dispatchEvent(new Event('localStorageChange'));
        }
        return router.push(`/${report}/${page}`);
    }

    // Handle user dropdown item navigation
    const handleUserNavigation = (path: string) => {
        // router.push(`/${report}/${USERID}/${path}?userName=${USERNAME}&positionId=${POSITIONID}`);
        if (path === "cartaReemplazo") {
            const USERID = localStorage.getItem('userId') || '';
            const USERNAME = localStorage.getItem('userName') || '';
            const POSITIONID = localStorage.getItem('positionId') || '';
            router.push(`/${report}/${USERID}/${path}?userName=${USERNAME}&idPuesto=${POSITIONID}`);
        } else {
            router.push(`/${report}/${USERID}/${path}`);
        }
    }

    const isHome = pathname.split("/").length == 2

    const reportIdToName = {
        'revestimientos': 'Revestimientos',
        'adhesivos': 'Adhesivos',
        'administracion-y-finanzas': 'Administración y Finanzas',
        'recursos-humanos': 'Recursos Humanos'
    }
    const reportName = reportIdToName[report]

    const userPathToName = {
        'fichaTalento': 'Ficha de Talento',
        'matriz-de-sucesion': 'Matriz de Sucesión',
        'pdi': 'Plan de Desarrollo Individual',
        'app': 'Análisis Puesto vs. Persona',
        'cartaReemplazo': 'Carta de Reemplazo',
    }
    const userPaths = ['fichaTalento', 'matriz-de-sucesion', 'pdi', 'app', 'comentarios', 'editarCV', 'cartaReemplazo'];

    const initialPaths = ['', 'agenda'];
    const bloquePaths = ['temas', 'directoresn3', 'organigrama'];

    const currentPath = pathname.split("/").filter(Boolean).pop();

    const isInitialPath = initialPaths.includes(currentPath || '');
    const isBloquePath = bloquePaths.includes(currentPath || '');
    const isUserPath = currentPath ? userPaths.includes(currentPath) : false;

    let userPath;
    if (!isInitialPath || !isBloquePath) { // its a user path
        userPath = currentPath && currentPath in userPathToName ? userPathToName[currentPath as keyof typeof userPathToName] : '';
    }

    // Create separate styles for active and inactive items
    const navItemBaseStyle = {
        margin: "10px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s ease",
    };

    // Function to determine the correct style based on item type and selection state
    const getNavItemStyle = (isSelected: boolean, itemType: string) => {
        // Base style for all navigation items
        const baseStyle = { ...navItemBaseStyle };

        // Only add hover effects for non-selected items
        if (!isSelected) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hoverStyle: Record<string, any> = {
                "& .nav-text": {
                    color: "#404040 !important"
                }
            };

            // Add specific styles based on icon type
            if (itemType === 'menu') {
                // For MenuIcon - only change stroke color, not width
                hoverStyle["& svg path"] = {
                    stroke: "#404040 !important"
                };
            } else if (itemType === 'organigrama') {
                // For OrganigramaIcon - only change fill without affecting stroke width
                hoverStyle["& svg g"] = {
                    fill: "#404040 !important"
                };
            } else {
                // For other icons (Home, Theme) - change fill
                hoverStyle["& svg g"] = {
                    fill: "#404040 !important"
                };
            }

            return {
                ...baseStyle,
                "&:hover": hoverStyle
            };
        }

        return baseStyle;
    };

    return (
        isHome ? <></> :
            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "10px", marginBottom: "10px" }}>

                {/* titulo */}
                <Box sx={{ marginLeft: "15px" }}>
                    <Typography variant='body1'>{(isInitialPath || isBloquePath) ? currentPath == 'directoresn3' ? "Directores N3" : capitalize(currentPath || '') : `${formatName(name || '')} ${formatName(lastName || '')}`}</Typography>
                    <Typography variant='subtitle1'>{(isInitialPath || isBloquePath) ? `Dirección de Negocio ${reportName}` : `${userPath}`}</Typography>
                </Box>

                {/* menu */}
                {!isPDF &&
                    <Box sx={{ display: "flex", alignItems: "center", marginRight: "50px" }}>
                        <Box sx={{ background: "#f2f2f2", border: "1px solid #c6c6c6", borderRadius: "20px", width: "450px", height: "45px", display: "flex", alignItems: "center", paddingLeft: "20px" }}>

                            {/* inicio */}
                            <Box
                                sx={getNavItemStyle(isHome, 'home')}
                                onClick={() => handleClick("inicio")}
                            >
                                <Box height={20} width={20}>
                                    <HomeIcon isSelected={isHome} />
                                </Box>
                                <Typography
                                    variant='h4'
                                    className="nav-text"
                                    color={isHome ? "#f84f03" : "#7f7f7f"}
                                >
                                    Inicio
                                </Typography>
                            </Box>

                            {/* agenda */}
                            <Box
                                sx={getNavItemStyle(pathname.includes("agenda"), 'menu')}
                                onClick={() => handleClick("agenda")}
                            >
                                <Box height={20} width={20}>
                                    <MenuIcon isSelected={pathname.includes("agenda")} />
                                </Box>
                                <Typography
                                    variant='h4'
                                    className="nav-text"
                                    color={pathname.includes("agenda") ? "#f84f03" : "#7f7f7f"}
                                >
                                    Agenda
                                </Typography>
                            </Box>

                            {/* temas */}
                            {((isUserPath || isBloquePath) && bloque == "1") &&
                                <Box
                                    sx={getNavItemStyle((pathname.includes("temas")), 'theme')}
                                    onClick={() => handleClick("temas")}
                                >
                                    <Box height={20} width={20}>
                                        <ThemeIcon isSelected={(pathname.includes("temas"))} />
                                    </Box>
                                    <Typography
                                        variant='h4'
                                        className="nav-text"
                                        color={(pathname.includes("temas")) ? "#f84f03" : "#7f7f7f"}
                                    >
                                        Temas
                                    </Typography>
                                </Box>
                            }

                            {/* directores */}
                            {((isUserPath || isBloquePath) && bloque == "2") &&
                                <Box
                                    sx={getNavItemStyle(pathname.includes("directoresn3"), 'theme')}
                                    onClick={() => handleClick("directoresn3")}
                                >
                                    <Box height={20} width={20}>
                                        <ThemeIcon isSelected={pathname.includes("directoresn3")} />
                                    </Box>
                                    <Typography
                                        variant='h4'
                                        className="nav-text"
                                        color={pathname.includes("directoresn3") ? "#f84f03" : "#7f7f7f"}
                                    >
                                        Directores N3
                                    </Typography>
                                </Box>
                            }

                            {/* organigrama */}
                            {(isUserPath || (isBloquePath ? (bloque == '2' && directorFields) ? true : (bloque == '1') ? true : false : false)) &&
                                <Box
                                    sx={getNavItemStyle(pathname.includes("organigrama"), 'organigrama')}
                                    onClick={() => handleClick("organigrama")}
                                >
                                    <Box height={20} width={20}>
                                        <OrganigramaIcon isSelected={pathname.includes("organigrama")} />
                                    </Box>
                                    <Typography
                                        variant='h4'
                                        className="nav-text"
                                        color={pathname.includes("organigrama") ? "#f84f03" : "#7f7f7f"}
                                    >
                                        Organigrama
                                    </Typography>
                                </Box>
                            }

                            {/* User dropdown menu - only show if not on initial path */}
                            {!(isInitialPath || isBloquePath) && (
                                <UserDropdown
                                    isSelected={isUserPath}
                                    // userId={USERID}
                                    // userName={USERNAME}
                                    // positionId={POSITIONID}
                                    // report={report}
                                    bloque={bloque}
                                    currentPath={currentPath || ''}
                                    name={name}
                                    lastName={lastName}
                                    onNavigate={handleUserNavigation}
                                />
                            )}

                        </Box>
                        <Image className="iconMenu" src="/assets/grupo_lamosa.png" alt="Home Icon" width={60} height={32} />
                    </Box>
                }

            </Box>
    );
}

export default MenuAction;