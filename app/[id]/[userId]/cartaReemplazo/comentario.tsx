import ArrowIcon from "@/app/components/assets/ArrowIcon";
import CheckIcon from "@/app/components/assets/CheckIcon";
import CloseAIcon from "@/app/components/assets/CloseIcon";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Typography, IconButton, TextField, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { useState } from "react";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

type ComentarioProps = {
    type: string;
    comentario: string;
    isAction?: boolean; // Boolean to enable actions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSuggestedActions?: (actions: any) => void; // Function to update the general state of comments
    id: string
};

const selectIcon = (type: string) => {
    switch (type) {
        case 'yettostart':
            return <CloseAIcon />;
        case 'inprogress':
            return <ArrowIcon />;
        case 'done':
            return <CheckIcon />
    }
}

const Comentario = ({ type, comentario, isAction = false, setSuggestedActions, id }: ComentarioProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(comentario);
    const [selectedType, setSelectedType] = useState(type);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleTypeChange = (event: SelectChangeEvent<string>) => {
        setSelectedType(event.target.value);
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedComment(event.target.value);
    };

    const handleSaveEdit = async () => {
        try {
            // Call API to update the comment
            const body = {
                userId: 117,
                userName: "10000254",
                icon: selectedType,
                comment: editedComment,
                id,
            };

            const response = await fetch(`/api/suggestedActions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            const updatedData = await response.json();
            // Update the general state of comments
            if (updatedData && updatedData.suggestedActions && setSuggestedActions) {
                setSuggestedActions(updatedData.suggestedActions);
            }

        } catch (error) {
            console.error('Error updating comment:', error);
        } finally {
            setIsEditing(false);
        }
    };

    const handleDeleteClick = async (id: string) => {
        try {
            const body = {
                userId: 117,
                userName: "10000254",
                id,
            };

            const response = await fetch(`/api/suggestedActions`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to update comment');
            }

            const deleteData = await response.json();
            // Update the general state of comments
            if (deleteData && deleteData.suggestedActions && setSuggestedActions) {
                setSuggestedActions(deleteData.suggestedActions);
            }

        } catch (error) {
            console.error('Error updating comment:', error);
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            height={isAction ? "40px" : "30px"}
            sx={{
                cursor: 'pointer',
                ...(isAction && { margin: "5px 0" }) // Add margin only when isAction is true
            }}
        >
            {isEditing ? (
                <>
                    <Select
                        value={selectedType}
                        onChange={handleTypeChange}
                        size="small"
                        sx={{ marginRight: "5px", fontSize: "0.875rem", height: "40px" }} // Match height
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
                        value={editedComment}
                        onChange={handleCommentChange}
                        size="small"
                        sx={{ marginLeft: "5px", flex: 1, fontSize: "0.875rem", height: "40px" }} // Match height
                        InputProps={{
                            style: { fontSize: "0.875rem", height: "40px" } // Adjust input height
                        }}
                    />
                </>
            ) : (
                <>
                    {selectIcon(type)}
                    <Typography variant='subtitle1' marginLeft="5px" flex={1}>{comentario}</Typography>
                </>
            )}
            {isAction && (
                <Box>
                    <IconButton onClick={isEditing ? handleSaveEdit : handleEditClick}>
                        {isEditing ? <DoneIcon /> : <EditIcon />}
                    </IconButton>
                    <IconButton onClick={isEditing ? () => setIsEditing(false) : () => handleDeleteClick(id)}>
                        {isEditing ? <CloseIcon /> : <DeleteIcon />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default Comentario;