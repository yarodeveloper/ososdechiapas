import React, { useState, useEffect } from 'react';

const RegisterPlayer = () => {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    category_id: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    position: '',
    jersey_number: ''
  });

  useEffect(() => {
    // Fetch categories and parents
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/users/parents').then(res => res.json())
    ])
    .then(([catsData, parentsData]) => {
      setCategories(catsData);
      setParents(parentsData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching form details:', err);
      setError('Error cargando la base de datos.');
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        // Reset form
        setFormData({
            user_id: '', category_id: '', first_name: '', last_name: '', birth_date: '', position: '', jersey_number: ''
        });
      } else {
        setError(data.message || 'Error al guardar el jugador.');
      }
    } catch (err) {
      setError('Problema de conexión con el servidor.');
    }
  };

  if (loading) return <div className="text-center p-8">Cargando formulario...</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h2 className="text-3xl font-extrabold text-blue-900 mb-6 font-outfit">Registro de Jugador</h2>
        
        {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                ¡Jugador registrado exitosamente!
            </div>
        )}
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre(s) *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Ej. Juan Carlos" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellidos *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Ej. Pérez García" />
            </div>
          </div>

          {/* Fila 2: Fecha Nac y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Nacimiento *</label>
                <input required type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría *</label>
                <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                    <option value="">-- Selecciona una categoría --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.min_age}-{cat.max_age} años)</option>
                    ))}
                </select>
            </div>
          </div>

          {/* Fila 3: Posición y Jersey */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Posición (Opcional)</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Ej. QB, LB, RB" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Número de Jersey (Opcional)</label>
                <input type="number" name="jersey_number" value={formData.jersey_number} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Ej. 12" />
            </div>
          </div>

          {/* Fila 4: Padre/Tutor */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Información del Tutor</h3>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Seleccionar Padre/Madre *</label>
                <select required name="user_id" value={formData.user_id} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                    <option value="">-- Asignar a un usuario --</option>
                    {parents.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                    ))}
                </select>
                {parents.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">⚠️ No hay padres registrados. Crea uno primero en la base de datos.</p>
                )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-200">
              Registrar Jugador
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default RegisterPlayer;
