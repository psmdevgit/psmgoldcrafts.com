"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';

interface Pouch {
  Id: string;
  Name: string;
  Isssued_Weight_Grinding__c: number;
  Received_Weight_Grinding__c: number;
  Issued_Pouch_weight__c?: number;
  Product__c: string;
  Quantity__c: number;
}

export default function AddSettingDetails() {
  const searchParams = useSearchParams();
  const filingId = searchParams.get('filingId');
  const grindingId = searchParams.get('grindingId');
    const MediaId = searchParams.get('mediaID');
  const [loading, setLoading] = useState(true);
  const [formattedId, setFormattedId] = useState<string>('');
  const [pouches, setPouches] = useState<Pouch[]>([]);
  const [pouchWeights, setPouchWeights] = useState<{ [key: string]: number }>({});
  const [pouchQuantities, setPouchQuantities] = useState<{ [key: string]: number }>({});
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuedTime, setIssuedTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  });
  const [totalWeight, setTotalWeight] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const router = useRouter();

  
const apiBaseUrl = "https://erp-server-r9wh.onrender.com"; 



  useEffect(() => {
    const initializeSetting = async () => {
      if (!filingId && !grindingId && !MediaId) {
        toast.error('No ID provided');
        return;
      }

      try {
        let prefix, date, month, year, number,subnumber ;
        let apiEndpoint;

        if (filingId) {
          [prefix, date, month, year, number, subnumber  ] = filingId.split('/');
          apiEndpoint = `${apiBaseUrl}/api/grinding/GRIND/${date}/${month}/${year}/${number}/${subnumber}/pouches`;
        } else if (grindingId) {
          [prefix, date, month, year, number, subnumber] = grindingId.split('/');
          apiEndpoint = `${apiBaseUrl}/api/grinding/${grindingId}/pouches`;
        }
        else if (MediaId) {
          [prefix, date, month, year, number, subnumber] = MediaId.split('/');
          apiEndpoint = `${apiBaseUrl}/api/media/${MediaId}/pouches`;
        }

        console.log('[AddSetting] ID parts:', { prefix, date, month, year, number, subnumber });

        const newSid = Math.floor(Math.random() * 99) + 1;

        
        const generatedSettingId = `CORRECT/${date}/${month}/${year}/${number}/${subnumber}`;
        setFormattedId(generatedSettingId);

        const pouchResponse = await fetch(apiEndpoint);
        const pouchResult = await pouchResponse.json();

        if (!pouchResult.success) {
          throw new Error(pouchResult.message || 'Failed to fetch pouches');
        }

        const formattedPouches = pouchResult.data.pouches.map((pouch: Pouch) => ({
          ...pouch,
          Name: `${prefix}/${date}/${month}/${year}/${number}/POUCH${pouch.Name.split('POUCH')[1]}`,
          Issued_Pouch_weight__c: 0,
           Received_Weight_Grinding__c: MediaId
    ? pouch.Received_Weight_Media__c || 0
    : pouch.Received_Weight_Grinding__c || 0
        }));

        setPouches(formattedPouches);
        
        const weights: { [key: string]: number } = {};
        const quantities: { [key: string]: number } = {};
        formattedPouches.forEach((pouch: Pouch) => {
          weights[pouch.Id] = 0;
          quantities[pouch.Id] = pouch.Quantity__c;
          setOrderId(pouch.Order_Id__c || '');
        });
        setPouchWeights(weights);
        setPouchQuantities(quantities);
        
        setTotalWeight(0);

      } catch (error) {
        console.error('[AddSetting] Error:', error);
        toast.error(error.message || 'Failed to initialize setting');
      } finally {
        setLoading(false);
      }
    };

    initializeSetting();
  }, [filingId, grindingId]);

  const handleWeightChange = (pouchId: string, weight: number) => {
    setPouchWeights(prev => {
      const newWeights = { ...prev, [pouchId]: weight };
      const newTotal = Object.values(newWeights).reduce((sum, w) => sum + (w || 0), 0);
      setTotalWeight(newTotal);
      return newWeights;
    });
  };

  const handleQuantityChange = (pouchId: string, quantity: number) => {
    setPouchQuantities(prev => ({
      ...prev,
      [pouchId]: quantity
    }));
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setIsSubmitting(true);

        // Validate each pouch's correction weight
    for (const pouch of pouches) {
      const correctionWeight = pouchWeights[pouch.Id] || 0;
      const receivedWeight = pouch.Received_Weight_Grinding__c || 0;

      if (correctionWeight === 0) {
        alert(`Correction weight cannot be zero.`);
        setIsSubmitting(false);
        return;
      }

      if (correctionWeight > receivedWeight) {
        alert(`Correction weight cannot greater than received weight.`);
        setIsSubmitting(false);
        return;
      }
    }

    // Combine date and time for issued datetime
    const combinedDateTime = `${issuedDate}T${issuedTime}:00.000Z`;

    // Prepare pouch data
    const pouchData = pouches.map(pouch => ({
      pouchId: pouch.Id,
      correctionWeight: pouchWeights[pouch.Id] || 0,   // ✅ use correctionWeight
      quantity: pouchQuantities[pouch.Id] || 0,
      product: pouch.Product__c || 'N/A'
    }));

    // Prepare correction data
    const correctionData = {
      correctionId: formattedId,     // ✅ renamed
      issuedDate: combinedDateTime,
      pouches: pouchData,
      totalWeight,
      status: 'Pending',
      product: pouches[0]?.Product__c || 'N/A',
      quantity: pouchQuantities[pouches[0]?.Id] || 0,
      orderId
    };

    console.log('[AddCorrection] Submitting data:', correctionData);

    const response = await fetch(`${apiBaseUrl}/api/correction/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(correctionData)
    });

    const result = await response.json();

    if (result.success) {
      alert('Correction details saved successfully');
      toast.success('Correction details saved successfully');

      // Reset form
      setPouches([]);
      setPouchWeights({});
      setPouchQuantities({});
      setTotalWeight(0);
      setIssuedDate(new Date().toISOString().split('T')[0]);
      setIssuedTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setFormattedId('');
      setLoading(false);

      router.push('/Departments/Correction/correction_Table');
    } else {
      alert('Failed to save correction details');
      throw new Error(result.message || 'Failed to save correction details');
    }
  } catch (error: any) {
    console.error('[AddCorrection] Error:', error);
    alert('Failed to save correction details');
    toast.error(error.message || 'Failed to save correction details');
  } finally {
    setIsSubmitting(false);
  }
};

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full overflow-y-auto p-4 pt-40 mt-[-30px] bg-gray-50">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Add Correction Details</h2>
            <div className="text-sm font-medium">
              ID: <span className="text-gray-600">{filingId || grindingId}</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm font-medium">
                Correction ID: <span className="text-blue-600 font-bold">
                  {formattedId || 'Generating...'}
                </span>
              </div>
              <div>
                <Label htmlFor="issuedDate">Issued Date</Label>
                <Input
                  id="issuedDate"
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Label htmlFor="issuedTime">Issued Time</Label>
                <Input
                  id="issuedTime"
                  type="time"
                  value={issuedTime}
                  onChange={(e) => setIssuedTime(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Pouch Details</h3>
              {pouches.map((pouch) => (
                <div key={pouch.Id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Pouch ID</Label>
                      <div className="h-10 flex items-center">{pouch.Name}</div>
                    </div>
                    <div>
                      <Label>Product</Label>
                      <div className="h-10 flex items-center">{pouch.Product__c || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Received Weight from Grinding (g)</Label>
                      <div className="h-10 flex items-center text-gray-600">
                        {pouch.Received_Weight_Grinding__c?.toFixed(4) || '0.0000'}
                      </div>
                    </div>
                    <div>
                      <Label>Weight for Correction (g)</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={pouchWeights[pouch.Id] || ''}
                        onChange={(e) => handleWeightChange(pouch.Id, parseFloat(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={pouchQuantities[pouch.Id] || ''}
                        onChange={(e) => handleQuantityChange(pouch.Id, parseInt(e.target.value) || 0)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">Total Weight: </span>
                <span>{totalWeight.toFixed(4)}g</span>
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting || totalWeight === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Submit Correction Details'}
              </Button>
            </div>
          </form>
          {orderId && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium flex items-center">
                <span className="mr-2">Order ID:</span>
                <span className="text-blue-600 font-bold">{orderId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
