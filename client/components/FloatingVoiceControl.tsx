import React from "react";
import VoiceControl from "@/components/VoiceControl";

interface FloatingVoiceControlProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  onListeningChange?: (isListening: boolean, transcript?: string) => void;
  forceStop?: boolean;
  onModelRotateStart?: () => void;
  onModelRotateStop?: () => void;
}

export default function FloatingVoiceControl({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  onListeningChange,
  forceStop = false,
  onModelRotateStart,
  onModelRotateStop,
}: FloatingVoiceControlProps) {
  return (
    <VoiceControl
      onAddBasicPlan={onAddBasicPlan}
      onAddProPlan={onAddProPlan}
      onAddMaxPlan={onAddMaxPlan}
      inNavbar={false}
      onListeningChange={onListeningChange}
      forceStop={forceStop}
      onModelRotateStart={onModelRotateStart}
      onModelRotateStop={onModelRotateStop}
    />
  );
}
