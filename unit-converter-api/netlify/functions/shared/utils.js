// netlify/functions/shared/utils.js
// Funciones utilitarias compartidas por los tres endpoints

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function successResponse(payload) {
  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ success: true, data: payload }, null, 2),
  };
}

function errorResponse(statusCode, error, message) {
  return {
    statusCode,
    headers: HEADERS,
    body: JSON.stringify({ success: false, error, message }, null, 2),
  };
}

// Valida y convierte el parámetro "value" a número
function parseValue(rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return { ok: false };
  }
  const num = Number(rawValue);
  if (Number.isNaN(num)) {
    return { ok: false };
  }
  return { ok: true, value: num };
}

// Redondea a 6 decimales y limpia ceros sobrantes
function round(num) {
  return Math.round((num + Number.EPSILON) * 1e6) / 1e6;
}

module.exports = { HEADERS, successResponse, errorResponse, parseValue, round };
