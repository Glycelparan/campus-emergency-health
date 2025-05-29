import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Share2, Info, ChevronLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ContactInfo {
  name: string;
  role: string;
  number: string;
  priority: "high" | "medium" | "low";
}

interface EmergencyContactsProps {
  contacts?: ContactInfo[];
  campusName?: string;
  campusAddress?: string;
  onShareLocation?: () => void;
  onBack?: () => void;
}

const EmergencyContacts = ({
  contacts = [
    {
      name: "Campus Security",
      role: "Security",
      number: "555-123-4567",
      priority: "high" as const,
    },
    {
      name: "Health Center",
      role: "Medical",
      number: "555-123-4568",
      priority: "high" as const,
    },
    {
      name: "Poison Control",
      role: "Medical",
      number: "800-222-1222",
      priority: "medium" as const,
    },
    {
      name: "Campus Nurse",
      role: "Medical",
      number: "555-123-4569",
      priority: "medium" as const,
    },
  ],
  campusName = "Main Campus",
  campusAddress = "123 University Ave, College Town, ST 12345",
  onShareLocation = () => console.log("Sharing location..."),
  onBack = () => {},
}: EmergencyContactsProps) => {
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const handleShareLocation = () => {
    onShareLocation();
    setLocationShared(true);
    setTimeout(() => setLocationDialogOpen(false), 2000);
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back
        </Button>
      </div>
      <Card className="shadow-lg border-2 border-red-100">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-2xl font-bold text-red-700 flex items-center">
            <Phone className="mr-2" /> Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold flex items-center mb-2">
              <MapPin className="mr-2 text-blue-600" /> Campus Location
            </h3>
            <p className="font-medium">{campusName}</p>
            <p className="text-sm text-gray-600">{campusAddress}</p>
            <Button
              variant="outline"
              className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => setLocationDialogOpen(true)}
            >
              <Share2 className="mr-2 h-4 w-4" /> Share Exact Location
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">One-Tap Emergency Calling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${contact.priority === "high" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {contact.name}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.role}</p>
                      <p className="font-medium mt-1">{contact.number}</p>
                    </div>
                    <Badge
                      variant={
                        contact.priority === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className="ml-2"
                    >
                      {contact.priority === "high" ? "Priority" : "Secondary"}
                    </Badge>
                  </div>
                  <Button
                    className={`w-full mt-3 ${contact.priority === "high" ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600"}`}
                    onClick={() => handleCall(contact.number)}
                  >
                    <Phone className="mr-2 h-4 w-4" /> Call Now
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-start">
              <Info className="text-gray-500 mr-2 mt-1" />
              <div>
                <h4 className="font-medium">Important Note</h4>
                <p className="text-sm text-gray-600">
                  For life-threatening emergencies, always call 911 first before
                  contacting campus services.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Exact Location</DialogTitle>
            <DialogDescription>
              This will help emergency responders find you quickly on campus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {locationShared ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-md">
                <p className="font-medium">Location shared successfully!</p>
                <p className="text-sm">
                  Emergency responders can now locate you.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded-md">
                  <p>Sharing your location will:</p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    <li>
                      Send your GPS coordinates to campus emergency services
                    </li>
                    <li>Help responders navigate to your exact position</li>
                    <li>Improve response time in emergency situations</li>
                  </ul>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setLocationDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleShareLocation}>
                    Share My Location
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <div className="fixed bottom-4 right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full h-12 w-12 bg-red-600 text-white hover:bg-red-700 border-2 border-white shadow-lg"
              >
                <Phone className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Emergency Contacts</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default EmergencyContacts;
