"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { Label } from "@/components/ui/label";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

interface Polishing {
  Id: string;
  Name: string;
  Issued_Date__c: string;
  Issued_Weight__c: number;
  Received_Weight__c: number;
  Received_Date__c: string;
  Status__c: string;
  Polishing_Loss__c: number;
}

interface Pouch {
  Id: string;
  Name: string;
  Issued_Weight_Polishing__c: number;
  Received_Weight_Polishing__c: number;
}

interface PolishingData {
  polishing: Polishing;
  pouches: Pouch[];
}

// Form validation schema
const updateFormSchema = z.object({
  receivedDate: z.string().min(1, "Received date is required"),
  receivedWeight: z.number().min(0, "Weight must be non-negative"),
  ornamentWeight: z.number().min(0, "Ornament weight must be non-negative"),
  scrapReceivedWeight: z.number().min(0, "Weight cannot be negative"),
  dustReceivedWeight: z.number().min(0, "Weight cannot be negative"),
  polishingLoss: z.number(),
  pouches: z.array(z.object({
    pouchId: z.string(),
    receivedWeight: z.number().min(0),
    polishingLoss: z.number()
  }))
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

export default function PolishingReceivedDetails() {
  const searchParams = useSearchParams();
  const polishingId = searchParams.get('polishingId');
  const [loading, setLoading] = useState(true);
  const [polishing, setPolishing] = useState<Polishing | null>(null);
  const [pouches, setPouches] = useState<Pouch[]>([]);
  const [pouchReceivedWeights, setPouchReceivedWeights] = useState<{ [key: string]: number }>({});
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedTime, setReceivedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  });
  const [ornamentWeight, setOrnamentWeight] = useState<number>(0);
  const [scrapReceivedWeight, setScrapReceivedWeight] = useState<number>(0);
  const [dustReceivedWeight, setDustReceivedWeight] = useState<number>(0);
  const [totalReceivedWeight, setTotalReceivedWeight] = useState<number>(0);
  const [polishingLoss, setPolishingLoss] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<UpdateFormData>>({});

  useEffect(() => {
    const fetchPolishingDetails = async () => {
      if (!polishingId) {
        console.log('[Polishing Details] No polishing ID provided');
        toast.error('No polishing ID provided');
        setLoading(false);
        return;
      }

      try {
        const [prefix, date, month, year, number, subnumber] = polishingId.split('/');
        
        console.log('[Polishing Details] Fetching details for:', {
          prefix, date, month, year, number,
          url: `${process.env.NEXT_PUBLIC_API_URL}/api/polishing/${prefix}/${date}/${month}/${year}/${number}/pouches`
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/polishing/${prefix}/${date}/${month}/${year}/${number}/${subnumber}/pouches`
        );

        const result = await response.json();
        console.log('[Polishing Details] API Response:', result);

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch polishing details');
        }

        if (!result.data?.polishing) {
          console.error('[Polishing Details] No polishing data in response');
          throw new Error('No polishing data found');
        }

        console.log('[Polishing Details] Setting state with:', {
          polishing: result.data.polishing,
          pouches: result.data.pouches
        });

        setPolishing(result.data.polishing);
        setPouches(result.data.pouches);

        // Initialize received weights
        const initialWeights: { [key: string]: number } = {};
        result.data.pouches.forEach((pouch: Pouch) => {
          initialWeights[pouch.Id] = pouch.Received_Weight_Polishing__c || 0;
        });
        setPouchReceivedWeights(initialWeights);

        // Calculate initial total
        const total = Object.values(initialWeights).reduce((sum, weight) => sum + (weight || 0), 0);
        setTotalReceivedWeight(total);

        // Calculate loss
        if (result.data.polishing?.Issued_Weight__c) {
          setPolishingLoss(result.data.polishing.Issued_Weight__c - total);
        }

      } catch (error) {
        console.error('[Polishing Details] Error:', error);
        toast.error(error.message || 'Failed to fetch polishing details');
      } finally {
        console.log('[Polishing Details] Setting loading to false');
        setLoading(false);
      }
    };

    console.log('[Polishing Details] Component mounted with polishingId:', polishingId);
    fetchPolishingDetails();
  }, [polishingId]);

  useEffect(() => {
    // Calculate total pouch weight
    const totalPouchWeight = Object.values(pouchReceivedWeights).reduce((sum, w) => sum + (w || 0), 0);
    setOrnamentWeight(totalPouchWeight);
    
    // Calculate total received weight
    const totalWeight = totalPouchWeight + scrapReceivedWeight + dustReceivedWeight;
    setTotalReceivedWeight(totalWeight);
    
    if (polishing) {
      const issuedWeight = polishing.Issued_Weight__c;
      const loss = issuedWeight - totalWeight;
      setPolishingLoss(loss);
    }
  }, [pouchReceivedWeights, scrapReceivedWeight, dustReceivedWeight, polishing]);

  const handleWeightChange = (pouchId: string, weight: number) => {
    setPouchReceivedWeights(prev => {
      const newWeights = { ...prev, [pouchId]: weight };
      const totalPouchWeight = Object.values(newWeights).reduce((sum, w) => sum + (w || 0), 0);
      
      // Set ornament weight as total pouch weight
      setOrnamentWeight(totalPouchWeight);
      
      // Calculate total received weight
      const newTotalReceived = totalPouchWeight + scrapReceivedWeight + dustReceivedWeight;
      setTotalReceivedWeight(newTotalReceived);
      
      // Calculate polishing loss
      setPolishingLoss(polishing?.Issued_Weight__c ? polishing.Issued_Weight__c - newTotalReceived : 0);
      
      return newWeights;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const [prefix, date, month, year, number, subnumber] = polishingId!.split('/');

      // Combine date and time for received datetime
      const combinedDateTime = `${receivedDate}T${receivedTime}:00.000Z`;
      console.log('[PolishingReceived] Combined datetime:', combinedDateTime);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/polishing/update/${prefix}/${date}/${month}/${year}/${number}/${subnumber}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receivedDate: combinedDateTime,
            receivedWeight: parseFloat(totalReceivedWeight.toFixed(4)),
            ornamentWeight: parseFloat(ornamentWeight.toFixed(4)),
            scrapReceivedWeight: parseFloat(scrapReceivedWeight.toFixed(4)),
            dustReceivedWeight: parseFloat(dustReceivedWeight.toFixed(4)),
            polishingLoss: parseFloat(polishingLoss.toFixed(4)),
            pouches: Object.entries(pouchReceivedWeights).map(([pouchId, weight]) => ({
              pouchId,
              receivedWeight: parseFloat(weight.toFixed(4))
            }))
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Polishing details updated successfully');
        // Add a short delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          window.location.href = '/Departments/Polishing/Polishing_Table';
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update polishing details');
      }
    } catch (error) {
      console.error('[Polishing Update] Error:', error);
      toast.error(error.message || 'Failed to update polishing details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    console.log('[Polishing Details] Rendering loading state');
    return <div className="p-6">Loading polishing details...</div>;
  }

  if (!polishing) {
    console.log('[Polishing Details] Rendering error state - no polishing data');
    return <div className="p-6">Failed to load polishing details. Please try again.</div>;
  }

  console.log('[Polishing Details] Rendering main component with:', {
    polishing,
    pouches,
    totalReceivedWeight,
    polishingLoss
  });

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Polishing Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Polishing Number</Label>
              <div className="mt-1">{polishing.Name}</div>
            </div>
            <div>
              <Label>Issued Date</Label>
              <div className="mt-1">
                {new Date(polishing.Issued_Date__c).toLocaleDateString()}
              </div>
            </div>
            <div>
              <Label>Issued Weight</Label>
              <div className="mt-1">{polishing.Issued_Weight__c}g</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">{polishing.Status__c}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Received Date</Label>
                  <Input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Received Time</Label>
                  <Input
                    type="time"
                    value={receivedTime}
                    onChange={(e) => setReceivedTime(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pouch Details</h3>
                {pouches.map((pouch) => (
                  <div key={pouch.Id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Pouch Number</Label>
                        <div className="mt-1">{pouch.Name}</div>
                      </div>
                      <div>
                        <Label>Issued Weight</Label>
                        <div className="mt-1">{pouch.Issued_Weight_Polishing__c}g</div>
                      </div>
                      <div>
                        <Label>Received Weight</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={pouchReceivedWeights[pouch.Id] || ''}
                          onChange={(e) => handleWeightChange(pouch.Id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ornament Weight (g)</Label>
                  <Input
                    type="number"
                    value={ornamentWeight.toFixed(4)}
                    className="w-full h-9 bg-gray-50"
                    disabled={true}
                  />
                </div>

                <div>
                  <Label>Scrap Weight (g)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={scrapReceivedWeight || ''}
                    onChange={(e) => setScrapReceivedWeight(parseFloat(e.target.value) || 0)}
                    className={`w-full h-9 ${formErrors.scrapReceivedWeight ? 'border-red-500' : ''}`}
                    placeholder="Enter scrap weight (can be 0)"
                    disabled={isSubmitting}
                  />
                  {formErrors.scrapReceivedWeight && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.scrapReceivedWeight}</p>
                  )}
                </div>

                <div>
                  <Label>Dust Weight (g)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={dustReceivedWeight || ''}
                    onChange={(e) => setDustReceivedWeight(parseFloat(e.target.value) || 0)}
                    className={`w-full h-9 ${formErrors.dustReceivedWeight ? 'border-red-500' : ''}`}
                    placeholder="Enter dust weight (can be 0)"
                    disabled={isSubmitting}
                  />
                  {formErrors.dustReceivedWeight && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.dustReceivedWeight}</p>
                  )}
                </div>

                <div>
                  <Label>Total Received Weight (g)</Label>
                  <Input
                    type="number"
                    value={totalReceivedWeight.toFixed(4)}
                    className="w-full h-9 bg-gray-50"
                    disabled={true}
                  />
                </div>

                <div>
                  <Label>Polishing Loss (g)</Label>
                  <Input
                    type="number"
                    value={polishingLoss.toFixed(4)}
                    className="w-full h-9 bg-gray-50"
                    disabled={true}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !receivedDate}
                className="w-full"
              >
                {isSubmitting ? 'Updating...' : 'Update Polishing Details'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
