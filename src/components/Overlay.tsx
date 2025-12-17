"use client";
import { Scroll } from "@react-three/drei";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import HowItWorks from "./sections/HowItWorks";
import RiskEngine from "./sections/RiskEngine";
import TrustLayer from "./sections/TrustLayer";
import Vision from "./sections/Vision";

export default function Overlay() {
  return (
    <Scroll html style={{ width: "100%" }}>
        <Hero />
        <Problem />
        <HowItWorks />
        <RiskEngine />
        <TrustLayer />
        <Vision />
    </Scroll>
  );
}