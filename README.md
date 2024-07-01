<div align="center" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh;">
    <img src="/public/favicon.png" alt="Logo de la Clínica Online" width="200" height="200">
    <h1 style="margin-top: 10px; font-weight: 700;">Clinica OnLine</h1>
</div>

La Clínica Online es una plataforma integral diseñada para la gestión eficiente de turnos médicos, atención especializada y administración de pacientes. Esta aplicación facilita tanto a pacientes como a especialistas la organización de consultas y tratamientos de salud de manera eficaz y accesible.

## 📋 Descripción General

La Clínica Online dispone de seis consultorios, dos laboratorios físicos y una sala de espera general. Operando de lunes a viernes de 8:00 a 19:00 y sábados de 8:00 a 14:00, la clínica ofrece servicios a través de profesionales de diversas especialidades, quienes atienden a pacientes con turnos solicitados previamente por la web, permitiendo la selección de profesionales o especialidades específicas.

## 💡 Pantallas Principales y Funcionalidades

### Sprint 1

#### Página de Bienvenida 
- Accesos rápidos al login y registro en el sistema.


#### Registro de Usuarios
- **Pacientes:**
  - Nombre, Apellido, Edad, DNI, Obra Social, Mail, Password.
  - Subida de 2 imágenes para perfil.
- **Especialistas:**
  - Nombre, Apellido, Edad, DNI, Especialidad (con opción de agregar nuevas), Mail, Password.
  - Subida de imagen de perfil.
- Validación de campos según corresponda.

    <img src="/public/readme/registro.png" alt="Logo de la Clínica Online"  height="200">
#### Login
- Acceso seguro al sistema con botones de acceso rápido.
- Validación de usuarios: Especialistas requieren aprobación de administrador y verificación de email; Pacientes deben verificar email al registrarse.

    <img src="/public/readme/login.png" alt="Logo de la Clínica Online"  height="200">
#### Sección Usuarios (Administrador)
- Visualización y gestión de información de usuarios.
- Habilitación/inhabilitación de acceso para Especialistas.
- Creación de nuevos usuarios, incluyendo Administradores.

    <img src="/public/readme/seccion-usuarios.png" alt="Logo de la Clínica Online"  height="200">
### Sprint 2

#### Mis Turnos

##### Paciente
- Visualización de turnos solicitados con filtro por Especialidad y Especialista.
- Acciones disponibles:
  - Cancelar turno con comentario.
  - Ver reseña si está disponible.
  - Completar encuesta de atención.
  - Calificar atención post-turno.

    <img src="/public/readme/mis-turnos-paciente.png" alt="Logo de la Clínica Online"  height="200">
##### Especialista
- Visualización de turnos asignados con filtro por Especialidad y Paciente.
- Acciones disponibles:
  - Cancelar turno con comentario.
  - Rechazar turno con motivo.
  - Aceptar turno pendiente.
  - Finalizar turno con reseña.
    <img src="/public/readme/mis-turnos-especialista.png" alt="Logo de la Clínica Online"  height="200">

#### Turnos (Administrador)
- Visualización de todos los turnos de la clínica con filtro por Especialidad y Especialista.
- Acción de cancelación de turno con comentario.

    <img src="/public/readme/turnos.png" alt="Logo de la Clínica Online"  height="200">
#### Solicitar Turno
- Acceso para Pacientes y Administradores.
- Selección de Especialidad y Especialista.
- Elección de día y horario de consulta dentro de los próximos 15 días según disponibilidad.
- Asignación de paciente por Administrador.

    <img src="/public/readme/solicitar-turno.png" alt="Logo de la Clínica Online"  height="200">
#### Mi Perfil
- Visualización y edición de datos de usuario (nombre, apellido, imágenes, etc.).
- **Especialistas:**
  - Gestión de disponibilidad horaria por especialidad.

    <img src="/public/readme/perfil.png" alt="Logo de la Clínica Online"  height="200">
### Sprint 3

#### Historia Clínica

##### Paciente
- Acceso desde Mi Perfil.
- Registro de atenciones y controles:
  - Datos fijos: Altura, Peso, Temperatura, Presión.
  - Datos dinámicos (hasta tres pares clave-valor personalizables).

##### Administrador
- Acceso desde Sección Usuarios.
- Visualización de historias clínicas de pacientes atendidos al menos una vez por el Especialista.

#### Mejora de Filtro de Turnos
- Búsqueda por cualquier campo del turno, incluyendo datos de la Historia Clínica (datos fijos y dinámicos).

#### Descargas

- **Administrador:** Exportar datos de usuarios a Excel desde Sección Usuarios.
- **Paciente:** Descargar PDF de Historia Clínica con logo de la clínica, título del informe y fecha de emisión.

    <img src="/public/readme/historia-clinica.png" alt="Logo de la Clínica Online"  height="200">
### Sprint 4

#### Gráficos y Estadísticas (Administrador)

- **Log de Ingresos:** Registro de acceso al sistema por usuario, día y horario.
- **Cantidad de Turnos por Especialidad.**
- **Cantidad de Turnos por Día.**
- **Cantidad de Turnos Solicitados por Médico en un Lapso de Tiempo.**
- **Cantidad de Turnos Finalizados por Médico en un Lapso de Tiempo.**

#### Descargas de Informes

- Exportación de gráficos e informes en Excel o PDF.


## ⚙️ Instalación y Uso

1. Clonar el repositorio desde [URL del Repositorio].
2. Instalar las dependencias necesarias: `npm install`.
3. Iniciar la aplicación: `ng serve`.
4. Acceder a [URL local] desde el navegador.
