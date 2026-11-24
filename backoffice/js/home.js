const urlApi = "https://portfolio-api-three-black.vercel.app/api/v1";
const token = localStorage.getItem("token");

//revisar sesión activa
if (!token) {
    window.location.replace("index.html");
}

//poner el nombre del usuario en el menú
const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
if (usuarioGuardado && usuarioGuardado.name) {
    document.getElementById("saludo-usuario").textContent = `Hola, ${usuarioGuardado.name} ♡`;
}

//botón cerrar sesion
document.getElementById("btn-salir").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("index.html");
});

const listaProyectos = document.getElementById("lista-proyectos");
const ventanaModal = document.getElementById("ventana-modal");
const formProyecto = document.getElementById("form-proyecto");
const mensajePanel = document.getElementById("mensaje-panel");

let misProyectos = [];

function avisar(texto, tipo = "exito") {
    mensajePanel.textContent = texto;
    mensajePanel.className = tipo === "exito" ? "alerta alerta-exito" : "alerta alerta-error";
    setTimeout(() => mensajePanel.classList.add("oculto"), 3000);
}

//abrir y cerrar el formulario
function abrirModal(editando = false, proyecto = null) {
    formProyecto.reset();
    document.getElementById("proyecto-id").value = "";

    if (editando && proyecto) {
        document.getElementById("titulo-modal").textContent = "Editar Proyecto ♡";
        document.getElementById("proyecto-id").value = proyecto._id;
        document.getElementById("titulo").value = proyecto.title || "";
        document.getElementById("descripcion").value = proyecto.description || "";
        document.getElementById("tecnologias").value = Array.isArray(proyecto.technologies)
            ? proyecto.technologies.join(", ")
            : (proyecto.technologies || "");
        document.getElementById("repositorio").value = proyecto.repository || "";
        document.getElementById("imagen").value = Array.isArray(proyecto.images) && proyecto.images.length > 0
            ? proyecto.images[0]
            : (proyecto.image || "");
    } else {
        document.getElementById("titulo-modal").textContent = "Nuevo Proyecto ♡";
    }

    ventanaModal.classList.remove("oculto");
}

function cerrarModal() {
    ventanaModal.classList.add("oculto");
}

document.getElementById("btn-agregar").addEventListener("click", () => abrirModal(false));
document.getElementById("link-nuevo").addEventListener("click", (e) => {
    e.preventDefault();
    abrirModal(false);
});
document.getElementById("btn-cerrar-x").addEventListener("click", cerrarModal);
document.getElementById("btn-cancelar").addEventListener("click", cerrarModal);

//traer proyect del api
async function cargarProyectos() {
    try {
        const respuesta = await fetch(`${urlApi}/projects`, {
            headers: {
                "auth-token": token,
                "Authorization": `Bearer ${token}`
            }
        });

        if (respuesta.status === 401 || respuesta.status === 403) {
            localStorage.removeItem("token");
            window.location.replace("index.html");
            return;
        }

        const datos = await respuesta.json();
        misProyectos = Array.isArray(datos) ? datos : (datos.projects || datos.data || []);
        dibujarProyectos(misProyectos);
    } catch (error) {
        listaProyectos.innerHTML = `<p class="alerta alerta-error">Error al cargar: ${error.message}</p>`;
    }
}

function dibujarProyectos(proyectos) {
    if (!proyectos || proyectos.length === 0) {
        listaProyectos.innerHTML = `
            <div class="tarjeta-proyecto">
                <h3>Sin proyectos todavía ♡</h3>
                <p>Dale clic a <strong>"+ Agregar Proyecto"</strong> para subir el primero.</p>
            </div>
        `;
        return;
    }

    listaProyectos.innerHTML = proyectos.map(proyecto => {
        const foto = Array.isArray(proyecto.images) && proyecto.images.length > 0
            ? proyecto.images[0]
            : proyecto.image;

        const techs = Array.isArray(proyecto.technologies)
            ? proyecto.technologies
            : (proyecto.technologies ? proyecto.technologies.split(",") : []);

        return `
            <div class="tarjeta-proyecto">
                <div>
                    ${foto ? `<img src="${foto}" alt="${proyecto.title}" class="foto-proyecto">` : ""}
                    <h3>${proyecto.title}</h3>
                    <p>${proyecto.description}</p>
                    <div class="etiquetas">
                        ${techs.map(t => `<span class="etiqueta">${t.trim()}</span>`).join("")}
                    </div>
                    ${proyecto.repository ? `<a href="${proyecto.repository}" target="_blank" class="link-repo">Ver en GitHub →</a>` : ""}
                </div>
                <div class="botones-tarjeta">
                    <button class="boton-editar" onclick="editarProyecto('${proyecto._id}')">Actualizar</button>
                    <button class="boton-borrar" onclick="borrarProyecto('${proyecto._id}')">Eliminar</button>
                </div>
            </div>
        `;
    }).join("");
}

//gardar proyecto
formProyecto.addEventListener("submit", async (e) => {
    e.preventDefault();
    const botonGuardar = document.getElementById("btn-guardar");
    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    const id = document.getElementById("proyecto-id").value;
    const textoTech = document.getElementById("tecnologias").value;
    const textoImagen = document.getElementById("imagen").value.trim();

    const datosProyecto = {
        title: document.getElementById("titulo").value.trim(),
        description: document.getElementById("descripcion").value.trim(),
        technologies: textoTech ? textoTech.split(",").map(t => t.trim()).filter(Boolean) : [],
        repository: document.getElementById("repositorio").value.trim(),
        images: textoImagen ? [textoImagen] : []
    };

    const url = id ? `${urlApi}/projects/${id}` : `${urlApi}/projects`;
    const metodo = id ? "PUT" : "POST";

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                "auth-token": token,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datosProyecto)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(datos.message || "Error al guardar el proyecto");
        }

        cerrarModal();
        avisar(id ? "¡Proyecto actualizado! ♡" : "¡Proyecto guardado! ♡", "exito");
        cargarProyectos();
    } catch (error) {
        alert(error.message);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar";
    }
});

//botón actualizar de la target
window.editarProyecto = (id) => {
    const proyecto = misProyectos.find(p => p._id === id);
    if (proyecto) {
        abrirModal(true, proyecto);
    }
};

//botón eliminar
window.borrarProyecto = async (id) => {
    if (!confirm("¿Segura que quieres borrar este proyecto? ♡")) return;

    try {
        const respuesta = await fetch(`${urlApi}/projects/${id}`, {
            method: "DELETE",
            headers: {
                "auth-token": token,
                "Authorization": `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            const datos = await respuesta.json();
            throw new Error(datos.message || "No se pudo borrar");
        }

        avisar("Proyecto eliminado ♡", "exito");
        cargarProyectos();
    } catch (error) {
        avisar(error.message, "error");
    }
};

cargarProyectos();