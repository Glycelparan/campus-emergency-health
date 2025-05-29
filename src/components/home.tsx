import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmergencyCategoryGrid from "./EmergencyCategoryGrid";
import { default as EmergencyProcedure } from "./EmergencyProcedure";
import EmergencyContacts from "./EmergencyContacts";

import { EmergencyCategory } from "./EmergencyCategoryGrid";

interface EmergencyStep {
  id: number;
  title: string;
  instructions: string;
  imageUrl?: string;
  animation?: React.ReactNode;
}

const Home = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState<boolean>(false);

  // Using default categories from EmergencyCategoryGrid component

  // Mock emergency procedures
  const emergencyProcedures: Record<string, EmergencyStep[]> = {
    bleeding: [
      {
        id: 1,
        title: "Apply Pressure",
        instructions:
          "Apply direct pressure to the wound using a clean cloth or bandage.",
        imageUrl:
          "https://images.unsplash.com/photo-1612776572997-76cc42e058c3?w=600&q=80",
      },
      {
        id: 2,
        title: "Elevate the Area",
        instructions:
          "If possible, elevate the injured area above the level of the heart.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 3,
        title: "Apply Bandage",
        instructions:
          "Once bleeding slows, apply a clean bandage firmly over the wound.",
        imageUrl:
          "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=600&q=80",
      },
    ],
    choking: [
      {
        id: 1,
        title: "Identify Choking",
        instructions:
          "Determine if the person can speak, cough, or breathe. If not, proceed with the next steps.",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
      },
      {
        id: 2,
        title: "Perform Abdominal Thrusts",
        instructions:
          "Stand behind the person and wrap your arms around their waist. Make a fist with one hand and place it above the navel. Grasp your fist with your other hand and pull inward and upward with quick thrusts.",
        imageUrl:
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
      },
      {
        id: 3,
        title: "Continue Until Object is Expelled",
        instructions:
          "Continue abdominal thrusts until the object is expelled or the person becomes unconscious.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
    ],
    cardiac: [
      {
        id: 1,
        title: "Check Responsiveness",
        instructions:
          'Tap the person and shout "Are you OK?" to check if they are responsive.',
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 2,
        title: "Call for Help",
        instructions: "Ask someone to call emergency services immediately.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 3,
        title: "Begin CPR",
        instructions:
          "Place hands in the center of the chest and perform compressions at a rate of 100-120 per minute.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 4,
        title: "Use AED if Available",
        instructions:
          "If an Automated External Defibrillator (AED) is available, follow its instructions.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
    ],
    burns: [
      {
        id: 1,
        title: "Cool the Burn",
        instructions:
          "Hold the burned area under cool (not cold) running water for 10 to 15 minutes.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 2,
        title: "Cover with Clean Cloth",
        instructions:
          "Cover the burn with a sterile, non-adhesive bandage or clean cloth.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
    ],
    fractures: [
      {
        id: 1,
        title: "Immobilize the Area",
        instructions:
          "Keep the injured area still and support it in the position you find it.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 2,
        title: "Apply Ice",
        instructions:
          "Apply ice wrapped in a cloth to reduce swelling and pain.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
    ],
    poisoning: [
      {
        id: 1,
        title: "Identify Substance",
        instructions:
          "Try to identify what was ingested or inhaled. Keep any containers or packaging.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
      {
        id: 2,
        title: "Call Poison Control",
        instructions:
          "Contact poison control immediately at 800-222-1222 for guidance.",
        imageUrl:
          "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
      },
    ],
    other: [
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
    ],
  };

  // Using default contacts from EmergencyContacts component

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, []);

  const handleCategorySelect = (category: EmergencyCategory) => {
    setSelectedCategory(category.id);
    setShowContacts(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowContacts(false);
  };

  const handleShowContacts = () => {
    setShowContacts(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Emergency Health Assistant
          </h1>
          <div className="flex items-center">
            {isOnline ? (
              <div className="flex items-center text-green-300">
                <Wifi className="h-5 w-5 mr-1" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-300">
                <WifiOff className="h-5 w-5 mr-1" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!isOnline && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertDescription>
              You are currently offline. Emergency procedures are still
              available, but location sharing and calling features may be
              limited.
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            {!selectedCategory && !showContacts && (
              <>
                <EmergencyCategoryGrid
                  onSelectCategory={handleCategorySelect}
                />
                <div className="mt-8 text-center">
                  <button
                    onClick={handleShowContacts}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Emergency Contacts
                  </button>
                </div>
              </>
            )}

            {selectedCategory &&
              !showContacts &&
              emergencyProcedures[selectedCategory] && (
                <EmergencyProcedure
                  steps={emergencyProcedures[selectedCategory]}
                  category={selectedCategory}
                  onBack={handleBackToCategories}
                  onContactHelp={handleShowContacts}
                />
              )}

            {showContacts && (
              <EmergencyContacts
                onShareLocation={() => console.log("Sharing location...")}
                onBack={handleBackToCategories}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-100 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>Emergency Health Assistant for Campus Use</p>
          <p className="mt-1">
            Always call professional emergency services for serious medical
            situations
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
