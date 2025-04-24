"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    TextField,
    SelectChangeEvent,
    Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import Grid from '@mui/material/Grid2';
import Comentario from './comentario';
import { useDialog } from '@/context/DialogContext';
import { DialogType } from '../matriz-de-sucesion/page';
import { useParams, useSearchParams } from 'next/navigation';

type PotentialSuccessorsType = {
    userIdSuccessor: number;
    userNameSuccessor: string;
    term: string;
    photo64base: string;
    app: string
    fullName: string;
    idPuesto: string
};

type SuccessorsType = {
    user: {
        userId: number;
        userName: string;
        idPuesto: number | null;
        photo64base: string;
        app: string
        fullName: string;
        positionName: string;
    };
    potentialSuccessors: PotentialSuccessorsType[];
};

// Helper function to get background color based on term
const getBackgroundColor = (term: string) => {
    switch (term) {
        case 'CP (<1 año)':
            return '#4CAF50'; // Green
        case 'MP (1 a 3 años)':
            return '#FFEB3B'; // Yellow
        case 'LP (3 a 5 años)':
            return '#FF9800'; // Orange
        default:
            return '#E0E0E0';
    }
};

// Group successors by term
const groupSuccessorsByTerm = (potentialSuccessors: PotentialSuccessorsType[]) => {
    const grouped: Record<string, PotentialSuccessorsType[]> = {};

    potentialSuccessors.forEach(successor => {
        if (!grouped[successor.term]) {
            grouped[successor.term] = [];
        }
        grouped[successor.term].push(successor);
    });

    return grouped;
};

const SuccessorsComponent = () => {
    const searchParams = useSearchParams(); // Para obtener los query params
    const params = useParams(); // Para obtener los params dinámicos de la ruta

    const idPuesto = searchParams.get('idPuesto')
    const userName = searchParams.get('userName')
    const userId = params.userId
    const [successors, setSuccessors] = useState<SuccessorsType | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [suggestedActions, setSuggestedActions] = useState<any | null>(null); // State for suggested actions
    const [loading, setLoading] = useState(true);
    const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null); // State for hovered photo
    const [openModal, setOpenModal] = useState(false); // State for modal visibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [newType, setNewType] = useState("yettostart");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { openDialog } = useDialog();

    const handleOpenFichaTalento = (route: string, name: string, userid: string, username: string, positionid: string) => {
        openDialog(route as DialogType, name as string, { dialogUserId: userid, dialogUserName: username, dialogPositionId: positionid });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [response1, response2] = await Promise.all([
                    fetch(`/api/successors?userId=${userId}&userName=${userName}&idPuesto=${idPuesto}`),
                    fetch(`/api/suggestedActions?userId=${userId}&userName=${userName}`)
                ]);

                if (!response1.ok || !response2.ok) {
                    throw new Error("Error al cargar los datos");
                }

                const data1 = await response1.json();
                const data2 = await response2.json();

                setSuccessors(data1.data);
                setSuggestedActions(data2.suggestedActions); // Save response2 data
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleAddCommentClick = () => {
        setIsAddingComment(true);
    };

    const handleNewCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewComment(event.target.value);
    };

    const handleNewTypeChange = (event: SelectChangeEvent<string>) => {
        setNewType(event.target.value);
    };

    const handleSaveNewComment = async () => {
        try {
            const body = {
                userId,
                userName,
                icon: newType,
                comment: newComment,
            };

            const response = await fetch(`/api/suggestedActions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const newCommentData = await response.json();

            // Update the suggestedActions state with the new comment
            setSuggestedActions(newCommentData.suggestedActions);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsAddingComment(false);
            setNewComment("");
            setNewType("");
        }
    };

    const handleCancelNewComment = () => {
        setIsAddingComment(false);
        setNewComment("");
        setNewType("yettostart");
    };

    if (loading) {
        return (
            <Box sx={{ padding: 2 }}>
                <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                    <Skeleton variant="rectangular" width={600} height={100} />
                </Box>
                <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
                    <Skeleton variant="circular" width={120} height={120} />
                </Box>
                <Box sx={{ marginBottom: 2 }}>
                    <Skeleton variant="rectangular" width="100%" height={300} />
                </Box>
                <Box>
                    <Skeleton variant="rectangular" width="100%" height={200} />
                </Box>
            </Box>
        );
    }

    const groupedSuccessors = groupSuccessorsByTerm(successors?.potentialSuccessors || []);
    const termLabels = {
        'CP (<1 año)': 'Corto Plazo (<1 año)',
        'MP (1 a 3 años)': 'Mediano Plazo (1-3 años)',
        'LP (3 a 5 años)': 'Largo Plazo (>3 años)'
    };

    console.log("groupedSuccessors", groupedSuccessors)

    return (
        <>
            <Box sx={{ display: "flex", height: "calc(100vh - 65px)", width: "100%", background: "#f2f2f2", gap: 2, flexDirection: "column", padding: "20px" }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2} >
                    <Box sx={{ background: "#fff", borderRadius: "20px", border: "1px solid #ccc", padding: "20px 10px 10px 10px", width: "600px", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
                        <Typography>{successors?.user.fullName}</Typography>
                        <Typography variant='subtitle1'>{successors?.user.positionName}</Typography>
                    </Box>
                    <Box width={"120px"} height={"120px"}>
                        {hoveredPhoto && ( // Only show the image when hoveredPhoto is set
                            <img
                                src={hoveredPhoto}
                                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                            />
                        )}
                    </Box>
                    <Grid container spacing={5} sx={{ width: "100%", padding: "0 20px" }}>
                        {Object.keys(termLabels).map(term => {
                            const successorsL = groupedSuccessors[termLabels[term as keyof typeof termLabels]] || [];

                            return (
                                <Grid size={4} key={term}>
                                    <TableContainer component={Paper}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: getBackgroundColor(term) }}>
                                                    <TableCell sx={{ color: '#000' }}>
                                                        <Typography variant='subtitle1' fontWeight={600}>{term}</Typography>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ color: '#000' }}>
                                                        <Typography variant='subtitle1' fontWeight={600}>%APP</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {successorsL.map((successor, index) => (
                                                    <TableRow
                                                        key={successor.userIdSuccessor}
                                                        onMouseEnter={() => setHoveredPhoto(successor.photo64base)} // Set photo on hover
                                                        onMouseLeave={() => setHoveredPhoto(null)} // Reset photo on hover out
                                                        sx={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#ffffff' }} // Darker color for even rows
                                                    >
                                                        <TableCell>
                                                            <Box onClick={() => handleOpenFichaTalento('fichaTalento', successor.fullName, successor.userIdSuccessor.toString(), successor.userNameSuccessor, successor.idPuesto)}>
                                                                <Typography variant='subtitle1' sx={{ cursor: "pointer" }}>{successor.fullName}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {successor.app && (
                                                                <Box onClick={() => handleOpenFichaTalento('app', successor.fullName, successor.userIdSuccessor.toString(), successor.userNameSuccessor, (successors?.user.idPuesto?.toString() || 'defaultPositionId'))}>
                                                                    <Typography variant='subtitle1' sx={{ cursor: "pointer" }}>{successor.app}%</Typography>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {successorsL.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">
                                                            <Typography variant='subtitle1'>No hay sucesores</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
                <Typography variant='subtitle1' sx={{ marginTop: "20px" }}>Acciones sugeridas</Typography>
                <Grid container sx={{ background: "#fff", borderRadius: "20px", border: "1px solid #ccc", padding: "20px 10px 10px 10px", width: "100%", flex: 1, display: "flex", flexDirection: "column" }} onClick={() => handleOpenModal()}>

                    {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        suggestedActions && suggestedActions.map((action: any, index: number) => (
                            <Comentario
                                key={index}
                                type={action.icon}
                                comentario={action.comment}
                                isAction={false}
                                id={action.id}
                            />
                        ))}
                </Grid>
            </Box>
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>Acciones sugeridas</DialogTitle>
                <DialogContent>
                    {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        suggestedActions && suggestedActions.map((comment: any, index: any) => (
                            <Comentario
                                key={index}
                                type={comment.icon}
                                comentario={comment.comment}
                                isAction={true}
                                id={comment.id}
                                setSuggestedActions={setSuggestedActions}
                            />
                        ))}
                    {!isAddingComment && (
                        <Box display="flex" justifyContent="center" sx={{ marginTop: "10px" }}>
                            <IconButton onClick={handleAddCommentClick}>
                                <AddIcon />
                            </IconButton>
                        </Box>
                    )}
                    {isAddingComment && (
                        <Box display="flex" alignItems="center" height="40px" sx={{ margin: "5px 0" }}>
                            <Select
                                value={newType}
                                onChange={handleNewTypeChange}
                                size="small"
                                sx={{ marginRight: "5px", fontSize: "0.875rem", height: "40px" }}
                            >
                                <MenuItem value="yettostart">
                                    <Typography variant="subtitle1">Close</Typography>
                                </MenuItem>
                                <MenuItem value="inprogress">
                                    <Typography variant="subtitle1">In Progress</Typography>
                                </MenuItem>
                                <MenuItem value="done">
                                    <Typography variant="subtitle1">Done</Typography>
                                </MenuItem>
                            </Select>
                            <TextField
                                value={newComment}
                                onChange={handleNewCommentChange}
                                size="small"
                                sx={{ marginLeft: "5px", flex: 1, fontSize: "0.875rem", height: "40px" }}
                                InputProps={{
                                    style: { fontSize: "0.875rem", height: "40px" }
                                }}
                            />
                            <IconButton onClick={handleSaveNewComment}>
                                <DoneIcon />
                            </IconButton>
                            <IconButton onClick={handleCancelNewComment}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SuccessorsComponent;
