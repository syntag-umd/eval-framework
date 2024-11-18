"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Barber {
  name: string;
  services: string[];
}

interface Services {
  [serviceName: string]: string[];
}

interface ShopConfig {
  shop_name: string;
  shop_address: string;
  shop_schedule: string;
  barbers: Barber[];
  services: Services;
  hardcoded_datetime: string;
}

interface ConfigEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ShopConfig) => void;
  initialConfig: ShopConfig;
}

export function ConfigEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig
}: ConfigEditorModalProps) {
  const [config, setConfig] = useState<ShopConfig>(initialConfig);
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberServices, setNewBarberServices] = useState<{ [key: number]: string }>({});
  const [newServiceName, setNewServiceName] = useState('');

  const handleAddBarber = () => {
    if (!newBarberName) return;
    setConfig(prev => ({
      ...prev,
      barbers: [...prev.barbers, { name: newBarberName, services: [] }],
      services: {
        ...prev.services
      }
    }));
    setNewBarberName('');
  };

  const handleAddServiceToBarber = (barberIndex: number) => {
    const serviceToAdd = newBarberServices[barberIndex];
    if (!serviceToAdd) return;
    setConfig(prev => {
      const updatedBarbers = [...prev.barbers];
      if (!updatedBarbers[barberIndex].services.includes(serviceToAdd)) {
        updatedBarbers[barberIndex].services.push(serviceToAdd);
      }

      // Update services mapping
      const updatedServices = { ...prev.services };
      if (!updatedServices[serviceToAdd]) {
        updatedServices[serviceToAdd] = [];
      }
      if (!updatedServices[serviceToAdd].includes(prev.barbers[barberIndex].name)) {
        updatedServices[serviceToAdd].push(prev.barbers[barberIndex].name);
      }

      return {
        ...prev,
        barbers: updatedBarbers,
        services: updatedServices
      };
    });
    setNewBarberServices(prev => ({ ...prev, [barberIndex]: '' }));
  };

  const handleRemoveBarber = (index: number) => {
    setConfig(prev => {
      const updatedBarbers = prev.barbers.filter((_, i) => i !== index);
      const removedBarber = prev.barbers[index];
      
      // Update services mapping
      const updatedServices = { ...prev.services };
      Object.keys(updatedServices).forEach(service => {
        updatedServices[service] = updatedServices[service].filter(
          barber => barber !== removedBarber.name
        );
        // Remove service if no barbers offer it
        if (updatedServices[service].length === 0) {
          delete updatedServices[service];
        }
      });

      return {
        ...prev,
        barbers: updatedBarbers,
        services: updatedServices
      };
    });
  };

  const handleRemoveServiceFromBarber = (barberIndex: number, service: string) => {
    setConfig(prev => {
      const updatedBarbers = [...prev.barbers];
      updatedBarbers[barberIndex].services = updatedBarbers[barberIndex].services.filter(
        s => s !== service
      );

      // Update services mapping
      const updatedServices = { ...prev.services };
      updatedServices[service] = updatedServices[service].filter(
        barber => barber !== prev.barbers[barberIndex].name
      );
      // Remove service if no barbers offer it
      if (updatedServices[service].length === 0) {
        delete updatedServices[service];
      }

      return {
        ...prev,
        barbers: updatedBarbers,
        services: updatedServices
      };
    });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Shop Configuration</DialogTitle>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto space-y-6 px-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shop Name</Label>
                <Input
                  value={config.shop_name}
                  onChange={(e) => setConfig(prev => ({ ...prev, shop_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Shop Address</Label>
                <Input
                  value={config.shop_address}
                  onChange={(e) => setConfig(prev => ({ ...prev, shop_address: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Shop Schedule</Label>
              <Input
                value={config.shop_schedule}
                onChange={(e) => setConfig(prev => ({ ...prev, shop_schedule: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Current DateTime</Label>
              <Input
                type="datetime-local"
                value={config.hardcoded_datetime.slice(0, 16)}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  hardcoded_datetime: new Date(e.target.value).toISOString()
                }))}
              />
            </div>
          </div>

          {/* Barbers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Barbers</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="New barber name"
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleAddBarber} disabled={!newBarberName}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Barber
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {config.barbers.map((barber, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{barber.name}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBarber(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add service"
                        value={newBarberServices[index] || ''}
                        onChange={(e) => setNewBarberServices(prev => ({
                          ...prev,
                          [index]: e.target.value
                        }))}
                      />
                      <Button 
                        onClick={() => handleAddServiceToBarber(index)}
                        disabled={!newBarberServices[index]}
                      >
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {barber.services.map((service, serviceIndex) => (
                        <div
                          key={serviceIndex}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {service}
                          <button
                            onClick={() => handleRemoveServiceFromBarber(index, service)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Services Summary */}
          <div className="space-y-2">
            <Label>Services Overview</Label>
            <div className="bg-muted p-4 rounded-lg">
              {Object.entries(config.services).map(([service, barbers]) => (
                <div key={service} className="flex justify-between items-center py-1">
                  <span className="font-medium">{service}</span>
                  <span className="text-sm text-muted-foreground">
                    {barbers.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-background px-4 py-4 border-t">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}