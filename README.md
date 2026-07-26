# Unit Converter API

API REST construida con **Node.js** y **Netlify Functions** para convertir unidades de
**distancia**, **temperatura** y **peso**.

## Estructura del proyecto

```
unit-converter-api/
├── netlify.toml                     # Configuración de Netlify (rutas /api/*)
├── package.json
├── public/
│   └── index.html                   # Página de documentación
└── netlify/
    └── functions/
        ├── convert-distance.js      # Función serverless de distancia
        ├── convert-temperature.js   # Función serverless de temperatura
        ├── convert-weight.js        # Función serverless de peso
        └── shared/
            └── utils.js             # Helpers compartidos (respuestas, validación)
```

Cada endpoint es una **función serverless independiente**, tal como pide el enunciado.

## Unidades soportadas

| Endpoint                  | Unidades válidas |
|---------------------------|-------------------|
| `/api/convert-distance`   | `metros, kilometros, centimetros, millas, yardas, pies, pulgadas` |
| `/api/convert-temperature`| `celsius, kelvin, fahrenheit` |
| `/api/convert-weight`     | `kilos, gramos, toneladas, libras, onzas` |

## Despliegue en Netlify

### Opción A: Netlify CLI (recomendada)

```bash
npm install -g netlify-cli
cd unit-converter-api
netlify login
netlify init          # crea/enlaza el sitio en tu cuenta
netlify deploy --prod # despliega a producción
```

### Opción B: Desde GitHub (arrastrando y soltando también funciona)

1. Sube este proyecto a un repositorio de GitHub (sin `node_modules`).
2. Entra a [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Conecta el repositorio. Netlify detecta `netlify.toml` automáticamente:
   - Build command: (vacío, no hace falta)
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. Deploy. Netlify publicará tus funciones en `https://tu-app.netlify.app/.netlify/functions/...`
   y, gracias a los `redirects` de `netlify.toml`, también en `https://tu-app.netlify.app/api/...`.

### Probar en local

```bash
npm install
netlify dev
```

Esto levanta el servidor en `http://localhost:8888` con las mismas rutas `/api/...`.

## Ejemplos de uso

```
GET /api/convert-distance?value=5&from=kilometros&to=millas
GET /api/convert-distance?value=100&from=metros&to=pies
GET /api/convert-temperature?value=25&from=celsius&to=fahrenheit
GET /api/convert-temperature?value=300&from=kelvin&to=celsius
GET /api/convert-weight?value=50&from=kilos&to=libras
GET /api/convert-weight?value=1000&from=gramos&to=kilos
```

### Ejemplo de respuesta (éxito)

```json
{
  "success": true,
  "data": {
    "value": 5,
    "from": "kilometros",
    "to": "millas",
    "result": 3.10686,
    "formula": "value * 0.621371"
  }
}
```

### Ejemplo de respuesta (error)

```json
{
  "success": false,
  "error": "Unidad no válida",
  "message": "La unidad 'kilometro' no está soportada"
}
```

## Manejo de errores

La API valida:
- Parámetros faltantes (`value`, `from`, `to`) → `400`
- `value` no numérico → `400`
- Unidad `from` o `to` no soportada → `400`, indicando las unidades válidas
