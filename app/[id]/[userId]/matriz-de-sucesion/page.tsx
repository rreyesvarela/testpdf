"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import MatrixSuccesionSkeleton from "./MatrixSuccesionSkeleton";
import Link from "next/link";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Typography } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useParams } from 'next/navigation';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Edit
} from "lucide-react";
import { CircularProgress } from '@mui/material';
import { useDialog } from '@/context/DialogContext';

interface UserData {
    userId: string,
    userName: string,
    idPuesto: string,
    photo64base: string,
    fullName: string,
    positionName: string,
    app: string,
}

interface PotentialSuccessorsData {
    userIdSuccessor: string,
    userNameSuccessor: string,
    term: string,
    photo64base: string,
    fullName: string,
    app: string,
    idPuesto: string,
}

interface PotentialSuccessorsForData {
    ouIdPuestoEmployee: string,
    term: string,
    positionName: string,
    app: string,
}

export interface ResponseDataMatrixSuccession {
    user: UserData,
    potentialSuccessors: PotentialSuccessorsData[],
    potentialSuccessorFor: PotentialSuccessorsForData[],
}

interface PdiData {
    pdiId: string,
    objectiveId: string,
    developmentPriority: string,
}

interface ResponseDataMatrixDetails {
    motivation: [{
        lateral: string,
        vertical: string,
    }],
    strength: string[],
    pdi: PdiData[],
}

export type DialogType = 'fichaTalento' | 'app' | null;

interface EditableCommentProps {
    content: React.ReactNode;
    userId: string;
    userName: string;
    onSave: (newContent: string) => void;
}


// Move EditableComment to a separate non-exported component
const EditableComment: React.FC<EditableCommentProps> = ({ content, onSave, userId, userName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [saving, setSaving] = useState(false)
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';
    
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable code block
            }),
            TiptapUnderline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        content: editedContent,
        onUpdate: ({ editor }) => {
            setEditedContent(editor.getHTML());
        },
    });

    const handleOpen = () => {
        // Extract text content from HTML
        const tempDiv = document.createElement('div');
        if (content) {
            // @ts-expect-error - ignore error
            tempDiv.innerHTML = content.props.dangerouslySetInnerHTML.__html;
            const htmlContent = tempDiv.innerHTML;
            setEditedContent(htmlContent);

            // Update editor content if it exists
            if (editor) {
                editor.commands.setContent(htmlContent);
            }
        }
        setIsEditing(true);
    };

    const handleClose = () => {
        setIsEditing(false);
    };

    // Function to handle saving content (no implementation yet)
    const handleSaveContent = async (content: string) => {
        setSaving(true)

        const payload = {
            userId,
            userName,
            comments: content
        };

        try {
            const response = await fetch('/api/strength', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                setIsEditing(false);
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            setIsEditing(false);
            onSave(content);

        } catch (error) {
            console.error("Failed to save number:", error);
        }
        setSaving(false)

    };

    // Format buttons renderer
    const renderFormatButtons = () => {
        return (
            <div className="tiptap-format-dropdown">
                <button
                    className={`tiptap-dropdown-item ${editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    Encabezado 1
                </button>
                <button
                    className={`tiptap-dropdown-item ${editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    Encabezado 2
                </button>
                <button
                    className={`tiptap-dropdown-item ${editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    Encabezado 3
                </button>
                <button
                    className={`tiptap-dropdown-item ${editor?.isActive('paragraph') ? 'is-active' : ''}`}
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                >
                    Párrafo
                </button>
            </div>
        );
    };

    return (
        <>
            <div
                className="app-editable-content detail-item strength-content"
                onClick={handleOpen}
            >
                {content}

                {/* edit button */}
                <div className="edit-button">
                   {!isPDF && <Edit size={16} />}
                </div>
            </div>

            <Dialog open={isEditing} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{
                    backgroundColor: '#ff5722',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Typography variant="h5" component="div">
                        Editar Fortaleza
                    </Typography>
                </DialogTitle>

                {/* format buttons */}
                <DialogContent>
                    <div className="tiptap-editor-container">
                        <div className="tiptap-toolbar">
                            {/* Format dropdown */}
                            <div className="tiptap-dropdown">
                                <button className="tiptap-toolbar-button tiptap-dropdown-trigger">
                                    Formatos <span className="caret-down">▼</span>
                                </button>
                                {renderFormatButtons()}
                            </div>

                            {/* Text alignment */}
                            <div className="tiptap-button-group">
                                <Tooltip title="Alinear a la izquierda">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                                    >
                                        <AlignLeft size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Alinear al centro">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                                    >
                                        <AlignCenter size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Alinear a la derecha">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                                    >
                                        <AlignRight size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Justificar">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                                    >
                                        <AlignJustify size={16} />
                                    </button>
                                </Tooltip>
                            </div>

                            {/* Text formatting */}
                            <div className="tiptap-button-group">
                                <Tooltip title="Negrita">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive('bold') ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().toggleBold().run()}
                                    >
                                        <Bold size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Cursiva">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive('italic') ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    >
                                        <Italic size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Subrayado">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive('underline') ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    >
                                        <Underline size={16} />
                                    </button>
                                </Tooltip>
                            </div>

                            {/* Lists */}
                            <div className="tiptap-button-group">
                                <Tooltip title="Lista no numerada">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive('bulletList') ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                    >
                                        <List size={16} />
                                    </button>
                                </Tooltip>
                                <Tooltip title="Lista numerada">
                                    <button
                                        className={`tiptap-toolbar-button ${editor?.isActive('orderedList') ? 'is-active' : ''}`}
                                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                    >
                                        <ListOrdered size={16} />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>

                        <EditorContent editor={editor} className="tiptap-editor" />
                    </div>
                </DialogContent>

                {/* buttons */}
                <DialogActions sx={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e0e0e0',
                    justifyContent: 'flex-end',
                    gap: '7px'
                }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        color="error"
                        disabled={saving}
                        sx={{
                            fontWeight: 'bold',
                            minWidth: '100px'
                        }}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        onClick={() => handleSaveContent(editedContent)}
                        disabled={saving}
                        sx={{
                            fontWeight: 'bold',
                            minWidth: '100px',
                            background: 'linear-gradient(135deg, #ff8a00, #ffbb00)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            textTransform: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #ff7600, #ffb700)',
                                boxShadow: '0 4px 8px rgba(255, 138, 0, 0.3)'
                            },
                            '&:active': {
                                transform: 'translateY(1px)',
                                boxShadow: '0 2px 3px rgba(255, 138, 0, 0.3)'
                            }
                        }}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : "GUARDAR"}
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    );
};

export default function MatrizSucesion() {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';
    // get userId, userName and positionId from local storage
    let userIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    let userNameFromStorage = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    let positionIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('positionId') : null;

    // get id from url

    if (isPDF) {
        userIdFromStorage = searchParams.get('userId');
        userNameFromStorage = searchParams.get('userName');
        positionIdFromStorage = searchParams.get('positionId');
    }

    const { id } = useParams(); // Extract the dynamic route parameter [id]
    const ID = Array.isArray(id) ? id[0] : id || ''; // Handle the extracted parameter
    const USERID = userIdFromStorage || '';
    const USERNAME = userNameFromStorage || '';
    const POSITIONID = positionIdFromStorage || '';

    const [matrixSuccessionData, setmatrixSuccessionData] = useState<ResponseDataMatrixSuccession | null>(null);
    const [matrixDetailsData, setmatrixDetailsData] = useState<ResponseDataMatrixDetails | null>(null);
    const [strength, setStrength] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openDialog } = useDialog();

    const handleOpenFichaTalento = (route: string, name: string, userid: string, username: string, positionid: string) => {
        // You can pass props if needed
        openDialog(route as DialogType, name as string, { dialogUserId: userid, dialogUserName: username, dialogPositionId: positionid });
    };

    useEffect(() => {
        async function fetchData() {

            // Validación de parámetros requeridos
            if (!USERID || !USERNAME || !POSITIONID) {
                window.location.href = `/${ID}/organigrama`;
                return;
            }

            setLoading(true);
            try {
                // Create query parameters for both API calls
                const queryParamsMatrixSuccesion = new URLSearchParams({
                    userId: USERID,
                    userName: USERNAME,
                    idPuesto: POSITIONID,
                });

                // Create query parameters for both API calls
                const queryParamsMatrixDetails = new URLSearchParams({
                    userId: USERID,
                    userName: USERNAME,
                });

                // Fetch data from both endpoints in parallel
                const [successionResponse, detailsResponse] = await Promise.all([
                    fetch(`/api/matrixSuccession?${queryParamsMatrixSuccesion.toString()}`),
                    fetch(`/api/matrixDetails?${queryParamsMatrixDetails.toString()}`)
                ]);

                // Check if succession response is valid
                if (!successionResponse.ok) {
                    throw new Error(`Error in succession data: ${successionResponse.status}`);
                }

                // Check if details response is valid
                if (!detailsResponse.ok) {
                    throw new Error(`Error in details data: ${detailsResponse.status}`);
                }

                // Parse both responses
                const successionResult = await successionResponse.json();
                const detailsResult = await detailsResponse.json();

                setStrength(detailsResult.strength);

                // Set both states with the fetched data
                setmatrixSuccessionData(successionResult.data);
                setmatrixDetailsData(detailsResult);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
                <div className="skeleton_container">
                    <MatrixSuccesionSkeleton />
                </div>
            </Box>
        );
    }

    if (error) {
        return (
            <div className="app-error">
                <h2>Error al cargar los datos</h2>
                <p style={{ marginTop: '10px' }}>Ha ocurrido un problema al obtener la información. Por favor, intenta nuevamente.</p>
                <button
                    className="app-retry-button"
                    onClick={() => window.location.reload()}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const getAppColor = (term: string) => {
        if (term == 'Corto Plazo (<1 año)') return '#50A31F'; // Green
        if (term == 'Mediano Plazo (1-3 años)') return '#E1E203'; // Yellow
        if (term == 'Largo Plazo (>3 años)') return '#FF9603'; // Orange
    };

    const getAppTextColor = (term: string) => {
        return term == 'Largo Plazo (>3 años)' ? '#FFFFFF' : '#000000';
    };

    const formatPositionName = (positionName: string) => {
        if (!positionName) return '';

        // First handle the case where there's no space after a number and dot
        const processed = positionName.toLowerCase().replace(/(\d+\.)(\w+)/g, (match, numDot, word) => {
            return numDot + " " + word.charAt(0).toUpperCase() + word.slice(1);
        });

        // Then handle normal space-separated words
        return processed.split(' ')
            .map(word => {
                // Skip words that are just numbers or punctuation
                if (/^[\d\.\:\,\;\-]+$/.test(word)) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
            <div className="matriz-sucesion-container">
                <div className="matrix-content">

                    {/* Left Column */}
                    <div className="left-column">

                        {/* User Profile and Succession Row */}
                        <div className="profile-succession-row">

                            {/* User Profile Section */}
                            <div className="section-container">
                                <div className="profile-card">
                                    <div className="profile-photo-wrapper">
                                        <div className="profile-photo">
                                            {matrixSuccessionData?.user?.photo64base ? (
                                                <img src={matrixSuccessionData.user.photo64base} alt={matrixSuccessionData.user.fullName} />
                                            ) : (
                                                <img src="/assets/user.svg" alt={matrixSuccessionData?.user?.fullName || "Usuario"} />
                                            )}
                                        </div>
                                    </div>
                                    <h2 className="profile-name">{matrixSuccessionData?.user?.fullName || "Usuario"}</h2>
                                    <h2 className="position-name">{matrixSuccessionData?.user?.positionName || "Usuario"}</h2>
                                    <div className="profile-buttons">
                                        <Link href={`fichaTalento?userName=${USERNAME}&positionId=${POSITIONID}`} className="btn-user btn-gray">Ficha Talento</Link>
                                        <Link href={`app`} className="btn-user btn-gray btn-app">{Number(matrixSuccessionData?.user?.app).toFixed(0) || "0"}% APP</Link>
                                        <Link href={`pdi`} className="btn-user btn-gray">PDI</Link>
                                    </div>
                                </div>
                            </div>

                            {/* Succession Section */}
                            <div className="section-container">
                                <h3 className="section-header">Sucesión</h3>
                                <div className="succession-card">
                                    <div className="succession-list">
                                        {matrixSuccessionData?.potentialSuccessorFor && matrixSuccessionData.potentialSuccessorFor.length > 0 ? (
                                            matrixSuccessionData.potentialSuccessorFor.map((successor, index) => (
                                                <div key={index} className="succession-item">
                                                    <div className="position-name">{formatPositionName(successor.positionName)}</div>

                                                    <button
                                                        onClick={() => handleOpenFichaTalento('app', matrixSuccessionData?.user?.fullName, USERID, USERNAME, successor.ouIdPuestoEmployee)}
                                                        // href={`/${ID}/${replacement.userIdSuccessor}/app?userName=${replacement.userNameSuccessor}&positionId=${POSITIONID}`} 
                                                        className="btn btn-app"
                                                        style={{
                                                            backgroundColor: getAppColor(successor.term),
                                                            color: getAppTextColor(successor.term)
                                                        }}
                                                    >
                                                        {Number(successor.app).toFixed(0)}% APP
                                                    </button>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-data">No hay datos disponibles</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Development Details Card */}
                        <div className="development-card">
                            <div className="development-sections">

                                {/* Development Priorities */}
                                <div className="development-section">
                                    <h3 className="section-title">Prioridades de Desarrollo</h3>
                                    <div className="section-content">
                                        {matrixDetailsData?.pdi && Array.isArray(matrixDetailsData.pdi) && matrixDetailsData.pdi.length > 0 ? (
                                            matrixDetailsData.pdi.map((item, index) => (
                                                <div key={index} className="detail-item">{formatPositionName(item.developmentPriority)}</div>
                                            ))
                                        ) : (
                                            <div className="no-data">Información no disponible</div>
                                        )}
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div className="development-section">
                                    <h3 className="section-title">Fortalezas</h3>
                                    <div className="section-content strength-content">
                                        <EditableComment
                                            content={strength ? <div dangerouslySetInnerHTML={{ __html: strength }} /> : ''}
                                            onSave={(newContent) => setStrength(newContent)}
                                            userId={USERID}
                                            userName={USERNAME}
                                        />
                                    </div>
                                </div>

                                {/* Motivation */}
                                <div className="development-section">
                                    <h3 className="section-title">Motivación</h3>
                                    <div className="section-content">
                                        <p className="detail-item">Lateral:</p>
                                        <p className={`detail-item ${!matrixDetailsData?.motivation?.[0]?.lateral ? 'no-data' : ''}`}>
                                            {formatPositionName(matrixDetailsData?.motivation?.[0]?.lateral || "- No disponible")}
                                        </p>
                                        <br />
                                        <p className="detail-item">Vertical:</p>
                                        <p className={`detail-item ${!matrixDetailsData?.motivation?.[0]?.vertical ? 'no-data' : ''}`}>
                                            {formatPositionName(matrixDetailsData?.motivation?.[0]?.vertical || "- No disponible")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Replacement Cards */}
                    <div className="right-column">
                        <h3 className="section-header">Cartas de Reemplazo</h3>
                        <div className="replacement-card">
                            <div className="replacement-list">
                                {matrixSuccessionData?.potentialSuccessors && matrixSuccessionData.potentialSuccessors.length > 0 ? (
                                    matrixSuccessionData.potentialSuccessors.map((replacement, index) => (
                                        <div key={index} className="replacement-item">
                                            <div className="replacement-content">
                                                <div className="replacement-photo-container">
                                                    {replacement.photo64base ? (
                                                        <img src={replacement.photo64base} alt={replacement.fullName} />
                                                    ) : (
                                                        <img src="/default-profile.jpg" alt={replacement.fullName || "Usuario"} />
                                                    )}
                                                </div>
                                                <div className="replacement-name">{replacement.fullName}</div>
                                            </div>

                                            {/* Botones */}
                                            <div className="replacement-actions">

                                                {/* ficha de talento */}
                                                <button
                                                    onClick={() => handleOpenFichaTalento('fichaTalento', replacement.fullName, replacement.userIdSuccessor, replacement.userNameSuccessor, POSITIONID)}
                                                    // href={`/${ID}/${replacement.userIdSuccessor}/fichaTalento?userName=${replacement.userNameSuccessor}&positionId=${POSITIONID}`} 
                                                    className="btn btn-gray"
                                                >
                                                    Ficha Talento
                                                </button>

                                                {/* app */}
                                                <button
                                                    onClick={() => handleOpenFichaTalento('app', replacement.fullName, replacement.userIdSuccessor, replacement.userNameSuccessor, POSITIONID)}
                                                    // href={`/${ID}/${replacement.userIdSuccessor}/app?userName=${replacement.userNameSuccessor}&positionId=${POSITIONID}`} 
                                                    className="btn btn-app"
                                                    disabled={!replacement.app}
                                                    style={{
                                                        backgroundColor: getAppColor(replacement.term),
                                                        color: getAppTextColor(replacement.term)
                                                    }}
                                                >
                                                    {replacement.app ? `${Number(replacement.app).toFixed(0)}% APP` : 'Sin datos de APP'}
                                                </button>

                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="no-data">No hay datos disponibles</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Box>
    );
}