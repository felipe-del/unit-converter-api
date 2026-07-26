// netlify/functions/convert-temperature.js
// GET /api/convert-temperature?value=100&from=celsius&to=fahrenheit

const { successResponse, errorResponse, parseValue, round } = require("./shared/utils");

const VALID_UNITS = ["celsius", "kelvin", "fahrenheit"];

// Convierte cualquier unidad a Celsius (unidad base intermedia)
function toCelsius(value, unit) {
  switch (unit) {
    case "celsius":
      return value;
    case "kelvin":
      return value - 273.15;
    case "fahrenheit":
      return (value - 32) * (5 / 9);
  }
}

// Convierte de Celsius a la unidad destino
function fromCelsius(celsius, unit) {
  switch (unit) {
    case "celsius":
      return celsius;
    case "kelvin":
      return celsius + 273.15;
    case "fahrenheit":
      return celsius * (9 / 5) + 32;
  }
}

// Devuelve una fórmula legible según el par de unidades
function getFormula(from, to) {
  if (from === to) return "value";

  const formulas = {
    "celsius->fahrenheit": "(value * 9/5) + 32",
    "celsius->kelvin": "value + 273.15",
    "fahrenheit->celsius": "(value - 32) * 5/9",
    "fahrenheit->kelvin": "(value - 32) * 5/9 + 273.15",
    "kelvin->celsius": "value - 273.15",
    "kelvin->fahrenheit": "(value - 273.15) * 9/5 + 32",
  };

  return formulas[`${from}->${to}`];
}

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

  if (!VALID_UNITS.includes(fromUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${from}' no está soportada. Unidades válidas: ${VALID_UNITS.join(", ")}`
    );
  }

  if (!VALID_UNITS.includes(toUnit)) {
    return errorResponse(
      400,
      "Unidad no válida",
      `La unidad '${to}' no está soportada. Unidades válidas: ${VALID_UNITS.join(", ")}`
    );
  }

  const celsius = toCelsius(parsed.value, fromUnit);
  const result = round(fromCelsius(celsius, toUnit));

  return successResponse({
    value: parsed.value,
    from: fromUnit,
    to: toUnit,
    result,
    formula: getFormula(fromUnit, toUnit),
  });
};
