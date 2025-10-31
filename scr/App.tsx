
import React, { Suspense, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import LandingScreen from "./components/LandingScreen";

// lazy-load the analyser screen (your working one)
const FoodSafetyAnalyser = React.lazy(
  () => import("./components/FoodSafetyAnalyser")
);

import React from "react";
import HomeScreen from "./components/HomeScreen";

export default function App() {
  console.log("[App] mounted ✅");
  return <HomeScreen />;
}