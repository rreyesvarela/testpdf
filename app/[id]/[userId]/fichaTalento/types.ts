import { CommentRes } from "../app/EditableComment";

export interface Address {
    country: string;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string;
    zipCode: string | null;
}

export interface WorkerStatus {
    lastHireDate: string;
    originalHireDate: string;
    active: boolean;
    absent: boolean;
}

export interface Settings {
    displayLanguage: string;
    timeZone: string;
    trainingApprovals: number;
}

export interface Manager {
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
}

export interface Relation {
    relationType: string;
    id: number;
    userId: string;
    firstName: string;
    lastName: string;
}

export interface OrganizationalUnit {
    id: number;
    ouId: string;
    name: string;
    type: string;
}

export interface CustomField {
    id: number;
    name: string;
    value: string | number;
}

export interface EmployeeMetaData {
    createdDate: string;
    modifiedDate: string;
}

export interface Experience {
    idEmployee: string;
    separationReason: string;
    IdExpInterna: string;
    achievements: string;
    deleted: string;
    functions: string;
    endDate: string;
    company: string;
    location: string;
    position: string;
    type: string;
    startDate: string;
}

export interface Experiences {
    interna: Experience[];
    externa: Experience[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    other: any[];
}

export interface ExternalUserData {
    id: number;
    userId: string;
    userName: string;
    guid: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    prefix: string;
    suffix: string | null;
    primaryEmail: string;
    personalEmail: string | null;
    homePhone: string | null;
    mobilePhone: string;
    workPhone: string;
    fax: string | null;
    address: Address;
    workerStatus: WorkerStatus;
    settings: Settings;
    manager: Manager;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    approver: any | null;
    relations: Relation[];
    ous: OrganizationalUnit[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selfRegistrationGroup: any | null;
    customOus: OrganizationalUnit[];
    customFields: CustomField[];
    employeeMetaData: EmployeeMetaData;
}


export interface Language {
    idEmployee: string;
    score: string;
    IdExpInterna: string;
    deleted: string;
    examDate: string;
    level: string;
    details: string;
    language: string;
}

export interface Study {
    area: string;
    idEmployee: string;
    institution: string;
    IdExpInterna: string;
    deleted: boolean | string;
    endDate: string;
    level: string;
    details: string;
    startDate: string;
    status: string;
}

export interface TalendCard {
    userId: number;
    userName: string;
    studies: Study[];
    languages: Language[];
    experiences: Experiences;
    externalUserData: ExternalUserData;
}

// Interfaces para datos de Hogan
export interface PersonalityTrait {
    name: string;
    value: number;
}

export interface PersonalityInventory {
    traits: PersonalityTrait[];
    date: string;
}

export interface DevelopmentTrait {
    name: string;
    value: number;
}

export interface DevelopmentInventory {
    traits: DevelopmentTrait[];
    date: string;
}

export interface ValuesTrait {
    name: string;
    value: number;
}

export interface ValuesInventory {
    traits: ValuesTrait[];
    date: string;
}

export interface StyleProfile {
    observed: {
        D: number;
        I: number;
        S: number;
        C: number;
    };
    projected: {
        D: number;
        I: number;
        S: number;
        C: number;
    };
    natural: {
        D: number;
        I: number;
        S: number;
        C: number;
    };
}

interface ScoreItem {
    category: string;
    score: string;
}

// Interfaces para los diferentes grupos de puntajes
interface Scores {
    HPI: ScoreItem[];
    HDS: ScoreItem[];
    MVPI: ScoreItem[];
}

// Interfaz para los comentarios


// Interfaz principal que engloba toda la estructura
export interface HoganAssessment {
    scores: Scores;
    comments: CommentRes[];
    assessmentDate: string;
}

export interface ValuesProfile {
    categories: string[];
    values: number[];
}

export interface ThinkingProcess {
    person: {
        x: number;
        y: number;
    };
    position: {
        x: number;
        y: number;
    };
}

export interface PerformanceScores {
    [year: string]: number;
}

export interface EQIRanges {
    opportunityArea: {
        min: number;
        max: number;
    };
    normalDeveloped: {
        min: number;
        max: number;
    };
    balancedAbility: {
        min: number;
        max: number;
    };
    highlyDeveloped: {
        min: number;
        max: number;
    };
    currentValue: number;
}

export interface HoganData {
    personalityInventory: PersonalityInventory;
    developmentInventory: DevelopmentInventory;
    valuesInventory: ValuesInventory;
    styleProfile: StyleProfile;
    valuesProfile: ValuesProfile;
    thinkingProcess: ThinkingProcess;
    performanceScores: PerformanceScores;
    wonderlic: string;
    nineBox: string;
    eqi: EQIRanges;
}

// Interfaces para la respuesta de Hogan API
export interface HoganScore {
    category: string;
    score: string;
}

export interface HoganComment {
    category: string;
    originalComment: string;
    comment: string;
    originalCommentDate: string;
}

// Interfaces para los comentarios del perfil

export interface MGTData {
    UserIDs: string;
    PositionIds: string;
    NombresCompletos: string;
    FechaPerfilPuesto: string;
    MarcadoresEvaluados: string;
    comments: CommentRes[];
    fechaEval: string;
    GraficaEstiloNat: string
    GraficaEstiloObs: string
    GraficaEstiloProy: string
    GraficaProcesoP: string
    GraficaValores: string
    MarcadoresPuestos: string
}

export interface Score {
    score: number;
    taskId: string;
    taskName: string;
    year: string;
}

export interface TalentCardDetail {
    Eqi: string;
    Wonderlic: string;
    birthday: string;
    nineBox: string;
    puestoId: string;
    userId: string;
    scores: Score[]
}

export const cuadrante = {
    "3ES": 1,
    "3GF": 2,
    "3GN": 3,
    "2ES": 4,
    "2GF": 5,
    "2GN": 6,
    "1ES": 7,
    "1GF": 8,
    "1GN": 9
}