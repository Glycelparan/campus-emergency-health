import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Stethoscope,
  Heart,
  Thermometer,
  Pill,
  Scissors,
  Skull,
} from "lucide-react";

interface EmergencyCategoryProps {
  categories?: EmergencyCategory[];
  onSelectCategory?: (category: EmergencyCategory) => void;
}

export interface EmergencyCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const defaultCategories: EmergencyCategory[] = [
  {
    id: "bleeding",
    name: "Bleeding",
    icon: <Scissors size={48} />,
    color: "bg-red-500",
    description: "Control severe bleeding and prevent shock",
  },
  {
    id: "choking",
    name: "Choking",
    icon: <Stethoscope size={48} />,
    color: "bg-blue-500",
    description: "Clear airway obstruction and restore breathing",
  },
  {
    id: "cardiac",
    name: "Cardiac",
    icon: <Heart size={48} />,
    color: "bg-purple-500",
    description: "CPR and emergency cardiac care procedures",
  },
  {
    id: "burns",
    name: "Burns",
    icon: <Thermometer size={48} />,
    color: "bg-orange-500",
    description: "Treat thermal, chemical, and electrical burns",
  },
  {
    id: "poisoning",
    name: "Poisoning",
    icon: <Pill size={48} />,
    color: "bg-green-500",
    description: "Handle ingestion of harmful substances",
  },
  {
    id: "fractures",
    name: "Fractures",
    icon: <Skull size={48} />,
    color: "bg-yellow-500",
    description: "Immobilize and care for broken bones",
  },
  {
    id: "other",
    name: "Other",
    icon: <AlertCircle size={48} />,
    color: "bg-gray-500",
    description: "Additional emergency procedures",
  },
];

const EmergencyCategoryGrid: React.FC<EmergencyCategoryProps> = ({
  categories = defaultCategories,
  onSelectCategory = () => {},
}) => {
  return (
    <div className="w-full bg-white p-4 md:p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select Emergency Type
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer"
            onClick={() => onSelectCategory(category)}
          >
            <Card className="h-full border-2 hover:border-primary transition-colors duration-200">
              <CardContent className="p-0">
                <div
                  className={`${category.color} text-white p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]`}
                >
                  <div className="mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyCategoryGrid;
