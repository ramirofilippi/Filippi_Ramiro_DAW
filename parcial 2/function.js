const formClima = document.getElementById('formClima');
const ciudadInput = document.getElementById('ciudad');
const btnClima = document.getElementById('btnClima');
const estado = document.getElementById('estado');
const resultado = document.getElementById('resultado');
const resCiudad = document.getElementById('resCiudad');
const resTemperatura = document.getElementById('resTemperatura');
const resViento = document.getElementById('resViento');
const resCodigo = document.getElementById('resCodigo');

formClima.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ciudad = ciudadInput.value.trim();
    if (!ciudad) {
        estado.textContent = 'Por favor ingresá el nombre de una ciudad.';
        resultado.hidden = true;
        return;
    }

    estado.textContent = 'Consultando...';
    resultado.hidden = true;

    try {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1`;
        const geocodeResp = await fetch(geocodeUrl);
        if (!geocodeResp.ok) {
            throw new Error(`Error en geocodificación: ${geocodeResp.status} ${geocodeResp.statusText}`);
        }

        const geocodeData = await geocodeResp.json();
        const results = geocodeData.results;
        if (!Array.isArray(results) || results.length === 0) {
            estado.textContent = 'Ciudad no encontrada';
            return;
        }

        const { latitude, longitude, name, country, admin1 } = results[0];
        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current_weather=true`;
        const forecastResp = await fetch(forecastUrl);
        if (!forecastResp.ok) {
            throw new Error(`Error en clima: ${forecastResp.status} ${forecastResp.statusText}`);
        }

        const forecastData = await forecastResp.json();
        const current = forecastData.current_weather;
        if (!current) {
            throw new Error('No se encontró información de clima actual.');
        }

        resCiudad.innerHTML = `<strong>Ubicación:</strong> ${name}${admin1 ? ', ' + admin1 : ''}, ${country}`;
        resTemperatura.innerHTML = `<strong>Temperatura:</strong> ${current.temperature} °C`;
        resViento.innerHTML = `<strong>Velocidad del viento:</strong> ${current.windspeed} km/h`;
        resCodigo.innerHTML = `<strong>Código de clima:</strong> ${current.weathercode}`;
        estado.textContent = 'Clima consultado correctamente.';
        resultado.hidden = false;
    } catch (error) {
        estado.textContent = error.message || 'Ocurrió un error al consultar el clima.';
        resultado.hidden = true;
    }
});
