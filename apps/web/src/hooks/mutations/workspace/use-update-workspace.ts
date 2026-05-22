import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { createSlug } from "@/lib/utils/create-slug";

type UpdateWorkspaceRequest = {
  workspaceId: string;
  name?: string;
  description?: string;
  slug?: string;
  logo?: string;
  metadata?: Record<string, unknown>;
  rruleTimezone?: string;
  rruleRunAtHour?: number;
  rruleRunAtMinute?: number;
};

function useUpdateWorkspace() {
  return useMutation({
    mutationFn: async ({
      workspaceId,
      name,
      description,
      slug,
      logo,
      metadata,
      rruleTimezone,
      rruleRunAtHour,
      rruleRunAtMinute,
    }: UpdateWorkspaceRequest) => {
      const updateData: {
        name?: string;
        description?: string;
        slug?: string;
        logo?: string;
        metadata?: Record<string, unknown>;
        rruleTimezone?: string;
        rruleRunAtHour?: number;
        rruleRunAtMinute?: number;
      } = {};

      if (name !== undefined) {
        updateData.name = name;
        if (slug === undefined) {
          updateData.slug = createSlug(name);
        }
      }

      if (slug !== undefined) {
        updateData.slug = slug;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (logo !== undefined) {
        updateData.logo = logo;
      }

      if (metadata !== undefined) {
        updateData.metadata = metadata;
      }

      if (rruleTimezone !== undefined) {
        updateData.rruleTimezone = rruleTimezone;
      }

      if (rruleRunAtHour !== undefined) {
        updateData.rruleRunAtHour = rruleRunAtHour;
      }

      if (rruleRunAtMinute !== undefined) {
        updateData.rruleRunAtMinute = rruleRunAtMinute;
      }

      const { data, error } = await authClient.organization.update({
        data: updateData,
        organizationId: workspaceId,
      });

      if (error) {
        throw new Error(error.message || "Failed to update workspace");
      }

      return data;
    },
  });
}

export default useUpdateWorkspace;
