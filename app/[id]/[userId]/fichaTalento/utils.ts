import { Score } from "./types"

export const getHabilidad = (value: number) => {
    if (value <= 41) {
        return ""
    } else if (value > 41 && value <= 61) {
        return ""
    } else if (value > 61 && value <= 81) {
        return "(Habilidad en equilibrio)"
    } else {
        return "(Habilidad mas desarrolladas)"
    }
}

export const getWonderlicStatus = (value: number) => {
    if (value <= 14) {
        return "(Deficiente)"
    } else if (value > 14 && value <= 19) {
        return "(Bajo)"
    } else if (value > 19 && value <= 24) {
        return "(Regular)"
    } else if (value === 25) {
        return "(Promedio)"
    } else if (value > 25 && value <= 30) {
        return "(Promedio Alto)"
    } else if (value > 30 && value <= 40) {
        return "(Superior)"
    } else {
        return "(Excelente)"
    }
}

export const getDes = (score: Score[]) => {
    let des = ""
    score.forEach((item, index) => {

        des += ` ${item.year}: ${item.score} ${score.length === index + 1 ? "" : "|"}`

    })
    return des
}