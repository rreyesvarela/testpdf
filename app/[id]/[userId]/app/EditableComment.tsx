import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Typography, CircularProgress } from '@mui/material';
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
    RefreshCcw
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useState } from 'react';
import CardComentario from '../fichaTalento/comentarios/CardComentario';

export interface CommentRes {
    category: string;
    positionId: string;
    originalComment: string;
    comment: string;
    originalCommentDate: string;
}

export interface EditableCommentProps {
    content: React.ReactNode;
    category: string;
    userId: string;
    userName: string;
    positionId: string;
    allComments: CommentRes[];
    onSave: (newContent: string) => void;
    isFichaTalento?: boolean;
    type?: string;
    lengthComment?: number
}

const EditableComment: React.FC<EditableCommentProps> = ({ content, onSave, category, userId, userName, positionId, allComments, isFichaTalento = false, type = "APP", lengthComment }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [saving, setSaving] = useState(false)

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

    const handleRestoreOriginal = () => {
        // Find the comment with matching category and positionId
        const originalCommentObj = allComments.find(
            comment => comment.category === category
        );

        if (originalCommentObj && originalCommentObj.originalComment) {
            // Set the edited content to the original comment
            setEditedContent(originalCommentObj.originalComment);

            // Update editor content if it exists
            if (editor) {
                editor.commands.setContent(originalCommentObj.originalComment);
            }

        } else {
            console.warn('No original comment found for this category and position');
        }
    }

    // Function to handle saving content (no implementation yet)
    const handleSaveContent = async (content: string) => {
        setSaving(true)

        let payload = {}

        if (type === "APP") {
            payload = {
                userId,
                userName,
                positionId,
                comments: [
                    {
                        category,
                        positionId,
                        comment: content
                    }
                ]
            };

        } else if (type === "hogan") {
            payload = {
                userId,
                userName,
                category,
                comment: content
            }
        } else if (type === "mgt") {
            payload = {
                userId,
                userName,
                positionId,
                comments: [
                    {
                        category,
                        positionId,
                        comment: content
                    }
                ]

            }
        }

        try {
            const response = await fetch(`/api/${type}`, {
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
            {isFichaTalento ? (
                <CardComentario
                    onClick={handleOpen}
                    titulo={category}
                    lengthComment={lengthComment}
                    content={content}
                />
            ) :
                <div
                    className="app-editable-content"
                    onClick={handleOpen}
                >
                    {content}
                </div>

            }

            <Dialog open={isEditing} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{
                    backgroundColor: '#ff5722',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    <Typography variant="h5" component="div">
                        Editar Comentario
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

                            {/* restaurar comentario original */}
                            <Tooltip title="Volver a comentario original">
                                <div className="tiptap-button-restore">
                                    <button
                                        className={`tiptap-toolbar-restore`}
                                        onClick={handleRestoreOriginal}
                                    >
                                        <RefreshCcw size={16} style={{ marginRight: '5px' }} />
                                        Restaurar original
                                    </button>
                                </div>
                            </Tooltip>
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

export default EditableComment;