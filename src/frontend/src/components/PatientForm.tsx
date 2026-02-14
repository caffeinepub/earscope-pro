import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient } from '../backend';
import { useAddPatient, useGetAllPatients } from '../hooks/useQueries';
import { toast } from 'sonner';

interface PatientFormProps {
  onPatientSelected: (patient: Patient) => void;
}

export default function PatientForm({ onPatientSelected }: PatientFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [doctor, setDoctor] = useState('');

  const { data: patients = [] } = useGetAllPatients();
  const addPatient = useAddPatient();

  const handleCreate = async () => {
    if (!name || !patientId || !age || !doctor) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addPatient.mutateAsync({
        id: patientId,
        name,
        age: BigInt(age),
        doctor,
      });

      toast.success('Patient created successfully');
      setIsCreating(false);
      setName('');
      setPatientId('');
      setAge('');
      setDoctor('');
    } catch (error) {
      toast.error('Failed to create patient');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Management</CardTitle>
        <CardDescription>Select an existing patient or create a new one</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCreating ? (
          <>
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Select onValueChange={(id) => {
                const patient = patients.find((p) => p.id === id);
                if (patient) onPatientSelected(patient);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} (ID: {patient.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setIsCreating(true)} className="w-full">
              Create New Patient
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="P-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="35"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Input
                id="doctor"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                placeholder="Dr. Smith"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={addPatient.isPending} className="flex-1">
                {addPatient.isPending ? 'Creating...' : 'Create Patient'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
