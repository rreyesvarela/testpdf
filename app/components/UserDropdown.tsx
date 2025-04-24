'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, ClickAwayListener } from '@mui/material';
import UserIcon from './assets/UserIcon';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Import arrow icon

interface UserDropdownProps {
    isSelected: boolean;
    // userId: string;
    // userName: string;
    // positionId: string;
    // report: string;
    currentPath: string;
    name: string;
    lastName: string;
    bloque: string;
    onNavigate: (path: string) => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
    isSelected,
    // userId,
    // userName,
    // positionId,
    // report,
    currentPath,
    name,
    lastName,
    bloque,
    onNavigate
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Function to handle navigation to user paths
    const handleNavigation = (path: string) => {
        setMenuOpen(false);
        onNavigate(path);
    };

    // Create base styles for dropdown items
    const dropdownItemBaseStyle = {
        py: 1,
        px: 2,
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        '&:last-child': {
            borderBottom: 'none',
        },
        '&:hover': {
            bgcolor: '#f8f8f8',
        },
        transition: 'background-color 0.2s ease',
    };

    // Create styles for selected dropdown items
    const getDropdownItemStyle = (isItemSelected: boolean) => {
        return {
            ...dropdownItemBaseStyle,
            borderLeft: isItemSelected ? '3px solid #f84f03' : '3px solid transparent',
        };
    };

    // Create base style for the nav item
    const navItemBaseStyle = {
        margin: "10px",
        display: "flex",
        alignItems: 'center',
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",

    };

    // Function to determine the correct style based on selection state
    const getNavItemStyle = (isSelected: boolean) => {
        // Base style for all navigation items
        const baseStyle = { ...navItemBaseStyle };

        // Only add hover effects for non-selected items
        if (!isSelected) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hoverStyle: Record<string, any> = {
                "& .nav-text": {
                    color: "#404040 !important"
                },
                "& svg g": {
                    fill: "#404040 !important"
                }
            };

            return {
                ...baseStyle,
                "&:hover": hoverStyle
            };
        }

        return baseStyle;
    };

    // get the first word of the name and the first letter of the lastname
    const formattedName = name ? name.split(' ')[0] : '';
    const formattedLastName = lastName ? lastName[0] : '';


    return (
        <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
            <Box sx={{ position: 'relative' }}>

                <Box
                    ref={menuRef}
                    sx={getNavItemStyle(isSelected)}
                    onClick={() => setMenuOpen(!menuOpen)}
                >

                    {/* icon */}
                    <Box height={20} width={20} sx={{ mt: 0.5 }}>
                        <UserIcon isSelected={isSelected} />
                    </Box>

                    {/* text */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: -0.5,
                    }}>
                        <Typography
                            variant='caption' // Changed from h4 to caption for better size
                            className="nav-text"
                            color={isSelected ? "#f84f03" : "#7f7f7f"}
                            sx={{
                                fontSize: '0.75rem', // Explicit font size
                                fontWeight: isSelected ? 'medium' : 'normal',
                            }}
                        >
                            {`${formattedName} ${formattedLastName}` || "Usuario"}
                        </Typography>
                        <KeyboardArrowDownIcon
                            fontSize="small"
                            sx={{
                                ml: 0.3,
                                color: isSelected ? "#f84f03" : "#7f7f7f",
                                fontSize: '0.875rem', // Smaller icon
                                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </Box>

                </Box>

                {menuOpen && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            top: '55px',
                            right: -20,
                            zIndex: 1000,
                            width: '220px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mt: 0.5,
                            animation: 'fadeIn 0.2s ease-in-out',
                            '@keyframes fadeIn': {
                                '0%': {
                                    opacity: 0,
                                    transform: 'translateY(-10px)'
                                },
                                '100%': {
                                    opacity: 1,
                                    transform: 'translateY(0)'
                                }
                            }
                        }}
                    >
                        <Box sx={{ py: 0.5 }}>

                            {/* Ficha de talento */}
                            <Box
                                sx={getDropdownItemStyle(currentPath === 'fichaTalento')}
                                onClick={() => handleNavigation('fichaTalento')}
                            >
                                <Typography
                                    sx={{ fontSize: '14px', fontWeight: currentPath === 'fichaTalento' ? 'bold' : 'normal', color: currentPath === 'fichaTalento' ? '#f84f03' : '#7f7f7f' }}
                                >
                                    Ficha de Talento
                                </Typography>
                            </Box>

                            {/* Matriz de sucesión */}
                            {bloque != "2" && (
                                <Box
                                    sx={getDropdownItemStyle(currentPath === 'matriz-de-sucesion')}
                                    onClick={() => handleNavigation('matriz-de-sucesion')}
                                >
                                    <Typography
                                        sx={{ fontSize: '14px', fontWeight: currentPath === 'matriz-de-sucesion' ? 'bold' : 'normal', color: currentPath === 'matriz-de-sucesion' ? '#f84f03' : '#7f7f7f' }}
                                    >
                                        Matriz de Sucesión
                                    </Typography>
                                </Box>
                            )}

                            {/* Cartas de Reemplazo */}
                            {bloque == "2" && (
                                <Box
                                    sx={getDropdownItemStyle(currentPath === 'cartaReemplazo')}
                                    onClick={() => handleNavigation('cartaReemplazo')}
                                >
                                    <Typography
                                        sx={{ fontSize: '14px', fontWeight: currentPath === 'cartaReemplazo' ? 'bold' : 'normal', color: currentPath === 'cartaReemplazo' ? '#f84f03' : '#7f7f7f' }}
                                    >
                                        Cartas de Reemplazo
                                    </Typography>
                                </Box>
                            )}

                        </Box>
                    </Paper>
                )}
            </Box>
        </ClickAwayListener>
    );
};

export default UserDropdown;