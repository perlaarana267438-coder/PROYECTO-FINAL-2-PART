const urlApi = "https://portfolio-api-three-black.vercel.app/api/v1";

//si ya hay token guardadomandar directo al panel
if (localStorage.getItem("token")) {
    window.location.replace("home.html");
}

function mostrarMensaje(texto, tipo = "error") {
    const cajaMensaje = document.getElementById("mensaje");
    if (!cajaMensaje) return;
    cajaMensaje.textContent = texto;
    cajaMensaje.className = tipo === "exito" ? "alerta alerta-exito" : "alerta alerta-error";
}

//registro de usuario
const formRegistro = document.getElementById("form-registro");
if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const boton = document.getElementById("btn-registrar");
        boton.disabled = true;
        boton.textContent = "Registrando...";

        const datosUsuario = {
            name: document.getElementById("nombre").value.trim(),
            email: document.getElementById("correo").value.trim(),
            itsonId: document.getElementById("id-itson").value.trim(),
            password: document.getElementById("contrasena").value
        };

        try {
            const respuesta = await fetch(`${urlApi}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosUsuario)
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.message || "No se pudo crear la cuenta");
            }

            mostrarMensaje("Cuenta creada, ya puedes iniciar sesión ♡", "exito");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } catch (error) {
            mostrarMensaje(error.message);
        } finally {
            boton.disabled = false;
            boton.textContent = "Registrarme";
        }
    });
}

//iniciar sesión
const formLogin = document.getElementById("form-login");
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const boton = document.getElementById("btn-entrar");
        boton.disabled = true;
        boton.textContent = "Entrando...";

        const credenciales = {
            email: document.getElementById("correo").value.trim(),
            password: document.getElementById("contrasena").value
        };

        try {
            const respuesta = await fetch(`${urlApi}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credenciales)
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(datos.message || "Correo o contraseña incorrectos");
            }

            //guardar token y usuario en el nav
            localStorage.setItem("token", datos.token);
            if (datos.user) {
                localStorage.setItem("usuario", JSON.stringify(datos.user));
            }

            window.location.href = "home.html";

        } catch (error) {
            mostrarMensaje(error.message);
        } finally {
            boton.disabled = false;
            boton.textContent = "Entrar";
        }
    });
}