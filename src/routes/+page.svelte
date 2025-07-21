<script>
    import { onMount } from 'svelte';






  // Lista principal
  let filas = [
    {
      orden: '',
      fechaIngreso: '',
      tecnico: 'Sin asignar',
      cantidad: 1,
      estado: 'Sin revisar',
      diasDesdeIngreso: 0
    }
  ];

  // Lista de filas terminadas
  let filasTerminadas = [];

  // Para controlar la pestaña activa (activa o terminados)
  let pestañaActiva = 'activas'; // 'activas' o 'terminadas'
   // Lista de Estadisticas
  let filasEstadisticas = [];

  function actualizarFecha(index) {
    const hoy = new Date();
    const fila = filas[index];

    if (fila.fechaIngreso) {
      const ingreso = new Date(fila.fechaIngreso);
      const diferencia = hoy - ingreso;
      fila.diasDesdeIngreso = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    } else {
      fila.diasDesdeIngreso = 0;
    }

    filas = [...filas]; // Forzar reactividad
    guardarDatos();
  }
  onMount(() => {
  const filasGuardadas = localStorage.getItem('filas');
  const filasTerminadasGuardadas = localStorage.getItem('filasTerminadas');

  if (filasGuardadas) {
    filas = JSON.parse(filasGuardadas);
  }

  if (filasTerminadasGuardadas) {
    filasTerminadas = JSON.parse(filasTerminadasGuardadas);
  }
});

function guardarDatos() {
  localStorage.setItem('filas', JSON.stringify(filas));
  localStorage.setItem('filasTerminadas', JSON.stringify(filasTerminadas));
}


  function agregarFila() {
    filas.push({
      orden: '',
      fechaIngreso: '',
      tecnico: 'Juan',
      cantidad: 1,
      estado: 'Sin revisar',
      diasDesdeIngreso: 0
    });
    filas = [...filas];
    guardarDatos();
  }

  function eliminarFila() {
    if (filas.length === 0) return;
    filas.pop();
    filas = [...filas];
    guardarDatos();
  }

  function terminarFila() {
    // Mover todas las filas cuyo estado sea "Terminado"
    // O bien la última fila (por ejemplo)
    // Acá hago que mueva la última fila si su estado es "Terminado"

    // Podés adaptar la lógica a lo que quieras.

    // Ejemplo: mover todas las filas que estén "Terminado"
    const terminadas = filas.filter(f => f.estado === 'Terminado');
    if (terminadas.length === 0) return alert('No hay filas terminadas para mover.');

    // Removerlas de filas
    filas = filas.filter(f => f.estado !== 'Terminado');

    // Añadirlas a filasTerminadas
    filasTerminadas = [...filasTerminadas, ...terminadas];
    guardarDatos();
  }

  function agruparPorTecnico(filas) {
  const conteo = {};
  for (const fila of filas) {
    conteo[fila.tecnico] = (conteo[fila.tecnico] || 0) + 1;
  }
  return Object.entries(conteo).map(([tecnico, cantidad]) => ({ tecnico, cantidad }));
}


function eliminarTodo() {
  if (confirm('¿Estás seguro de que querés borrar todos los datos? Esta acción no se puede deshacer.')) {
    filas = [];
    filasTerminadas = [];
    guardarDatos(); // Esto actualiza el localStorage
  }
}



function promedioDiasPorTecnico(filas) {
  const datos = {};

  for (const fila of filas) {
    const tecnico = fila.tecnico;
    if (!datos[tecnico]) {
      datos[tecnico] = { totalDias: 0, cantidad: 0 };
    }

    datos[tecnico].totalDias += Number(fila.diasDesdeIngreso);
    datos[tecnico].cantidad++;
  }

  return Object.entries(datos).map(([tecnico, { totalDias, cantidad }]) => ({
    tecnico,
    promedio: cantidad > 0 ? Math.round(totalDias / cantidad) : 0
  }));
}

function evaluarCantidad(cantidad) {
  if (cantidad >= 81) return 'Excelente';
  if (cantidad >= 61) return 'Bueno';
  if (cantidad >= 41) return 'Regular';
  if (cantidad >= 21) return 'Malo';
  return 'Pésimo';
}

function evaluarPromedio(promedio) {
  if (promedio >= 4.5) return 'Excelente';
  if (promedio >= 3.5) return 'Bueno';
  if (promedio >= 2.5) return 'Regular';
  if (promedio >= 1.5) return 'Malo';
  return 'Pésimo';
}

// Devuelve la peor evaluación de ambas
function peorEvaluacion(eval1, eval2) {
  const ranking = ['Pésimo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
  return ranking[Math.min(ranking.indexOf(eval1), ranking.indexOf(eval2))];
}

function agruparPorMes(filas) {
  const meses = {};

  for (const fila of filas) {
    const fecha = new Date(fila.fechaIngreso);
    const mesNombre = fecha.toLocaleString('es-ES', { month: 'long' });
    const mes = mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1); // Capitalizar

    if (!meses[mes]) {
      meses[mes] = {
        cantidadEquipos: 0,
        totalDias: 0,
        ordenes: []
      };
    }

    meses[mes].cantidadEquipos += Number(fila.cantidad);
    meses[mes].totalDias += Number(fila.diasDesdeIngreso);
    meses[mes].ordenes.push(fila.orden);
  }

  return meses;
}









</script>

<style>
  /* Tu CSS existente */
  body {
    background-color: #e6f0fa;
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    color: #2b4c6f;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  th {
    background-color: #2b4c6f;
    color: white;
    padding: 12px;
    text-align: center;
  }

  td {
    padding: 10px;
    border: 1px solid #cbd6e2;
  }

  input,
  select {
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
  }

  button {
    margin-top: 1rem;
    background-color: #2b4c6f;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  button:hover {
    background-color: #1d3550;
  }

  .tabs {
    text-align: center;
    margin-bottom: 1rem;
  }

  .tabs button {
    margin: 0 0.5rem;
    background-color: #b0c4de;
    color: #2b4c6f;
  }

  .tabs button.active {
    background-color: #2b4c6f;
    color: white;
  }

  .boton-eliminar-todo {
   margin-top: 1rem;
    background-color: #2b4c6f;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
}

.boton-eliminar-todo:hover {
  background-color: #c0392b;
}

</style>

<h1>Órdenes de Servicio</h1>

<div class="tabs" style="text-align:center; margin-bottom:1rem;">
  <button
    class:active={pestañaActiva === 'activas'}
    on:click={() => (pestañaActiva = 'activas')}
    style="margin-right: 10px;"
  >
    Activas
  </button>
  <button
    class:active={pestañaActiva === 'terminadas'}
    on:click={() => (pestañaActiva = 'terminadas')}
  >
    Terminadas
  </button>
  <button
    class:active={pestañaActiva === 'estadisticas'}
    on:click={() => (pestañaActiva = 'estadisticas')}
  >
    Estadisticas
  </button>
</div>


{#if pestañaActiva === 'activas'}
  <table>
    <thead>
      <tr>
        <th>Orden</th>
        <th>Fecha de Ingreso</th>
        <th>Técnico</th>
        <th>Cantidad</th>
        <th>Estado</th>
        <th>Días desde ingreso</th>
      </tr>
    </thead>
    <tbody>
      {#each filas as fila, i}
        <tr>
          <td>
            <input type="number" bind:value={fila.orden} />
          </td>
          <td>
            <input
              type="date"
              bind:value={fila.fechaIngreso}
              on:change={() => actualizarFecha(i)}
            />
          </td>
          <td>
            <select bind:value={fila.tecnico}>
              <option>Sin asignar</option>
              <option>Juan</option>
              <option>Frank</option>
              <option>Rodrigo</option>
            </select>
          </td>
          <td>
            <input type="number" min="1" bind:value={fila.cantidad} />
          </td>
          <td>
            <select bind:value={fila.estado}>
              <option>Sin revisar</option>
              <option>Presupuestado</option>
              <option>Terminado</option>
            </select>
          </td>
          <td>{fila.diasDesdeIngreso}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div style="text-align: center;">
    <button on:click={agregarFila}>Agregar fila</button>
    <button on:click={eliminarFila}>Eliminar fila</button>
    <button on:click={terminarFila}>Mover terminados</button>
  </div>
{:else if pestañaActiva === 'terminadas'}
  <table>
    <thead>
      <tr>
        <th>Orden</th>
        <th>Fecha de Ingreso</th>
        <th>Técnico</th>
        <th>Cantidad</th>
        <th>Estado</th>
        <th>Días desde ingreso</th>
      </tr>
    </thead>
    <tbody>
      {#each filasTerminadas as fila, i}
        <tr>
          <td>{fila.orden}</td>
          <td>{fila.fechaIngreso}</td>
          <td>{fila.tecnico}</td>
          <td>{fila.cantidad}</td>
          <td>{fila.estado}</td>
          <td>{fila.diasDesdeIngreso}</td>
        </tr>
      {/each}
    </tbody>
  </table>

 {:else if pestañaActiva === 'estadisticas'}
  <div style="text-align: center;">
    <h2>Resumen de Estadísticas</h2>
    <p>Total de órdenes terminadas: {filasTerminadas.length}</p>

    <p>
      Cantidad total de unidades terminadas:
      {filasTerminadas.reduce((acc, fila) => acc + Number(fila.cantidad), 0)}
    </p>

    <p>
      Promedio de días desde ingreso:
      {filasTerminadas.length > 0
        ? Math.round(
            filasTerminadas.reduce((acc, fila) => acc + Number(fila.diasDesdeIngreso), 0) /
              filasTerminadas.length
          )
        : 0}
    </p>

    <h3>Órdenes por Técnico:</h3>
<ul>
  {#each agruparPorTecnico(filasTerminadas) as { tecnico, cantidad }}
    <li>{tecnico}: {cantidad} órdenes terminadas</li>
  {/each}
</ul>

<h3>Promedio de días desde ingreso por Técnico:</h3>
<ul>
  {#each promedioDiasPorTecnico(filasTerminadas) as { tecnico, promedio }}
    <li>{tecnico}: {promedio} días</li>
  {/each}
</ul>


<h3>Evaluación Mensual</h3>
<table>
  <thead>
    <tr>
      <th>Mes</th>
      <th>Terminados</th>
      <th>Sin Terminar</th>
      <th>Prom Rep Días</th>
      <th>Evaluación</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.entries(agruparPorMes(filasTerminadas)) as [mes, info]}
  {@const promDias = info.ordenes.length > 0 
    ? Math.round(info.totalDias / info.ordenes.length) 
    : 0}

  {@const promedioPorDia = promDias > 0 
    ? +(info.cantidadEquipos / promDias).toFixed(1)
    : 0}

  {@const evalCantidad = evaluarCantidad(info.cantidadEquipos)}
  {@const evalDias = evaluarPromedio(promedioPorDia)}
  {@const evalFinal = peorEvaluacion(evalCantidad, evalDias)}

  <tr>
    <td>{mes}</td>
    <td>{info.cantidadEquipos}</td>
    <td>0</td>
    <td>{promedioPorDia}</td>
    <td>{evalFinal}</td>
  </tr>
{/each}


  </tbody>
</table>




  </div>
<button on:click={eliminarTodo} class="boton-eliminar-todo">
  Eliminar todos los datos
</button>



{/if}
