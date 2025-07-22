-- ============================================
-- DATOS BÁSICOS PARA EL SISTEMA TECNOTALLER
-- ============================================

-- 1. Tipos de Cliente (ya que no tienes tabla específica, usar configuración)
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'TIPOS_CLIENTE',
        'NATURAL',
        'Persona Natural',
        'Cliente persona física',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'TIPOS_CLIENTE',
        'CORPORATIVO',
        'Persona Jurídica',
        'Cliente empresa o corporación',
        'STRING'
    );

-- 2. Estados generales del sistema
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS',
        'ACTIVO',
        'Activo',
        'Estado activo en el sistema',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS',
        'INACTIVO',
        'Inactivo',
        'Estado inactivo en el sistema',
        'STRING'
    );

-- 3. Años disponibles para vehículos (desde 2020 en adelante)
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'VEHICULOS',
        'ANO_MINIMO',
        '2020',
        'Año mínimo para vehículos',
        'NUMBER'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'VEHICULOS',
        'ANO_MAXIMO',
        TO_CHAR (
            EXTRACT(
                YEAR
                FROM SYSDATE
            ) + 1
        ),
        'Año máximo para vehículos',
        'NUMBER'
    );

-- 4. Unidades de medida para productos
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'UNIDADES_MEDIDA',
        'UNIDAD',
        'Unidad',
        'Producto por unidad',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'UNIDADES_MEDIDA',
        'LITRO',
        'Litro',
        'Producto por litros',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'UNIDADES_MEDIDA',
        'GALON',
        'Galón',
        'Producto por galones',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'UNIDADES_MEDIDA',
        'METRO',
        'Metro',
        'Producto por metros',
        'STRING'
    );

-- 5. Niveles de prioridad para citas
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'PRIORIDADES_CITA',
        'BAJA',
        'Baja',
        'Prioridad baja',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'PRIORIDADES_CITA',
        'NORMAL',
        'Normal',
        'Prioridad normal',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'PRIORIDADES_CITA',
        'ALTA',
        'Alta',
        'Prioridad alta',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'PRIORIDADES_CITA',
        'URGENTE',
        'Urgente',
        'Prioridad urgente',
        'STRING'
    );

-- 6. Estados de facturas
INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS_FACTURA',
        'PENDIENTE',
        'Pendiente',
        'Factura pendiente de pago',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS_FACTURA',
        'PAGADA',
        'Pagada',
        'Factura pagada completamente',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS_FACTURA',
        'VENCIDA',
        'Vencida',
        'Factura vencida sin pago',
        'STRING'
    );

INSERT INTO
    CONFIGURACION_SISTEMA (
        CATEGORIA,
        CLAVE,
        VALOR,
        DESCRIPCION,
        TIPO_DATO
    )
VALUES (
        'ESTADOS_FACTURA',
        'CANCELADA',
        'Cancelada',
        'Factura cancelada',
        'STRING'
    );

COMMIT;