// components/AnalisisPuestoVsPersonaContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import "./styles.css";
import APPSkeleton from "./APPSkeleton";
import { Box, Button, IconButton } from '@mui/material';
import { CircularProgress } from '@mui/material';
import { Check, ArrowLeft, X } from "lucide-react";
import EditableComment, { CommentRes } from "./EditableComment";

interface Score {
    category: string;
    positionId: string;
    originalScore: number;
    score: number;
    pond: number;
    originalScoreDate: string;
}

interface Images {
    GraficaEstiloObs: string;
    GraficaEstiloProy: string;
    GraficaEstiloNat: string;
    GraficaValores: string;
    GraficaProcesoP: string;
    GraficaPuestoEstilo: string;
    GraficaPuestoValores: string;
    GraficaPuestoGraficaProcesoP: string;
}

interface ResponseData {
    userId: string;
    userName: string;
    fullName: string;
    wonderlic: string;
    date: string;
    positionName: string;
    positionId: string,
    images: Images;
    comments: CommentRes[];
    scores: Score[];
}

interface EditableNumberProps {
    value: number | string;
    category: string;
    type: string;
    userId: string;
    userName: string;
    positionId: string;
    onSave: (newValue: number) => void;
}

const EditableNumber: React.FC<EditableNumberProps> = ({ value, onSave, category, type, userId, userName, positionId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState(typeof value === 'number' ? value : parseFloat(value) || 0);
    const [saving, setSaving] = useState(false)

    const handleOpen = () => {
        setEditedValue(typeof value === 'number' ? value : parseFloat(value) || 0);
        setIsEditing(true);
    };

    const handleClose = () => {
        setIsEditing(false);
    };

    interface MgtItem {
        category: string;
        positionId: string;
        score?: number;
        pond?: number;
    }

    function createPayload(
        userId: string,
        userName: string,
        positionId: string,
        category: string,
        type: 'score' | 'pond',
        value: number
    ) {
        const mgtItem: MgtItem = {
            category,
            positionId
        };

        // Add the appropriate property based on type
        if (type === 'score') {
            mgtItem.score = value;
        } else if (type === 'pond') {
            mgtItem.pond = value;
        }

        return {
            userId,
            userName,
            positionId,
            mgt: [mgtItem]
        };
    }

    // Function to handle saving number
    const handleSaveNumber = async (value: number) => {
        // console.log("Saving number:", value);
        setSaving(true)

        const payload = createPayload(userId, userName, positionId, category, type as 'score' | 'pond', value);

        try {
            const response = await fetch('/api/APP', {
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
            onSave(value);

        } catch (error) {
            console.error("Failed to save number:", error);
        }
        setSaving(false)
    };

    if (isEditing) {
        return (
            <div className="app-editable-number-container">
                <input
                    type="number"
                    className="app-input"
                    value={editedValue}
                    onChange={(e) => setEditedValue(Number(e.target.value))}
                    autoFocus
                />
                <div className="app-editable-actions">
                    <Button
                        onClick={() => handleSaveNumber(editedValue)}
                        className="app-save-btn"
                        size="small"
                        disabled={saving}
                        sx={{ minWidth: 10, padding: '3px' }}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : <Check className="text-green-500" size={20} />}
                    </Button>
                    <Button
                        onClick={handleClose}
                        className="app-cancel-btn"
                        size="small"
                        disabled={saving}
                        sx={{ minWidth: 10, padding: '3px' }}
                    >
                        <X className="text-red-500" size={20} />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="app-editable-number"
            onClick={handleOpen}
        >
            {value}
        </div>
    );
};

interface AppContentProps {
    isDialog: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dialogProps: any;
}

const AnalisisPuestoVsPersonaContent: React.FC<AppContentProps> = ({ isDialog, dialogProps }: AppContentProps) => {
    // get userId, userName, positionId from dialogProps or localStorage

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';

    let userIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    let userNameFromStorage = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
    let positionIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('positionId') : null;

    // get id from url
    const { dialogUserId, dialogUserName, dialogPositionId } = dialogProps || {};

    if (isPDF) {
        userIdFromStorage = searchParams.get('userId');
        userNameFromStorage = searchParams.get('userName');
        positionIdFromStorage = searchParams.get('positionId');
    }

    const { id } = useParams(); // Extract the dynamic route parameter [id]
    const ID = Array.isArray(id) ? id[0] : id || ''; // Handle the extracted parameter
    const USERID = isDialog ? dialogUserId : userIdFromStorage;
    const USERNAME = isDialog ? dialogUserName : userNameFromStorage;
    const POSITIONID = isDialog ? dialogPositionId : positionIdFromStorage;

    const [data, setData] = useState<ResponseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mgtDate, setMgtDate] = useState<string>('');

    // Pond values
    const [pondEstilo, setPondEstilo] = useState<number>(0);
    const [pondValores, setPondValores] = useState<number>(0);
    const [pondProcesoP, setPondProcesoP] = useState<number>(0);

    // PTS values
    const [styleCompatibilityScore, setStyleCompatibilityScore] = useState<number>(0);
    const [valuesCompatibilityScore, setValuesCompatibilityScore] = useState<number>(0);
    const [processPCompatibilityScore, setProcessPCompatibilityScore] = useState<number>(0);

    // Comments
    const [styleAdequateComment, setStyleAdequateComment] = useState<string>("");
    const [styleInadequateComment, setStyleInadequateComment] = useState<string>("");
    const [valuesAdequateComment, setValuesAdequateComment] = useState<string>("");
    const [valuesInadequateComment, setValuesInadequateComment] = useState<string>("");
    const [processPAdequateComment, setProcessPAdequateComment] = useState<string>("");
    const [processPInadequateComment, setProcessPInadequateComment] = useState<string>("");

    useEffect(() => {
        async function fetchData() {

            // Validación de parámetros requeridos
            if (!USERID || !USERNAME || !POSITIONID) {
                window.location.href = `/${ID}/organigrama`;
                return;
            }

            setLoading(true);
            try {
                // You can add query parameters if needed
                const queryParams = new URLSearchParams({
                    userId: Array.isArray(USERID) ? USERID[0] : USERID,
                    positionId: POSITIONID
                });

                const response = await fetch(`/api/APP?${queryParams.toString()}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const result = await response.json();
                setData(result);

                // set date
                setMgtDate(result.date)

                // Set initial scores from API
                const styleScore = result.scores.find((score: Score) => score.category === "CompatibilidadEstilo")?.score.toFixed(2) || 0;
                const valuesScore = result.scores.find((score: Score) => score.category === "CompatibilidadValores")?.score.toFixed(2) || 0;
                const processScore = result.scores.find((score: Score) => score.category === "CompatibilidadProcesoP")?.score.toFixed(2) || 0;

                setStyleCompatibilityScore(styleScore);
                setValuesCompatibilityScore(valuesScore);
                setProcessPCompatibilityScore(processScore);

                // Set initial Ponds from API
                const stylePond = result.scores.find((score: Score) => score.category === "CompatibilidadEstilo")?.pond || 0;
                const valuesPond = result.scores.find((score: Score) => score.category === "CompatibilidadValores")?.pond || 0;
                const processPond = result.scores.find((score: Score) => score.category === "CompatibilidadProcesoP")?.pond || 0;

                setPondEstilo(stylePond);
                setPondValores(valuesPond);
                setPondProcesoP(processPond);

                // Set initial comments from API
                const sAdequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoEstiloAdec")?.comment || "";
                const sInadequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoEstiloInadec")?.comment || "";
                const vAdequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoValoresAdec")?.comment || "";
                const vInadequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoValoresInadec")?.comment || "";
                const pAdequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoProcesoPAdec")?.comment || "";
                const pInadequate = result.comments.find((comment: CommentRes) => comment.category === "MGT Analysis TextoProcesoPInadec")?.comment || "";

                setStyleAdequateComment(sAdequate);
                setStyleInadequateComment(sInadequate);
                setValuesAdequateComment(vAdequate);
                setValuesInadequateComment(vInadequate);
                setProcessPAdequateComment(pAdequate);
                setProcessPInadequateComment(pInadequate);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error('Error fetching app data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [USERID, USERNAME, POSITIONID]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
                <div className="skeleton_container">
                    <APPSkeleton />
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

    const subtotal = ((
        (styleCompatibilityScore ?? 0) * pondEstilo +
        (valuesCompatibilityScore ?? 0) * pondValores +
        ((processPCompatibilityScore ?? 0) * pondProcesoP))
        / 2.25)
        .toFixed(2);


    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
            <div className="app-container">

                {/* top row */}
                <Box sx={{ display: "flex", justifyContent: "left", alignItems: 'center', alignContent: 'center', flexDirection: "row", marginBottom: "20px" }}>

                    {/* back button */}
                    {
                        (!isDialog && !isPDF) &&
                        <IconButton onClick={() => window.history.back()} sx={{ color: "#616161", fontSize: "16px", border: "1px solid #616161", padding: "5px 10px", borderRadius: "5px", marginRight: "10px", gap: "5px" }}>
                            <ArrowLeft size={16} />
                            <span>Atrás</span>
                        </IconButton>
                    }

                    {/* Position Title */}
                    <h2 className="app-position-title">{data?.positionName.toUpperCase()}</h2>
                </Box>

                <div className="app-table-container">
                    <table className="app-table">

                        {/* head */}
                        <thead>
                            <tr className="app-header-row">
                                <th className="app-header-cell">POND</th>
                                <th className="app-header-cell">FACTOR</th>
                                <th className="app-header-cell">ADECUACIONES</th>
                                <th className="app-header-cell">ÁREAS DE OPORTUNIDAD</th>
                                <th className="app-header-cell">PTS</th>
                                <th className="app-header-cell">CALIF</th>
                            </tr>
                        </thead>

                        <tbody>

                            {/* ESTILO Row */}
                            <tr className="app-data-row">

                                {/* pond */}
                                <td className="app-pond-cell">
                                    <EditableNumber
                                        value={pondEstilo}
                                        onSave={setPondEstilo}
                                        type={'pond'}
                                        category={'CompatibilidadEstilo'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* factor - graficas */}
                                <td className="app-factor-cell app-transparent-cell">
                                    {/* leyendas */}
                                    <div className="app-factor-header">
                                        <div className="app-factor-header-grid">
                                            <div className="app-factor-header-left">PUESTO</div>
                                            <div className="app-factor-header-right">PERSONA</div>
                                        </div>
                                        <div className="app-factor-title">ESTILO</div>
                                    </div>

                                    {/* graficas */}
                                    <div className="app-graphs-container">
                                        <div className="app-puesto-graph">
                                            {data?.images?.GraficaPuestoEstilo && (
                                                <div className="app-graph-item">
                                                    <Image
                                                        src={`data:image/png;base64,${data.images.GraficaPuestoEstilo}`}
                                                        alt="GraficaPuestoEstilo"
                                                        width={120}
                                                        height={120}
                                                        className="app-graph-image"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="app-persona-graphs">
                                            <div className="app-graphs-grid">
                                                {data?.images?.GraficaEstiloObs && (
                                                    <div className="app-graph-item">
                                                        <Image
                                                            src={`data:image/png;base64,${data.images.GraficaEstiloObs}`}
                                                            alt="GraficaEstiloObs"
                                                            width={120}
                                                            height={120}
                                                            className="app-graph-image"
                                                        />
                                                    </div>
                                                )}
                                                {data?.images?.GraficaEstiloProy && (
                                                    <div className="app-graph-item">
                                                        <Image
                                                            src={`data:image/png;base64,${data.images.GraficaEstiloProy}`}
                                                            alt="GraficaEstiloProy"
                                                            width={120}
                                                            height={120}
                                                            className="app-graph-image"
                                                        />
                                                    </div>
                                                )}
                                                {data?.images?.GraficaEstiloNat && (
                                                    <div className="app-graph-item">
                                                        <Image
                                                            src={`data:image/png;base64,${data.images.GraficaEstiloNat}`}
                                                            alt="GraficaEstiloNat"
                                                            width={120}
                                                            height={120}
                                                            className="app-graph-image"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Adecuaciones */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: styleAdequateComment }} />}
                                        onSave={(newContent) => setStyleAdequateComment(newContent)}
                                        category={'MGT Analysis TextoEstiloAdec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* areas de oportunidad */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: styleInadequateComment }} />}
                                        onSave={(newContent) => setStyleInadequateComment(newContent)}
                                        category={'MGT Analysis TextoEstiloInadec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* PTS */}
                                <td className="app-score-cell">
                                    <EditableNumber
                                        value={styleCompatibilityScore}
                                        onSave={setStyleCompatibilityScore}
                                        type={'score'}
                                        category={'CompatibilidadEstilo'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* CALIF */}
                                <td className="app-score-cell app-transparent-cell">
                                    {((styleCompatibilityScore ?? 0) * pondEstilo).toFixed(2)}
                                </td>
                            </tr>

                            {/* VALORES Row */}
                            <tr className="app-data-row">
                                {/* pond */}
                                <td className="app-pond-cell">
                                    <EditableNumber
                                        value={pondValores}
                                        onSave={setPondValores}
                                        type={'pond'}
                                        category={'CompatibilidadValores'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* factor - graficas */}
                                <td className="app-factor-cell app-transparent-cell">
                                    <div className="app-factor-header">
                                        <div className="app-factor-title">VALORES</div>
                                    </div>
                                    <div className="app-graphs-container">
                                        <div className="app-puesto-graph">
                                            {data?.images?.GraficaPuestoValores && (
                                                <div className="app-graph-item">
                                                    <Image
                                                        src={`data:image/png;base64,${data.images.GraficaPuestoValores}`}
                                                        alt="GraficaPuestoValores"
                                                        width={180}
                                                        height={180}
                                                        className="app-graph-image-large"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="app-persona-graphs">
                                            {data?.images?.GraficaValores && (
                                                <div className="app-graph-item">
                                                    <Image
                                                        src={`data:image/png;base64,${data.images.GraficaValores}`}
                                                        alt="GraficaValores"
                                                        width={180}
                                                        height={180}
                                                        className="app-graph-image-large"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Adecuaciones */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: valuesAdequateComment }} />}
                                        onSave={(newContent) => setValuesAdequateComment(newContent)}
                                        category={'MGT Analysis TextoValoresAdec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* areas de oportunidad */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: valuesInadequateComment }} />}
                                        onSave={(newContent) => setValuesInadequateComment(newContent)}
                                        category={'MGT Analysis TextoValoresInadec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* PTS */}
                                <td className="app-score-cell">
                                    <EditableNumber
                                        value={valuesCompatibilityScore}
                                        onSave={setValuesCompatibilityScore}
                                        type={'score'}
                                        category={'CompatibilidadValores'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* CALIF */}
                                <td className="app-score-cell app-transparent-cell">
                                    {((valuesCompatibilityScore ?? 0) * pondValores).toFixed(2)}
                                </td>

                            </tr>

                            {/* PROCESO PENSANTE Row */}
                            <tr className="app-data-row">

                                {/* pond */}
                                <td className="app-pond-cell">
                                    <EditableNumber
                                        value={pondProcesoP}
                                        onSave={setPondProcesoP}
                                        type={'pond'}
                                        category={'CompatibilidadProcesoP'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* factor - graficas */}
                                <td className="app-factor-cell app-transparent-cell">
                                    <div className="app-factor-header">
                                        <div className="app-factor-title">PROCESO PENSANTE</div>
                                    </div>
                                    <div className="app-graphs-container">
                                        <div className="app-puesto-graph">
                                            {data?.images?.GraficaPuestoGraficaProcesoP && (
                                                <div className="app-graph-item">
                                                    <Image
                                                        src={`data:image/png;base64,${data.images.GraficaPuestoGraficaProcesoP}`}
                                                        alt="GraficaPuestoGraficaProcesoP"
                                                        width={140}
                                                        height={140}
                                                        className="app-graph-image-medium"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="app-persona-graphs">
                                            {data?.images?.GraficaProcesoP && (
                                                <div className="app-graph-item">
                                                    <Image
                                                        src={`data:image/png;base64,${data.images.GraficaProcesoP}`}
                                                        alt="GraficaProcesoP"
                                                        width={140}
                                                        height={140}
                                                        className="app-graph-image-medium"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Adecuaciones */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: processPAdequateComment }} />}
                                        onSave={(newContent) => setProcessPAdequateComment(newContent)}
                                        category={'MGT Analysis TextoProcesoPAdec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* areas de oportunidad */}
                                <td className="app-comments-cell">
                                    <EditableComment
                                        content={<div dangerouslySetInnerHTML={{ __html: processPInadequateComment }} />}
                                        onSave={(newContent) => setProcessPInadequateComment(newContent)}
                                        category={'MGT Analysis TextoProcesoPInadec'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                        allComments={data?.comments ? data?.comments : []}
                                    />
                                </td>

                                {/* PTS */}
                                <td className="app-score-cell">
                                    <EditableNumber
                                        value={processPCompatibilityScore}
                                        onSave={setProcessPCompatibilityScore}
                                        type={'score'}
                                        category={'CompatibilidadProcesoP'}
                                        userId={USERID}
                                        userName={USERNAME}
                                        positionId={POSITIONID}
                                    />
                                </td>

                                {/* CALIF */}
                                <td className="app-score-cell app-transparent-cell">
                                    {((processPCompatibilityScore ?? 0) * pondProcesoP).toFixed(2)}
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    {/* Footer row with Wonderlic and Subtotal */}
                    <div className="app-footer-container">
                        <div className="app-wonderlic">
                            Wonderlic: {data?.wonderlic ? data.wonderlic : 'No disponible'}
                        </div>
                        <div className="app-subtotal-container">
                            <div className="app-subtotal-label">SUBTOTAL:</div>
                            <div className="app-subtotal-value">{subtotal}</div>
                        </div>
                    </div>
                </div>

                {/* Date */}
                <div className="app-date">
                    Fecha: {mgtDate}
                </div>
            </div>
        </Box>
    );
}

export default AnalisisPuestoVsPersonaContent;