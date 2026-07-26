// netlify/functions/convert-distance.js
// GET /api/convert-distance?value=5&from=kilometros&to=millas

const { successResponse, errorResponse, parseValue, round } = require("./shared/utils");

// Factor de conversión de cada unidad a metros (unidad base)
const TO_METERS = {
  metros: 1,
  kilometros: 1000,
  centimetros: 0.01,
  millas: 1609.344,
  yardas: 0.9144,
  pies: 0.3048,
  pulgadas: 0.0254,
};

const UNIT_LIST = Object.keys(TO_METERS);

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return successResponse({ message: "OK" });
  }

  const { value, from, to } = event.queryStringParameters || {};

  // Validar parámetros presentes
  if (value === undefined || !from || !to) {
    return errorResponse(
      400,
      "Parámetros faltantes",
      "Se requieren los parámetros 'value', 'from' y 'to'"
    );
  }

  // Validar valor numérico
  const parsed = parseValue(value);
  if (!parsed.ok) {
    return errorResponse(
      400,
      "Valor no válido",
      `El valor '${value}' no es un número válido`
    );
  }

  const fromUnit = from.toLowerCase().trim();
  const toUnit = to.toLowerCase().trim();

  // Validar unidad de origen
  if (!TO_METERS.hasOwnProperty(fromUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${from}' no está soportada. Unidades válidas: ${UNIT_LIST.join(", ")}`
    );
  }

  // Validar unidad de destino
  if (!TO_METERS.hasOwnProperty(toUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${to}' no está soportada. Unidades válidas: ${UNIT_LIST.join(", ")}`
    );
  }

  const factor = TO_METERS[fromUnit] / TO_METERS[toUnit];
  const result = round(parsed.value * factor);

  return successResponse({
    value: parsed.value,
    from: fromUnit,
    to: toUnit,
    result,
    formula: `value * ${round(factor)}`,
  });
};
