import React, { useState, useEffect } from 'react';
// Importamos el cliente de Axios que definimos
import apiClient from '../../config/apiClient'; 
// Importamos los endpoints para evitar escribir las URLs manualmente
import { API_ENDPOINTS } from '../../config/endpoint';

function ListarTurnos() {
    const [turno, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTurnos = async () => {
            try {
                // El cliente ya sabe que la URL base es http://localhost:8000/api
                // Solo necesita el path restante: /turnos/
                const response = await apiClient.get(API_ENDPOINTS.TURNOS); 
                setTurnos(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error al obtener turnos:", err);
                setError('Hubo un error al cargar los datos.');
                setLoading(false);
            }
        };

        fetchTurnos();
    }, []);

    if (loading) return <p>Cargando Turnos...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Listado de Turnos</h2>
            <ul>
                {turno.map(turno => (
                    <li key={turno.id}>{turno.motivo}</li> 
                ))}
            </ul>
        </div>
    );
}

export default ListarTurnos;
