// netlify/functions/convert-weight.js
// GET /api/convert-weight?value=10&from=kilos&to=libras

const { successResponse, errorResponse, parseValue, round } = require("./shared/utils");

// Factor de conversión de cada unidad a gramos (unidad base)
const TO_GRAMS = {
  gramos: 1,
  kilos: 1000,
  toneladas: 1000000, // tonelada métrica
  libras: 453.59237,
  onzas: 28.349523125,
};

const UNIT_LIST = Object.keys(TO_GRAMS);

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return successResponse({ message: "OK" });
  }

  const { value, from, to } = event.queryStringParameters || {};

  if (value === undefined || !from || !to) {
    return errorResponse(
      400,
      "Parámetros faltantes",
      "Se requieren los parámetros 'value', 'from' y 'to'"
    );
  }

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

  if (!TO_GRAMS.hasOwnProperty(fromUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${from}' no está soportada. Unidades válidas: ${UNIT_LIST.join(", ")}`
    );
  }

  if (!TO_GRAMS.hasOwnProperty(toUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${to}' no está soportada. Unidades válidas: ${UNIT_LIST.join(", ")}`
    );
  }

  const factor = TO_GRAMS[fromUnit] / TO_GRAMS[toUnit];
  const result = round(parsed.value * factor);

  return successResponse({
    value: parsed.value,
    from: fromUnit,
    to: toUnit,
    result,
    formula: `value * ${round(factor)}`,
  });
};
