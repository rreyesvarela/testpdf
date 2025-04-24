"use client";

import React from "react";
import AnalisisPuestoVsPersonaContent from "./AnalisisPuestoVsPersonaContent"; // Assuming you move the content to a separate component

export default function AnalisisPuestoVsPersonaPage() {

    return (
        <AnalisisPuestoVsPersonaContent
            isDialog={false}
            dialogProps={{}}
        />
    );
}