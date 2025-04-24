/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useEffect } from 'react';
import { useProfileContext } from '@/context/ProfileContext';
import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Modal,
    Box,
    TextField,
    Button,
    Typography,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Studies from './Studies';

export const formatDateDD = (date: Date | string): string => {
    if (date instanceof Date) {
        return format(date, 'dd/MM/yyyy');
    }
    return date;
};

const TalentCardSimplified: React.FC = () => {
    const { profileState, setProfileState } = useProfileContext();

    const router = useRouter();

    useEffect(() => {
        if (profileState?.talendCard) {
            return;
        }

        if (typeof window !== 'undefined') {
            const talendCardFromStorage = JSON.parse(localStorage.getItem('employeeData') || 'null');
            const userNameFromStorage = localStorage.getItem('userName');
            const userIdFromStorage = localStorage.getItem('userId');

            if (talendCardFromStorage && userNameFromStorage && userIdFromStorage) {
                setProfileState(prev => {
                    const updatedState = {
                        ...prev,
                        talendCard: talendCardFromStorage,
                        userName: userNameFromStorage,
                        userId: userIdFromStorage,
                    };
                    localStorage.setItem('employeeData', JSON.stringify(updatedState.talendCard));
                    localStorage.setItem('userName', updatedState.userName);
                    localStorage.setItem('userId', updatedState.userId);
                    return updatedState;
                });
            } else {
                router.push('/organigrama'); // Redirect if no data in localStorage
            }
        }
    }, [profileState?.talendCard, setProfileState, router]);

    const internalTrajectory = profileState.talendCard?.experiences?.interna || [];
    const externalTrajectory = profileState.talendCard?.experiences?.externa || [];
    const userName = profileState.userName;
    const userId = profileState.userId;
    const [openInternalTrajectoryModal, setOpenInternalTrajectoryModal] = useState(false);
    const [openExternalTrajectoryModal, setOpenExternalTrajectoryModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [deleteItem, setDeleteItem] = useState<any>(null);
    const [typeElement, setTypeElement] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedInternalTrajectory, setSelectedInternalTrajectory] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedExternalTrajectory, setSelectedExternalTrajectory] = useState<any>(null);

    const handleAddInternalTrajectory = () => {
        setSelectedInternalTrajectory({
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
        });
        setOpenInternalTrajectoryModal(true);
    };

    const handleAddExternalTrajectory = () => {
        setSelectedExternalTrajectory({
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
        });
        setOpenExternalTrajectoryModal(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpenDeleteModal = (item: any, type: string) => {
        setDeleteItem(item);
        setOpenDeleteModal(true);
        setTypeElement(type);
    };

    const handleConfirmDelete = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleteBody: any = {
            userId,
            userName,
            toDelete: {
                [typeElement]: {
                    IdExpInterna: deleteItem.IdExpInterna
                }
            }
        };
        try {
            const response = await fetch(`/api/cv`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deleteBody),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            const resp = await response.json();
            setProfileState(prev => {
                const updatedState = {
                    ...prev,
                    talendCard: { ...resp.updatedData }
                };
                localStorage.setItem('employeeData', JSON.stringify(updatedState.talendCard));
                return updatedState;
            });
        } catch (error) {
            console.error("Failed to save number:", error);
        }

        setOpenDeleteModal(false);
        setDeleteItem(null);
    };

    const handleCancelDelete = () => {
        setOpenDeleteModal(false);
        setDeleteItem(null);
    };

    const handleEditInternalTrajectory = (index: number) => {
        setSelectedInternalTrajectory({ ...internalTrajectory[index], index });
        setOpenInternalTrajectoryModal(true);
    };

    const handleCancelInternalTrajectory = () => {
        setOpenInternalTrajectoryModal(false);
        setSelectedInternalTrajectory(null);
    };

    const handleEditExternalTrajectory = (index: number) => {
        setSelectedExternalTrajectory({ ...externalTrajectory[index], index });
        setOpenExternalTrajectoryModal(true);
    };

    const handleSaveTrajectory = async (type: string, selected: any) => {
        const body: any = {
            userId,
            userName,
            experiences: [{
                company: selected.company,
                position: selected.position,
                location: selected.location,
                startDate: formatDateDD(selected.startDate),
                endDate: formatDateDD(selected.endDate),
            }]
        };

        if (selected.IdExpInterna) {
            body.experiences[0].IdExpInterna = selected.IdExpInterna;

            try {
                const response = await fetch(`/api/cv`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const resp = await response.json();
                setProfileState(prev => {
                    const updatedState = {
                        ...prev,
                        talendCard: { ...resp.updatedData }
                    };
                    localStorage.setItem('employeeData', JSON.stringify(updatedState.talendCard));
                    return updatedState;
                });

            } catch (error) {
                console.error("Failed to save number:", error);
            }
        } else {
            const postBody = {
                userId,
                userName,
                attributeType: "experience",
                item: {
                    type: "externa",
                    company: selected.company,
                    position: selected.position,
                    location: selected.location,
                    startDate: formatDateDD(selected.startDate),
                    endDate: formatDateDD(selected.endDate),
                }
            };
            try {
                const response = await fetch(`/api/cv`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postBody),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                const resp = await response.json();
                if (type === "externa") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setProfileState((prev: any) => {
                        const updatedState = {
                            ...prev,
                            talendCard: {
                                ...prev.talendCard,
                                experiences: {
                                    ...prev.talendCard.experiences.interna,
                                    externa: [...prev.talendCard.experiences.externa, resp.updatedAttribute.newItem]
                                },
                            },
                        };
                        localStorage.setItem('employeeData', JSON.stringify(updatedState.talendCard));
                        return updatedState;
                    });
                } else {
                    setProfileState((prev: any) => {
                        const updatedState = {
                            ...prev,
                            talendCard: {
                                ...prev.talendCard,
                                experiences: {
                                    ...prev.talendCard.experiences.externa,
                                    interna: [...prev.talendCard.experiences.interna, resp.updatedAttribute.newItem]
                                },
                            },
                        };
                        localStorage.setItem('employeeData', JSON.stringify(updatedState.talendCard));
                        return updatedState;
                    });
                }
            } catch (error) {
                console.error("Failed to save number:", error);
            }
        }
        if (type === "externa") {
            setOpenExternalTrajectoryModal(false);
        } else {
            setOpenInternalTrajectoryModal(false);
        }
    };

    const handleCancelExternalTrajectory = () => {
        setOpenExternalTrajectoryModal(false);
        setSelectedExternalTrajectory(null);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="talent-card-container">
                <div className="section">
                    <div className="section-title">
                        <span className="title-text">Información Personal</span>
                    </div>
                    <Studies handleOpenDeleteModal={handleOpenDeleteModal} />
                </div>
                <div className="section trajectory-section">
                    <div className="subsection-header">Trayectoria Interna</div>

                    <div className="trajectory-table" style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                        <table className="trajectory-table" style={{ padding: "10px 15px" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Fecha Final</th>
                                    <th style={{ textAlign: "left" }}>Empresa</th>
                                    <th style={{ textAlign: "left" }}>Puesto</th>
                                    <th style={{ textAlign: "left" }}>Fecha Inicial</th>
                                    <th style={{ textAlign: "right" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internalTrajectory.map((trajectory, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: "left" }}>{trajectory.endDate}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.company}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.position}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.startDate}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <EditIcon
                                                sx={{ cursor: 'pointer', marginRight: 1 }}
                                                onClick={() => handleEditInternalTrajectory(index)}
                                            />
                                            <DeleteIcon
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleOpenDeleteModal(trajectory, "experience")}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                className="btn-save"
                                style={{ width: "50px", minWidth: "50px", marginRight: "10px", marginBottom: "10px" }}
                                onClick={handleAddInternalTrajectory}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <Modal open={openInternalTrajectoryModal} onClose={handleCancelInternalTrajectory}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 600,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Editar Trayectoria Interna
                        </Typography>
                        {selectedInternalTrajectory && (
                            <>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <DesktopDatePicker
                                            label="Fecha Inicial"
                                            format="dd/MM/yyyy"
                                            value={new Date(selectedInternalTrajectory.startDate)}
                                            onChange={(date) =>
                                                setSelectedInternalTrajectory({
                                                    ...selectedInternalTrajectory,
                                                    startDate: date,
                                                })
                                            }
                                            maxDate={new Date()}
                                            slotProps={{
                                                textField: {
                                                    InputLabelProps: {
                                                        sx: {
                                                            color: "black",

                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <DesktopDatePicker
                                            label="Fecha de finalización"
                                            format="dd/MM/yyyy"
                                            value={new Date(selectedInternalTrajectory.endDate)}
                                            onChange={(date) => {
                                                if (date && date >= new Date(selectedInternalTrajectory.startDate)) {
                                                    setSelectedInternalTrajectory({ ...selectedInternalTrajectory, endDate: date });
                                                } else {
                                                    alert('La fecha final no puede ser anterior a la fecha inicial.');
                                                    setSelectedInternalTrajectory({ ...selectedInternalTrajectory, endDate: undefined });
                                                }
                                            }}
                                            maxDate={new Date()}
                                            slotProps={{
                                                textField: {
                                                    InputLabelProps: {
                                                        sx: {
                                                            color: "black",

                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Empresa"
                                            value={selectedInternalTrajectory.company}
                                            onChange={(e) =>
                                                setSelectedInternalTrajectory({ ...selectedInternalTrajectory, company: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Puesto"
                                            value={selectedInternalTrajectory.position}
                                            onChange={(e) =>
                                                setSelectedInternalTrajectory({ ...selectedInternalTrajectory, position: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Ubicación"
                                            value={selectedInternalTrajectory.location ?? ''}
                                            onChange={(e) =>
                                                setSelectedInternalTrajectory({ ...selectedInternalTrajectory, location: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button variant="contained" color="info" onClick={handleCancelInternalTrajectory}>
                                        Cancelar
                                    </Button>
                                    <Button variant="contained" color="warning" onClick={() => handleSaveTrajectory("interna", selectedInternalTrajectory)}>
                                        Guardar
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Modal>

                <div className="section trajectory-section">
                    <div className="subsection-header">Trayectoria Externa</div>

                    <div className="trajectory-table" style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                        <table className="trajectory-table" style={{ padding: "10px 15px" }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "left" }}>Fecha Final</th>
                                    <th style={{ textAlign: "left" }}>Empresa</th>
                                    <th style={{ textAlign: "left" }}>Puesto</th>
                                    <th style={{ textAlign: "left" }}>Fecha Inicial</th>
                                    <th style={{ textAlign: "right" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {externalTrajectory.map((trajectory, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: "left" }}>{trajectory.endDate}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.company}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.position}</td>
                                        <td style={{ textAlign: "left" }}>{trajectory.startDate}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <EditIcon
                                                sx={{ cursor: 'pointer', marginRight: 1 }}
                                                onClick={() => handleEditExternalTrajectory(index)}
                                            />
                                            <DeleteIcon
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleOpenDeleteModal(trajectory, "experience")}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button
                                className="btn-save"
                                style={{ width: "50px", minWidth: "50px", marginRight: "10px", marginBottom: "10px" }}
                                onClick={handleAddExternalTrajectory}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <Modal open={openExternalTrajectoryModal} onClose={handleCancelExternalTrajectory}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 600,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Editar Trayectoria Externa
                        </Typography>
                        {selectedExternalTrajectory && (
                            <>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <DesktopDatePicker
                                            label="Fecha Inicial"
                                            format="dd/MM/yyyy"
                                            value={new Date(selectedExternalTrajectory.startDate)}
                                            onChange={(date) =>
                                                setSelectedExternalTrajectory({
                                                    ...selectedExternalTrajectory,
                                                    startDate: date,
                                                })
                                            }
                                            maxDate={new Date()}
                                            slotProps={{
                                                textField: {
                                                    InputLabelProps: {
                                                        sx: {
                                                            color: "black",

                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={6}>
                                        <DesktopDatePicker
                                            label="Fecha Final"
                                            format="dd/MM/yyyy"
                                            value={new Date(selectedExternalTrajectory.endDate)}
                                            onChange={(date) => {
                                                if (date && date >= new Date(selectedExternalTrajectory.startDate)) {
                                                    setSelectedExternalTrajectory({ ...selectedExternalTrajectory, endDate: date });
                                                } else {
                                                    alert('La fecha final no puede ser anterior a la fecha inicial.');
                                                }
                                            }}
                                            maxDate={new Date()}
                                            slotProps={{
                                                textField: {
                                                    InputLabelProps: {
                                                        sx: {
                                                            color: "black",

                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Empresa"
                                            value={selectedExternalTrajectory.company}
                                            onChange={(e) =>
                                                setSelectedExternalTrajectory({ ...selectedExternalTrajectory, company: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Puesto"
                                            value={selectedExternalTrajectory.position}
                                            onChange={(e) =>
                                                setSelectedExternalTrajectory({ ...selectedExternalTrajectory, position: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <TextField
                                            fullWidth
                                            label="Ubicación"
                                            value={selectedExternalTrajectory.location ?? ''}
                                            onChange={(e) =>
                                                setSelectedExternalTrajectory({ ...selectedExternalTrajectory, location: e.target.value })
                                            }
                                            sx={{ mb: 2 }}
                                            slotProps={{
                                                inputLabel: {
                                                    sx: {
                                                        color: "black",
                                                    }
                                                },

                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                    <Button variant="contained" color="info" onClick={handleCancelExternalTrajectory}>
                                        Cancelar
                                    </Button>
                                    <Button variant="contained" color="warning" onClick={() => handleSaveTrajectory("externa", selectedExternalTrajectory)}>
                                        Guardar
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Modal>

                <Modal open={openDeleteModal} onClose={handleCancelDelete}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Confirmar Eliminación
                        </Typography>
                        <Typography variant='subtitle1' sx={{ marginBottom: "20px" }}>
                            ¿Está seguro de que desea eliminar este elemento?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn-cancel" color="info" onClick={handleCancelDelete}>
                                Cancelar
                            </button>
                            <button className="btn-save" color="error" onClick={handleConfirmDelete}>
                                Eliminar
                            </button>
                        </Box>
                    </Box>
                </Modal>

                <div className="action-buttons">
                    <button className="btn-cancel" style={{ marginBottom: "10px" }} onClick={() => router.back()}>
                        Regresar
                    </button>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default TalentCardSimplified;