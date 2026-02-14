import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Patient, Session, Capture, SessionType, Eye, UserProfile, ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllPatients() {
  const { actor, isFetching } = useActor();

  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPatients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPatient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: { id: string; name: string; age: bigint; doctor: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPatient(patient.id, patient.name, patient.age, patient.doctor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useGetAllSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: { id: string; patientId: string; sessionType: SessionType; eye: Eye }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSession(session.id, session.patientId, session.sessionType, session.eye);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useGetAllCaptures() {
  const { actor, isFetching } = useActor();

  return useQuery<Capture[]>({
    queryKey: ['captures'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCaptures();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCapture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (capture: { id: string; sessionId: string; image: ExternalBlob; thumbnail: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCapture(capture.id, capture.sessionId, capture.image, capture.thumbnail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captures'] });
    },
  });
}
