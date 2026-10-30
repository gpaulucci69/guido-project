export type NotificationSettings = {
  graceAfterDueDays: number;
  reminderIntervalDays: number;
  updatedByUserId: string;
};

export function validateNotificationSettings(
  settings: NotificationSettings,
): NotificationSettings {
  if (
    !Number.isInteger(settings.graceAfterDueDays) ||
    settings.graceAfterDueDays < 0 ||
    settings.graceAfterDueDays > 30
  )
    throw new Error("Los días de gracia deben estar entre 0 y 30");
  if (
    !Number.isInteger(settings.reminderIntervalDays) ||
    settings.reminderIntervalDays < 1 ||
    settings.reminderIntervalDays > 60
  )
    throw new Error("El intervalo debe estar entre 1 y 60 días");
  if (!settings.updatedByUserId)
    throw new Error("El usuario modificador es obligatorio");
  return { ...settings };
}
