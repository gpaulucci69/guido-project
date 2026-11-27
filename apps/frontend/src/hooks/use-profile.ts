import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loadProfile,
  updateProfile,
  type ProfileUpdate,
} from "../auth/profile.js";

export function useProfile(identity: { tenantId: string; sub: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["profile", identity.tenantId, identity.sub];
  const profile = useQuery({ queryKey, queryFn: loadProfile });
  const update = useMutation({
    mutationFn: (input: ProfileUpdate) => updateProfile(input),
    onSuccess: (value) => queryClient.setQueryData(queryKey, value),
  });
  return {
    ...profile,
    updateProfile: update.mutateAsync,
    updating: update.isPending,
    updateError: update.error,
  };
}
