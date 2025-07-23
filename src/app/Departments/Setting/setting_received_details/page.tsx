"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { Label } from "@/components/ui/label";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

interface Setting {
  Id: string;
  Name: string;
  Issued_Date__c: string;
  Issued_Weight__c: number;
  Returned_Weight__c: number;
  Received_Date__c: string;
  Status__c: string;
  Setting_l__c: number;
}

interface Pouch {
  Id: string;
  Name: string;
  Issued_weight_setting__c: number;
  Received_Weight_Setting__c?: number;
}

interface SettingData {
  setting: Setting;
  pouches: Pouch[];
}

// Form validation schema
const updateFormSchema = z.object({
  receivedDate: z.string().min(1, "Received date is required"),
  receivedWeight: z.number().min(0, "Weight must be non-negative"),
  ornamentWeight: z.number().min(0, "Ornament weight must be non-negative"),
  scrapReceivedWeight: z.number().min(0, "Weight cannot be negative"),
  dustReceivedWeight: z.number().min(0, "Weight cannot be negative"),
  settingLoss: z.number()
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

const SettingDetailsPage = () => {
  const [data, setData] = useState<SettingData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Get settingId from URL and parse it
  const settingId = searchParams.get('settingId'); // Example: "SETTING/15/03/2024/01"

  const [receivedDate, setReceivedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receivedWeight, setReceivedWeight] = useState<number>(0);
  const [settingLoss, setSettingLoss] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<UpdateFormData>>({});
  const [pouchReceivedWeights, setPouchReceivedWeights] = useState<{ [key: string]: number }>({});
  const [totalReceivedWeight, setTotalReceivedWeight] = useState<number>(0);
  const [manualStoneWeight, setManualStoneWeight] = useState<number>(0);
  const [pouchStoneWeights, setPouchStoneWeights] = useState<{ [key: string]: number }>({});
  const [totalStoneWeight, setTotalStoneWeight] = useState<number>(0);
  const [stoneWeightAdded, setStoneWeightAdded] = useState<number>(0);
  const [ornamentWeight, setOrnamentWeight] = useState<number>(0);
  const [scrapReceivedWeight, setScrapReceivedWeight] = useState<number>(0);
  const [dustReceivedWeight, setDustReceivedWeight] = useState<number>(0);
  const [receivedTime, setReceivedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  });

  // Update the form validation schema
  const updateFormSchema = z.object({
    receivedDate: z.string().min(1, "Received date is required"),
    receivedWeight: z.number().min(0, "Weight must be non-negative"),
    ornamentWeight: z.number().min(0, "Ornament weight must be non-negative"),
    scrapReceivedWeight: z.number().min(0, "Weight cannot be negative"),
    dustReceivedWeight: z.number().min(0, "Weight cannot be negative"),
    settingLoss: z.number()
  });

  // Update pouch weight handler
  const handlePouchWeightChange = (pouchId: string, weight: number) => {
    setPouchReceivedWeights(prev => {
      const newWeights = { ...prev, [pouchId]: weight };
      // Calculate total pouch weights
      const totalPouchWeight = Object.values(newWeights).reduce((sum, w) => sum + (w || 0), 0);
      // Calculate total stone weights
      const totalStoneWeight = Object.values(pouchStoneWeights).reduce((sum, w) => sum + (w || 0), 0);
      
      // Set ornament weight as pouch weights + stone weights
      setOrnamentWeight(totalPouchWeight + totalStoneWeight);
      
      // Calculate total received weight including scrap and dust
      const newTotalReceived = totalPouchWeight + totalStoneWeight + scrapReceivedWeight + dustReceivedWeight;
      setTotalReceivedWeight(newTotalReceived);
      setReceivedWeight(newTotalReceived);
      
      // Calculate setting loss
      setSettingLoss(data?.setting.Issued_Weight__c ? data.setting.Issued_Weight__c - newTotalReceived : 0);
      
      return newWeights;
    });
  };

  // Update stone weight handler
  const handlePouchStoneWeightChange = (pouchId: string, weight: number) => {
    setPouchStoneWeights(prev => {
      const newStoneWeights = { ...prev, [pouchId]: weight };
      // Calculate total stone weights
      const newTotalStoneWeight = Object.values(newStoneWeights).reduce((sum, w) => sum + (w || 0), 0);
      setTotalStoneWeight(newTotalStoneWeight); // Set total stone weight
      
      // Calculate total pouch weights
      const totalPouchWeight = Object.values(pouchReceivedWeights).reduce((sum, w) => sum + (w || 0), 0);
      
      // Set ornament weight as pouch weights + stone weights
      setOrnamentWeight(totalPouchWeight + newTotalStoneWeight);
      
      // Calculate total received weight including scrap and dust
      const newTotalReceived = totalPouchWeight + newTotalStoneWeight + scrapReceivedWeight + dustReceivedWeight;
      setTotalReceivedWeight(newTotalReceived);
      setReceivedWeight(newTotalReceived);
      
      // Calculate setting loss
      setSettingLoss(data?.setting.Issued_Weight__c ? data.setting.Issued_Weight__c - newTotalReceived : 0);
      
      return newStoneWeights;
    });
  };

  // Update useEffect for total calculations
  useEffect(() => {
    // Calculate total pouch weights (excluding stone weights)
    const totalPouchWeight = Object.values(pouchReceivedWeights).reduce((sum, w) => sum + (w || 0), 0);
    
    // Calculate total stone weights (kept for display only)
    const newTotalStoneWeight = Object.values(pouchStoneWeights).reduce((sum, w) => sum + (w || 0), 0);
    setTotalStoneWeight(newTotalStoneWeight);
    
    // Set ornament weight as pouch weights + stone weights
    const newOrnamentWeight = totalPouchWeight + newTotalStoneWeight;
    setOrnamentWeight(newOrnamentWeight);
    
    // Calculate total received weight including scrap and dust
    const totalWeight = totalPouchWeight + scrapReceivedWeight + dustReceivedWeight;
    setTotalReceivedWeight(totalWeight);
    setReceivedWeight(totalWeight);
    
    if (data) {
      // Calculate setting loss using only pouch weights (excluding stone weights)
      const issuedWeight = data.setting.Issued_Weight__c;
      const loss = issuedWeight - totalWeight;
      setSettingLoss(loss);
    }
  }, [pouchReceivedWeights, pouchStoneWeights, scrapReceivedWeight, dustReceivedWeight, data]);

  // Remove manual stone weight distribution logic
  const handleManualStoneWeightChange = (weight: number) => {
    setStoneWeightAdded(weight);
  };

  useEffect(() => {
    console.log('useEffect triggered with settingId:', settingId);
    
    const fetchSettingDetails = async () => {
      if (!settingId) {
        console.log('No settingId provided');
        toast.error('Setting ID is required');
        setLoading(false);
        return;
      }

      try {
        const [prefix, date, month, year, number, subnumber] = settingId.split('/');
        
        if (!prefix || !date || !month || !year || !number || !subnumber  ) {
          throw new Error('Invalid setting ID format');
        }

        const url = `${apiBaseUrl}/api/setting/${prefix}/${date}/${month}/${year}/${number}/${subnumber}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response for Setting Details:', result);

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch setting details');
        }

        // Set the data
        setData(result.data);

        // Initialize received weights from existing data
        const initialWeights: { [key: string]: number } = {};
        const initialStoneWeights: { [key: string]: number } = {};
        
        if (result.data.pouches && result.data.pouches.length > 0) {
          console.log('Initializing pouch weights:', result.data.pouches);
          
          result.data.pouches.forEach((pouch: Pouch) => {
            console.log('Processing pouch:', pouch);
            // Use the correct field name
            const issuedWeight = pouch.Issued_weight_setting__c || 0;
            console.log(`Pouch ${pouch.Name} issued weight:`, issuedWeight);
            
            initialWeights[pouch.Id] = issuedWeight;
            initialStoneWeights[pouch.Id] = 0;
          });

          console.log('Initial weights set:', initialWeights);
          setPouchReceivedWeights(initialWeights);
          setPouchStoneWeights(initialStoneWeights);

          // Calculate total weight
          const total = Object.values(initialWeights).reduce((sum, weight) => sum + (weight || 0), 0);
          console.log('Total calculated weight:', total);
          setTotalReceivedWeight(total);
          setReceivedWeight(total);
          
          // Calculate initial setting loss
          if (result.data.setting.Issued_Weight__c) {
            const loss = result.data.setting.Issued_Weight__c - total;
            setSettingLoss(loss);
            console.log('Initial setting loss:', loss);
          }
        } else {
          console.log('No pouches found in the response');
        }

      } catch (error) {
        console.error('[Setting Details] Error fetching details:', error);
        toast.error(error.message || 'Failed to fetch setting details');
      } finally {
        setLoading(false);
      }
    };

    fetchSettingDetails();
  }, [settingId]);

  console.log('Current data:', data);
  console.log('Loading state:', loading);

  // Validate form data
  const validateForm = (data: UpdateFormData) => {
    try {
      updateFormSchema.parse(data);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<UpdateFormData> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0] as keyof UpdateFormData] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (!data) return;

      const combinedReceivedDateTime = `${receivedDate}T${receivedTime}:00.000Z`;

      const [prefix, date, month, year, number, subnumber] = data.setting.Name.split('/');

      const response = await fetch(
        `${apiBaseUrl}/api/setting/update/${prefix}/${date}/${month}/${year}/${number}/${subnumber}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receivedDate: combinedReceivedDateTime,
            receivedWeight: parseFloat(totalReceivedWeight.toFixed(4)),
            ornamentWeight: parseFloat(ornamentWeight.toFixed(4)),
            scrapReceivedWeight: parseFloat(scrapReceivedWeight.toFixed(4)),
            dustReceivedWeight: parseFloat(dustReceivedWeight.toFixed(4)),
            settingLoss: parseFloat(settingLoss.toFixed(4)),
            totalStoneWeight: parseFloat(totalStoneWeight.toFixed(4)),
            pouches: Object.entries(pouchReceivedWeights).map(([pouchId, weight]) => ({
              pouchId,
              receivedWeight: parseFloat(weight.toFixed(4)),
              stoneWeight: parseFloat((pouchStoneWeights[pouchId] || 0).toFixed(4))
            }))
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Setting details updated successfully');
        // Add a short delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          window.location.href = '/Departments/Setting/Setting_Table';
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update setting details');
      }
    } catch (error) {
      console.error('[SettingReceived] Error:', error);
      toast.error(error.message || 'Failed to update setting details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data || !data.setting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Failed to load setting details</div>
      </div>
    );
  }

  const { setting, pouches } = data;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Setting Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Setting Number</Label>
              <div className="mt-1">{setting.Name}</div>
            </div>
            <div>
              <Label>Issued Date</Label>
              <div className="mt-1">
                {new Date(setting.Issued_Date__c).toLocaleDateString()}
              </div>
            </div>
            <div>
              <Label>Issued Weight</Label>
              <div className="mt-1">{setting.Issued_Weight__c}g</div>
            </div>
            <div>
              <Label>Status</Label>
              <div className="mt-1">{setting.Status__c}</div>
            </div>
            {setting.Received_Date__c && (
              <>
                <div>
                  <Label>Received Date</Label>
                  <div className="mt-1">
                    {new Date(setting.Received_Date__c).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label>Received Weight</Label>
                  <div className="mt-1">{setting.Received_Weight__c}g</div>
                </div>
                <div>
                  <Label>Setting Loss</Label>
                  <div className="mt-1">{setting.Setting_l__c}g</div>
                </div>
              </>
            )}
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
                <h3 className="text-lg font-semibold">Pouch Weights</h3>
                {pouches.map((pouch) => (
                  <div key={pouch.Id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Pouch Number</Label>
                        <div className="mt-1">{pouch.Name}</div>
                      </div>
                      <div>
                        <Label>Issued Weight</Label>
                        <div className="mt-1">{pouch.Issued_weight_setting__c}g</div>
                      </div>
                      <div>
                        <Label>Received Weight</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={pouchReceivedWeights[pouch.Id] || ''}
                          onChange={(e) => handlePouchWeightChange(pouch.Id, parseFloat(e.target.value) || 0)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Stone Weight</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={pouchStoneWeights[pouch.Id] || ''}
                          onChange={(e) => handlePouchStoneWeightChange(pouch.Id, parseFloat(e.target.value) || 0)}
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
                  <Label>Setting Loss (g)</Label>
                  <Input
                    type="number"
                    value={settingLoss.toFixed(4)}
                    className="w-full h-9 bg-gray-50"
                    disabled={true}
                  />
                </div>

                <div>
                  <Label>Total Stone Weight (g)</Label>
                  <Input
                    type="number"
                    value={totalStoneWeight.toFixed(4)}
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
                {isSubmitting ? 'Updating...' : 'Update Setting Details'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingDetailsPage;
