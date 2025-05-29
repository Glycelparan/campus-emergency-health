import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Share2,
  AlertCircle,
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  instructions: string;
  imageUrl?: string;
  animation?: React.ReactNode;
}

interface EmergencyProcedureProps {
  category?: string;
  steps?: Step[];
  onBack?: () => void;
  onContactHelp?: () => void;
}

const defaultSteps: Step[] = [
  {
    id: 1,
    title: "Assess the Situation",
    instructions:
      "Check if the person is responsive. Tap their shoulder and ask loudly if they are okay.",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
  },
  {
    id: 2,
    title: "Call for Help",
    instructions:
      "If the person is unresponsive, call emergency services immediately or ask someone nearby to call while you stay with the person.",
    imageUrl:
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=600&q=80",
  },
  {
    id: 3,
    title: "Begin First Aid",
    instructions:
      "Follow the specific first aid instructions for this emergency situation. Stay calm and focused.",
    imageUrl:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&q=80",
  },
  {
    id: 4,
    title: "Monitor the Person",
    instructions:
      "Continue to monitor the person's condition until professional help arrives. Note any changes to report to emergency responders.",
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
  },
];

const EmergencyProcedure = ({
  category = "Medical Emergency",
  steps = defaultSteps,
  onBack = () => {},
  onContactHelp = () => {},
}: EmergencyProcedureProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back to Categories
        </Button>
        <div className="text-lg font-bold text-red-600">{category}</div>
      </div>

      <Progress value={progress} className="h-2 mb-6" />

      <div className="text-sm text-gray-500 mb-2">
        Step {currentStep + 1} of {totalSteps}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl font-bold text-center text-gray-800">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-lg leading-relaxed mb-4">
                  {steps[currentStep].instructions}
                </p>
                {steps[currentStep].animation && (
                  <div className="mt-4">{steps[currentStep].animation}</div>
                )}
              </div>
              {steps[currentStep].imageUrl && (
                <div className="flex justify-center items-center">
                  <img
                    src={steps[currentStep].imageUrl}
                    alt={`Step ${currentStep + 1}: ${steps[currentStep].title}`}
                    className="rounded-lg max-h-64 object-cover shadow-md"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 bg-gray-50 p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <Button
                onClick={goToNextStep}
                disabled={currentStep === totalSteps - 1}
                className="flex items-center gap-1"
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={onContactHelp}
                className="flex items-center gap-2"
              >
                <Phone size={16} /> Emergency Contact
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  navigator.share?.({
                    title: "Emergency Location",
                    text: "I need help at this location",
                  })
                }
              >
                <Share2 size={16} /> Share Location
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="text-yellow-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-800">Important Note</h3>
          <p className="text-yellow-700">
            This guide is not a substitute for professional medical training.
            Always call emergency services for serious medical situations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProcedure;
