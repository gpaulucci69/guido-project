export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
};
export function problem(
  status: number,
  title: string,
  detail: string,
  errors?: Record<string, string[]>,
): ProblemDetails {
  return {
    type: `https://httpstatuses.com/${status}`,
    title,
    status,
    detail,
    ...(errors ? { errors } : {}),
  };
}

export function validationProblem(
  errors: Record<string, string[]>,
  instance?: string,
): ProblemDetails {
  return {
    ...problem(
      400,
      "Error de validación",
      "La solicitud contiene datos inválidos.",
      errors,
    ),
    ...(instance ? { instance } : {}),
  };
}

export function problemFromError(
  error: unknown,
  instance?: string,
): ProblemDetails {
  if (error instanceof Error)
    return {
      ...problem(400, "Solicitud inválida", error.message),
      ...(instance ? { instance } : {}),
    };
  return {
    ...problem(500, "Error interno", "Ocurrió un error inesperado."),
    ...(instance ? { instance } : {}),
  };
}
