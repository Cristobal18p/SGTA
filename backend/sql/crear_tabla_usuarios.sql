-- ========================================
-- SCRIPT SQL PARA CREAR TABLA DE USUARIOS
-- ========================================

-- Crear secuencia para usuarios
CREATE SEQUENCE usuarios_seq START WITH 1 INCREMENT BY 1;

-- Crear tabla de usuarios
CREATE TABLE USUARIOS (
    usuario_id NUMBER PRIMARY KEY,
    email VARCHAR2 (255) UNIQUE NOT NULL,
    password_hash VARCHAR2 (255) NOT NULL,
    primer_nombre VARCHAR2 (100) NOT NULL,
    segundo_nombre VARCHAR2 (100),
    primer_apellido VARCHAR2 (100) NOT NULL,
    segundo_apellido VARCHAR2 (100),
    telefono VARCHAR2 (20),
    activo NUMBER (1) DEFAULT 1,
    rol_id NUMBER NOT NULL,
    fecha_creacion DATE DEFAULT SYSDATE,
    fecha_actualizacion DATE DEFAULT SYSDATE,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES ROL (rol_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON USUARIOS (email);

CREATE INDEX idx_usuarios_activo ON USUARIOS (activo);

-- Insertar usuario administrador por defecto
-- 🔧 IMPORTANTE: Cambiar la contraseña en producción
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO
    USUARIOS (
        usuario_id,
        email,
        password_hash,
        primer_nombre,
        primer_apellido,
        activo,
        rol_id
    )
VALUES (
        usuarios_seq.NEXTVAL,
        'admin@tecnotaller.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
        'Administrador',
        'Sistema',
        1,
        1 -- Asumiendo que el rol 1 es administrador
    );

-- Confirmar cambios
COMMIT;

-- Verificar que se creó correctamente
SELECT * FROM USUARIOS WHERE email = 'admin@tecnotaller.com';