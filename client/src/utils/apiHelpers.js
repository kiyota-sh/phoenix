export function extractArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  const knownKeys = [
    "items",
    "rows",
    "data",
    "proyectos",
    "categorias",
    "avances",
    "tareas",
    "results",
  ];
  for (const key of knownKeys) {
    if (Array.isArray(raw[key])) return raw[key];
  }

  const arrayValues = Object.values(raw).filter(Array.isArray);
  if (arrayValues.length === 1) return arrayValues[0];

  console.warn(
    "extractArray: unrecognized list shape, returning empty array. Raw response was:",
    raw,
  );
  return [];
}
